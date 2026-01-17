'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { writeFile } from "fs/promises"
import path from "path"
import { z } from "zod"
import * as fs from "fs"

const SlotSchema = z.object({
    date: z.string(),
    startTime: z.string(),
    duration: z.coerce.number().min(1).max(3),
})

const MultiBookingSchema = z.object({
    fieldId: z.string(),
    slots: z.array(SlotSchema).min(1),
})

const OCCUPYING_STATUSES = ['PENDING', 'CONFIRMED', 'CANCEL_REQUESTED', 'BLOCKED']

export async function checkAvailability(fieldId: string, slots: any[]) {
    try {
        for (const slot of slots) {
            const startDateTime = new Date(`${slot.date}T${slot.startTime}:00`)
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
        const bookings = await prisma.booking.findMany({
            where: {
                fieldId,
                status: { in: OCCUPYING_STATUSES },
                startTime: {
                    gte: new Date(`${startDate}T00:00:00`),
                    lte: new Date(`${endDate}T23:59:59`),
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
    console.log(`[${new Date().toISOString()}] ACTION START`)

    try {
        const session = await auth()
        if (!session || !session.user) {
            console.log(`[${new Date().toISOString()}] No Session`)
            return { message: "You must be logged in to book." }
        }

        const isOwner = session.user.role === 'owner' || session.user.role === 'admin'
        const file = formData.get("receipt") as File

        // Receipt is required for regular users, but not for owners/admins blocking a slot
        if (!isOwner && (!file || file.size === 0)) {
            return { message: "Please upload a receipt." }
        }

        const slotsJson = formData.get("slots") as string
        console.log(`[${new Date().toISOString()}] Slots JSON: ${slotsJson}`)

        let parsedSlots = []
        try {
            parsedSlots = JSON.parse(slotsJson || '[]')
        } catch (e: any) {
            console.log(`[${new Date().toISOString()}] JSON Parse Error: ${e.message}`)
            return { message: "Invalid booking data format." }
        }

        // Fallback for single slot if JSON is empty but form fields exist
        if (parsedSlots.length === 0) {
            const date = formData.get("date") as string
            const startTime = formData.get("startTime") as string
            const duration = formData.get("duration")
            if (date && startTime) {
                parsedSlots.push({ date, startTime, duration: Number(duration) || 1 })
                console.log(`[${new Date().toISOString()}] Using fallback single slot`)
            }
        }

        const validatedFields = MultiBookingSchema.safeParse({
            fieldId: formData.get("fieldId"),
            slots: parsedSlots
        })

        if (!validatedFields.success) {
            console.log(`[${new Date().toISOString()}] Validation Failed: ${validatedFields.error.message}`)
            return { message: "Validation failed for some slots." }
        }

        const { fieldId, slots } = validatedFields.data
        const field = await prisma.field.findUnique({ where: { id: fieldId }, select: { pricePerHour: true } })
        if (!field) return { message: "Field not found." }

        const bookingData: any[] = []

        for (const slot of slots) {
            const startDateTime = new Date(`${slot.date}T${slot.startTime}:00`)
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
                console.log(`[${new Date().toISOString()}] Conflict at ${slot.date} ${slot.startTime}`)
                return { message: `Slot at ${slot.startTime} on ${slot.date} is already taken.` }
            }

            const settings = await prisma.globalSettings.upsert({
                where: { id: 'global' },
                update: {},
                create: { id: 'global', serviceFee: 10.0 }
            })
            const globalServiceFee = settings.serviceFee

            // Calculate total price for the entire booking to store consistently
            // However, since we store each slot as a row, we'll apply the fee to the FIRST slot
            // and the others will have 0 service fee, making the total sum correct.
            const isFirstSlot = bookingData.length === 0
            const serviceFee = isFirstSlot ? globalServiceFee : 0
            const slotPrice = field.pricePerHour * slot.duration
            const totalPrice = slotPrice + serviceFee

            bookingData.push({
                userId: session.user.id,
                fieldId,
                startTime: startDateTime,
                endTime: endDateTime,
                status: session.user.role === "admin" ? "CONFIRMED" : "PENDING",
                serviceFee,
                totalPrice
            })
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
                console.log(`[${new Date().toISOString()}] Generated Base64 Receipt (size: ${receiptUrl.length})`)
            } catch (error) {
                console.log(`[${new Date().toISOString()}] Receipt Processing Error: ${error}`)
                return { message: "Failed to process receipt." }
            }
        }

        await prisma.$transaction(async (tx) => {
            for (const data of bookingData) {
                await tx.booking.create({
                    data: {
                        ...data,
                        receiptUrl
                    }
                })
            }
        })
        console.log(`[${new Date().toISOString()}] Transaction Success: Created ${bookingData.length} bookings`)
    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        console.log(`[${new Date().toISOString()}] Global Error: ${e.message}`)
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

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "CANCEL_REQUESTED",
                cancellationReason: reason
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/admin')
        return { message: "Cancellation request sent successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}
