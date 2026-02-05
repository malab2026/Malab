'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { writeFile } from "fs/promises"
import path from "path"
import { z } from "zod"
import * as fs from "fs"
import { createNotification } from "./notification-actions"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"

const SlotSchema = z.object({
    date: z.string(),
    startTime: z.string(),
    duration: z.coerce.number().min(1).max(3),
    isoString: z.string().optional(),
})

const MultiBookingSchema = z.object({
    fieldId: z.string(),
    slots: z.array(SlotSchema).min(1),
})

const OCCUPYING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCEL_REQUESTED', 'BLOCKED']

export async function checkAvailability(fieldId: string, slots: any[]) {
    try {
        for (const slot of slots) {
            const startDateTime = slot.isoString ? new Date(slot.isoString) : new Date(`${slot.date}T${slot.startTime}:00`)
            const endDateTime = new Date(startDateTime.getTime() + slot.duration * 60 * 60 * 1000)

            if (isNaN(startDateTime.getTime())) {
                return { success: false, message: "Invalid date or time." }
            }

            const conflict = await prisma.booking.findFirst({
                where: {
                    fieldId,
                    status: { in: OCCUPYING_STATUSES },
                    OR: [
                        { startTime: { lt: endDateTime }, endTime: { gt: startDateTime } },
                    ],
                },
            })

            if (conflict) {
                return { success: false, message: `Slot at ${slot.startTime} on ${slot.date} is already taken.` }
            }
        }
        return { success: true }
    } catch (e) {
        return { success: false, message: "Error checking availability." }
    }
}

export async function getFieldBookings(fieldId: string, startDate: string, endDate: string) {
    try {
        const searchEndDate = new Date(`${endDate}T23:59:59`)
        searchEndDate.setHours(searchEndDate.getHours() + 6) // Include early morning slots of the next day

        const bookings = await prisma.booking.findMany({
            where: {
                fieldId,
                status: { in: OCCUPYING_STATUSES },
                startTime: {
                    gte: new Date(`${startDate}T00:00:00`),
                    lte: searchEndDate,
                },
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
            },
        })
        return { success: true, bookings }
    } catch (e) {
        return { success: false, message: "Error fetching bookings." }
    }
}


export async function createBooking(prevState: any, formData: FormData) {

    try {
        const session = await auth()
        if (!session || !session.user) {
            return { message: "You must be logged in to book." }
        }

        const isOwner = session.user.role === 'owner' || session.user.role === 'admin'
        const file = formData.get("receipt") as File

        // Receipt is required for regular users, but not for owners/admins blocking a slot
        if (!isOwner && (!file || file.size === 0)) {
            return { message: "Please upload a receipt." }
        }

        const slotsJson = formData.get("slots") as string

        let parsedSlots = []
        try {
            parsedSlots = JSON.parse(slotsJson || '[]')
        } catch (e: any) {
            return { message: "Invalid booking data format." }
        }

        // Fallback for single slot if JSON is empty but form fields exist
        if (parsedSlots.length === 0) {
            const date = formData.get("date") as string
            const startTime = formData.get("startTime") as string
            const duration = formData.get("duration")
            if (date && startTime) {
                parsedSlots.push({ date, startTime, duration: Number(duration) || 1 })
            }
        }

        const validatedFields = MultiBookingSchema.safeParse({
            fieldId: formData.get("fieldId"),
            slots: parsedSlots
        })

        if (!validatedFields.success) {
            return { message: "Validation failed for some slots." }
        }

        const { fieldId, slots } = validatedFields.data
        const field = await prisma.field.findUnique({ where: { id: fieldId }, select: { name: true, pricePerHour: true } })
        if (!field) return { message: "Field not found." }

        // Group slots into continuous blocks to apply service fee correctly on server-side
        const sortedSlotsForData = [...slots].sort((a, b) => {
            const timeA = a.isoString ? new Date(a.isoString).getTime() : new Date(`${a.date}T${a.startTime}:00`).getTime()
            const timeB = b.isoString ? new Date(b.isoString).getTime() : new Date(`${b.date}T${b.startTime}:00`).getTime()
            return timeA - timeB
        })

        const settings = await prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: {},
            create: { id: 'global', serviceFee: 10.0 }
        })
        const globalServiceFee = settings.serviceFee

        const isBlock = formData.get("isBlock") === "true"
        const isRecurring = formData.get("isRecurring") === "true" && isBlock
        const bookingData: any[] = []
        let lastEndTimestamp = 0

        for (const slot of sortedSlotsForData) {
            const startDateTime = slot.isoString ? new Date(slot.isoString) : new Date(`${slot.date}T${slot.startTime}:00`)
            const endDateTime = new Date(startDateTime.getTime() + slot.duration * 60 * 60 * 1000)

            if (isNaN(startDateTime.getTime())) {
                return { message: "Invalid date or time." }
            }

            const conflict = await prisma.booking.findFirst({
                where: {
                    fieldId,
                    status: { in: OCCUPYING_STATUSES },
                    OR: [
                        { startTime: { lt: endDateTime }, endTime: { gt: startDateTime } },
                    ],
                },
            })

            if (conflict) {
                return { message: `Slot at ${slot.startTime} on ${slot.date} is already taken.` }
            }

            // Determine if this is the start of a new block
            const isNewBlock = startDateTime.getTime() !== lastEndTimestamp
            const serviceFee = isNewBlock ? globalServiceFee : 0
            const slotPrice = field.pricePerHour * slot.duration
            const totalPrice = slotPrice + serviceFee

            bookingData.push({
                userId: session.user.id,
                fieldId,
                startTime: startDateTime,
                endTime: endDateTime,
                status: isBlock ? "BLOCKED" : "PENDING",
                serviceFee,
                totalPrice
            })

            lastEndTimestamp = endDateTime.getTime()
        }

        let receiptUrl = null
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer())
                if (buffer.length > 4 * 1024 * 1024) { // 4MB limit check before encoding
                    return { message: "File is too large (max 4MB)." }
                }
                const base64String = buffer.toString('base64')
                const mimeType = file.type || 'image/jpeg' // Default fallback
                receiptUrl = `data:${mimeType};base64,${base64String}`
            } catch (error) {
                return { message: "Failed to process receipt." }
            }
        }

        await prisma.$transaction(async (tx) => {
            const weeksToCreate = isRecurring ? 12 : 1 // Create for 3 months if recurring

            for (let week = 0; week < weeksToCreate; week++) {
                const weekOffset = week * 7 * 24 * 60 * 60 * 1000

                for (const data of bookingData) {
                    const startTime = new Date(data.startTime.getTime() + weekOffset)
                    const endTime = new Date(data.endTime.getTime() + weekOffset)

                    // For recurring, we should also check availability for all weeks
                    if (week > 0) {
                        const conflict = await tx.booking.findFirst({
                            where: {
                                fieldId,
                                status: { in: OCCUPYING_STATUSES },
                                OR: [
                                    { startTime: { lt: endTime }, endTime: { gt: startTime } },
                                ],
                            },
                        })
                        if (conflict) continue // Skip conflicting weeks for recurring blocks
                    }

                    await tx.booking.create({
                        data: {
                            ...data,
                            startTime,
                            endTime,
                            receiptUrl
                        }
                    })
                }
            }
        })

        // Notify user about booking creation
        const firstSlot = sortedSlotsForData[0]
        const bookingDate = firstSlot.date
        const bookingTime = firstSlot.startTime

        const title = isBlock ? "تم حجز الملعب (إغلاق) 🔒" : "تم استلام طلب حجزك ⏳"
        const message = isBlock
            ? `تم إغلاق الملعب "${field.name}" بتاريخ ${bookingDate} الساعة ${bookingTime}.`
            : `تم استلام طلب حجزك في ملعب ${field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}. يرجى انتظار التأكيد.`

        await createNotification(session.user.id, title, message, "BOOKING")

        // Notify Owner and Admin via WhatsApp (Non-blocking)
        if (!isBlock) {
            const fieldWithOwner = await prisma.field.findUnique({
                where: { id: fieldId },
                select: {
                    owner: { select: { phone: true, email: true, name: true } }
                }
            })

            const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } })

            if (settings?.whatsappEnabled && settings?.whatsappInstanceId && settings?.whatsappToken) {
                const { sendWhatsAppAPI } = await import('@/lib/whatsapp')
                const userName = session.user.name || 'مستخدم'
                const ownerMessage = `🔔 حجز جديد!\n\n👤 العميل: ${userName}\n🏟️ الملعب: ${field.name}\n📅 التاريخ: ${bookingDate}\n⏰ الوقت: ${bookingTime}\n\nيرجى مراجعة لوحة التحكم للموافقة.`

                // Notify Field Owner
                if (fieldWithOwner?.owner?.phone) {
                    sendWhatsAppAPI(
                        fieldWithOwner.owner.phone,
                        ownerMessage,
                        settings.whatsappInstanceId,
                        settings.whatsappToken
                    ).catch(err => console.error('WhatsApp Owner Notification Error:', err))
                }

                // Notify Admin
                if (settings.adminPhone) {
                    sendWhatsAppAPI(
                        settings.adminPhone,
                        ownerMessage,
                        settings.whatsappInstanceId,
                        settings.whatsappToken
                    ).catch(err => console.error('WhatsApp Admin Notification Error:', err))
                }
            }

            // Send Email Notifications (Collect promises to await before redirect)
            if (settings?.emailEnabled && settings?.emailApiKey && settings?.emailFromAddress) {
                const { sendBookingNotificationEmail } = await import('@/lib/email')
                const userName = session.user.name || 'مستخدم'
                const emailPromises: Promise<any>[] = []

                // Prepare SMTP config if available
                const smtpConfig = (settings.emailSmtpHost && settings.emailSmtpUser && settings.emailSmtpPass) ? {
                    host: settings.emailSmtpHost,
                    port: settings.emailSmtpPort || 587,
                    user: settings.emailSmtpUser,
                    pass: settings.emailSmtpPass,
                    secure: settings.emailSmtpSecure || false
                } : null

                // Default email settings
                const emailApiKey = settings.emailApiKey || null
                const emailFromAddress = settings.emailFromAddress || 'noreply@malaeb.com'

                // Notify Field Owner via Email
                const ownerEmail = fieldWithOwner?.owner?.email
                if (ownerEmail) {
                    emailPromises.push(
                        sendBookingNotificationEmail(
                            ownerEmail,
                            userName,
                            field.name,
                            bookingDate,
                            bookingTime,
                            emailApiKey,
                            emailFromAddress,
                            smtpConfig
                        ).catch(err => console.error('Email Owner Notification Error:', err))
                    )
                }

                // Notify All Admins via Email
                const admins = await prisma.user.findMany({
                    where: { role: 'admin' },
                    select: { email: true }
                })

                admins.forEach(admin => {
                    if (admin.email) {
                        emailPromises.push(
                            sendBookingNotificationEmail(
                                admin.email,
                                userName,
                                field.name,
                                bookingDate,
                                bookingTime,
                                emailApiKey,
                                emailFromAddress,
                                smtpConfig
                            ).catch(err => console.error('Email Admin Notification Error:', err))
                        )
                    }
                })

                // Notify Customer via Email
                if (session.user.email) {
                    emailPromises.push(
                        sendBookingNotificationEmail(
                            session.user.email,
                            userName,
                            field.name,
                            bookingDate,
                            bookingTime,
                            emailApiKey,
                            emailFromAddress,
                            smtpConfig
                        ).catch(err => console.error('Email Customer Notification Error:', err))
                    )
                }

                // Await all email notifications before redirection to prevent serverless function termination
                if (emailPromises.length > 0) {
                    await Promise.allSettled(emailPromises)
                }
            }
        }

    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        return { message: "An error occurred while creating your booking." }
    }

    revalidatePath('/dashboard')
    revalidatePath('/owner')
    revalidatePath(`/fields/${formData.get('fieldId')}`)
    redirect('/dashboard')
}

export async function cancelBooking(bookingId: string) {
    const session = await auth()
    if (!session || !session.user) return { message: "Unauthorized" }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking || booking.userId !== session.user.id) {
            return { message: "Booking not found or unauthorized" }
        }

        if (booking.status !== "PENDING") {
            return { message: "Only pending bookings can be cancelled" }
        }

        await prisma.booking.delete({
            where: { id: bookingId }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/fields/${booking.fieldId}`)
        return { success: true }
    } catch (e) {
        return { message: "Database Error" }
    }
}

export async function updateBooking(bookingId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || !session.user) return { message: "Unauthorized" }

    const validatedFields = SlotSchema.safeParse({
        date: formData.get("date"),
        startTime: formData.get("startTime"),
        duration: formData.get("duration"),
    })

    if (!validatedFields.success) {
        return { message: "Invalid Inputs." }
    }

    const { date, startTime, duration } = validatedFields.data
    const startDateTime = new Date(`${date}T${startTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000)

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking || booking.userId !== session.user.id) {
            return { message: "Booking not found or unauthorized" }
        }

        if (booking.status !== "PENDING") {
            return { message: "Only pending bookings can be edited" }
        }

        // Check for conflicts excluding current booking
        const conflict = await prisma.booking.findFirst({
            where: {
                fieldId: booking.fieldId,
                id: { not: bookingId },
                status: { in: OCCUPYING_STATUSES },
                OR: [
                    {
                        startTime: { lt: endDateTime },
                        endTime: { gt: startDateTime },
                    },
                ],
            },
        })

        if (conflict) {
            return { message: "This time slot is already booked." }
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                startTime: startDateTime,
                endTime: endDateTime,
            }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/fields/${booking.fieldId}`)
    } catch (e) {
        return { message: "Database Error" }
    }

    redirect('/dashboard')
}

export async function requestCancellation(bookingId: string, reason: string) {
    const session = await auth()
    if (!session) return { message: "Unauthorized", success: false }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking || booking.userId !== session.user.id) {
            return { message: "Booking not found", success: false }
        }

        if (booking.status === "CANCELLED" || booking.status === "CANCEL_REQUESTED") {
            return { message: "Cancellation already requested or processed", success: false }
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCEL_REQUESTED",
                cancellationReason: reason
            },
            include: { field: true }
        })

        // Notify user about cancellation request
        const bookingDate = formatInEgyptDate(updatedBooking.startTime)
        const bookingTime = formatInEgyptTime(updatedBooking.startTime)

        await createNotification(
            session.user.id,
            "تم إرسال طلب إلغاء ⏳",
            `تم إرسال طلب إلغاء حجزك في ملعب ${updatedBooking.field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}.`,
            "BOOKING"
        )

        revalidatePath('/dashboard')
        revalidatePath('/admin')
        return { message: "Cancellation request sent successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}
