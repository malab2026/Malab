'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile } from "fs/promises"
import path from "path"
import { broadcastNotification, createNotification } from "./notification-actions"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"

const FieldSchema = z.object({
    name: z.string().min(1),
    nameEn: z.string().optional().or(z.literal('')).nullable(),
    price: z.coerce.number().min(0),
    address: z.string().optional().nullable(),
    addressEn: z.string().optional().or(z.literal('')).nullable(),
    locationUrl: z.string().url().optional().or(z.literal('')).nullable(),
    description: z.string().optional().nullable(),
    descriptionEn: z.string().optional().nullable(),
    cancellationPolicy: z.string().optional().nullable(),
    cancellationPolicyEn: z.string().optional().nullable(),
    ownerId: z.string().optional().or(z.literal('')).nullable(),
    newManagerName: z.string().optional().nullable(),
    newManagerEmail: z.string().email().optional().or(z.literal('')).nullable(),
    newManagerPassword: z.string().min(6).optional().or(z.literal('')).nullable(),
    clubId: z.string().optional().or(z.literal('')).nullable(),
})

export async function createField(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const file = formData.get("image1") as File
    if (!file || file.size === 0) {
        return { message: "Main Image is required", success: false }
    }

    const validatedFields = FieldSchema.safeParse({
        name: formData.get("name"),
        nameEn: formData.get("nameEn"),
        price: formData.get("price"),
        address: formData.get("address"),
        addressEn: formData.get("addressEn"),
        locationUrl: formData.get("locationUrl"),
        description: formData.get("description"),
        descriptionEn: formData.get("descriptionEn"),
        cancellationPolicy: formData.get("cancellationPolicy"),
        cancellationPolicyEn: formData.get("cancellationPolicyEn"),
        ownerId: formData.get("ownerId"),
        newManagerName: formData.get("newManagerName"),
        newManagerEmail: formData.get("newManagerEmail"),
        newManagerPassword: formData.get("newManagerPassword"),
        clubId: formData.get("clubId"),
    })

    if (!validatedFields.success) {
        return {
            message: "Invalid Inputs",
            success: false,
            errors: validatedFields.error.flatten().fieldErrors
        }
    }

    const {
        name, nameEn, price, address, addressEn, locationUrl, description, descriptionEn,
        cancellationPolicy, cancellationPolicyEn,
        ownerId, newManagerName, newManagerEmail, newManagerPassword
    } = validatedFields.data

    let finalOwnerId = ownerId || null

    // Handle New Owner Creation if details provided
    if (newManagerEmail && newManagerPassword && newManagerName) {
        try {
            const existing = await prisma.user.findUnique({ where: { email: newManagerEmail } })
            if (existing) return { message: "User with this email already exists", success: false }

            const hashedPassword = await bcrypt.hash(newManagerPassword, 10)
            // Generate a random phone number for now since it's required
            const randomPhone = "010" + Math.floor(10000000 + Math.random() * 90000000).toString()
            const newUser = await prisma.user.create({
                data: {
                    name: newManagerName,
                    email: newManagerEmail,
                    password: hashedPassword,
                    phone: randomPhone,
                    role: 'owner'
                }
            })
            finalOwnerId = newUser.id
        } catch (e) {
            console.error(e)
            return { message: "Failed to create manager account", success: false }
        }
    }

    // Handle Multiple Image Uploads (Base64)
    const images: string[] = ['', '', ''];
    const imageFiles = [
        formData.get("image1") as File,
        formData.get("image2") as File,
        formData.get("image3") as File
    ];

    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer())
                if (buffer.length > 4 * 1024 * 1024) continue; // Skip if too large or handle error
                const base64String = buffer.toString('base64')
                const mimeType = file.type || 'image/jpeg'
                images[i] = `data:${mimeType};base64,${base64String}`
            } catch (error) {
                console.error(`Error processing image ${i + 1}`, error)
            }
        }
    }

    if (!images[0]) {
        return { message: "First image is required", success: false }
    }

    try {
        const clubId = formData.get("clubId") as string || null

        await prisma.field.create({
            data: {
                name,
                nameEn: nameEn || null,
                pricePerHour: price,
                address: address || null,
                addressEn: addressEn || null,
                locationUrl: locationUrl || null,
                description: description || null,
                descriptionEn: descriptionEn || null,
                cancellationPolicy: cancellationPolicy || "No cancellation policy specified.",
                cancellationPolicyEn: cancellationPolicyEn || null,
                imageUrl: images[0],
                imageUrl2: images[1] || null,
                imageUrl3: images[2] || null,
                ownerId: finalOwnerId,
                clubId: clubId || null,
            }
        } as any)
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }

    revalidatePath('/admin')
    revalidatePath('/fields')

    // Notify all users about new field
    await broadcastNotification(
        "ملعب جديد متاح! 🏟️",
        `تمت إضافة ملعب "${name}" في منطقتك. احجز الآن!`,
        "FIELD"
    )

    return { message: "Field Created Successfully!", success: true }
}

export async function updateField(fieldId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const validatedFields = FieldSchema.safeParse({
        name: formData.get("name"),
        nameEn: formData.get("nameEn"),
        price: formData.get("price"),
        address: formData.get("address"),
        addressEn: formData.get("addressEn"),
        locationUrl: formData.get("locationUrl"),
        description: formData.get("description"),
        descriptionEn: formData.get("descriptionEn"),
        cancellationPolicy: formData.get("cancellationPolicy"),
        cancellationPolicyEn: formData.get("cancellationPolicyEn"),
        ownerId: formData.get("ownerId"),
        clubId: formData.get("clubId"),
    })

    if (!validatedFields.success) {
        return {
            message: "Invalid Inputs",
            success: false,
            errors: validatedFields.error.flatten().fieldErrors
        }
    }

    const { name, nameEn, price, address, addressEn, locationUrl, description, descriptionEn,
        cancellationPolicy, cancellationPolicyEn, ownerId, clubId } = validatedFields.data

    // Handle Multiple Image Uploads (Base64) - Only update if new image provided
    const imageUpdates: any = {}
    const imageFields = ['image1', 'image2', 'image3']
    const schemaFields = ['imageUrl', 'imageUrl2', 'imageUrl3']

    for (let i = 0; i < imageFields.length; i++) {
        const file = formData.get(imageFields[i]) as File
        if (file && file.size > 0) {
            try {
                const buffer = Buffer.from(await file.arrayBuffer())
                if (buffer.length > 4 * 1024 * 1024) continue;
                const base64String = buffer.toString('base64')
                const mimeType = file.type || 'image/jpeg'
                imageUpdates[schemaFields[i]] = `data:${mimeType};base64,${base64String}`
            } catch (error) {
                console.error(`Error processing image ${i + 1}`, error)
            }
        }
    }

    try {
        await prisma.field.update({
            where: { id: fieldId },
            data: {
                name,
                nameEn: nameEn || null,
                pricePerHour: price,
                address: address || null,
                addressEn: addressEn || null,
                locationUrl: locationUrl || null,
                description: description || null,
                descriptionEn: descriptionEn || null,
                cancellationPolicy: cancellationPolicy || null,
                cancellationPolicyEn: cancellationPolicyEn || null,
                ...imageUpdates,
                ownerId: ownerId || null,
                clubId: clubId || null,
            }
        } as any)
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }

    revalidatePath('/admin')
    revalidatePath('/fields')
    revalidatePath(`/fields/${fieldId}`)
    return { message: "Field Updated Successfully!", success: true }
}


export async function updateBookingStatus(bookingId: string, status: "CONFIRMED" | "REJECTED", formData: FormData) {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized" }
    }

    try {
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: { field: true }
        })

        // Notify user about booking status change
        const bookingDate = formatInEgyptDate(booking.startTime)
        const bookingTime = formatInEgyptTime(booking.startTime)

        const title = status === "CONFIRMED" ? "تم تأكيد حجزك! ✅" : "تم رفض حجزك ❌"
        const message = status === "CONFIRMED"
            ? `تمت الموافقة على حجزك في ملعب ${booking.field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}. نتمنى لك مباراة ممتعة!`
            : `للأسف تم رفض حجزك في ملعب ${booking.field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}. يرجى التواصل مع الإدارة للمزيد من التفاصيل.`

        await createNotification(booking.userId, title, message, "BOOKING")

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        revalidatePath(`/fields/${booking.fieldId}`)
        return { success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error" }
    }
}

export async function assignOwner(fieldId: string, ownerId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        await prisma.field.update({
            where: { id: fieldId },
            data: { ownerId: ownerId || null }
        })
        revalidatePath('/admin')
        return { message: "Owner assigned successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}
const CreateOwnerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function createOwnerAccount(prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const validatedFields = CreateOwnerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return { message: "Invalid fields", success: false }
    }

    const { name, email, phone, password } = validatedFields.data

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'owner',
            },
        })

        revalidatePath('/admin')
        return { message: "Owner account created successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number is required"),
    role: z.enum(['user', 'owner', 'admin'] as const),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
})

export async function updateUser(userId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const validatedFields = UpdateUserSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return { message: "Invalid fields", success: false, errors: validatedFields.error.flatten().fieldErrors }
    }

    const { name, email, phone, role, password } = validatedFields.data

    try {
        const updateData: any = {
            name,
            email: email || null,
            phone,
            role,
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        })

        revalidatePath('/admin')
        return { message: "User updated successfully", success: true }
    } catch (e: any) {
        console.error(e)
        if (e.code === 'P2002') {
            return { message: "Email or Phone already exists", success: false }
        }
        return { message: "Database Error", success: false }
    }
}

export async function updateUserRole(userId: string, role: string, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        })
        revalidatePath('/admin')
        return { message: "User role updated successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function processCancellationRequest(
    bookingId: string,
    action: "APPROVE" | "REJECT",
    refundAmount?: number,
    adminNote?: string
) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        const status = action === "APPROVE" ? "CANCELLED" : "CONFIRMED"

        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
                refundAmount: refundAmount || 0,
                cancellationAdminNote: adminNote || null
            },
            include: { field: true }
        })

        // Notify user about cancellation status change
        const bookingDate = formatInEgyptDate(booking.startTime)
        const bookingTime = formatInEgyptTime(booking.startTime)

        const title = action === "APPROVE" ? "تم قبول طلب الإلغاء ✅" : "تم رفض طلب الإلغاء ❌"
        const message = action === "APPROVE"
            ? `تم قبول طلب إلغاء حجزك في ملعب ${booking.field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}.`
            : `تم رفض طلب إلغاء حجزك في ملعب ${booking.field.name} بتاريخ ${bookingDate} الساعة ${bookingTime}.`

        await createNotification(booking.userId, title, message, "BOOKING")

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        return { message: `Cancellation ${action.toLowerCase()}d successfully`, success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function deleteField(fieldId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        await prisma.field.delete({
            where: { id: fieldId }
        })

        revalidatePath('/admin')
        revalidatePath('/fields')
        return { message: "Field deleted successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to delete field. It might have active bookings.", success: false }
    }
}

export async function getFinancialReport(filters: { startDate?: string, endDate?: string, fieldId?: string }) {
    const session = await auth()
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
        throw new Error("Unauthorized")
    }

    const { startDate, endDate, fieldId } = filters

    const where: any = {
        status: { in: ['CONFIRMED', 'CANCELLED'] }
    }

    if (fieldId) {
        where.fieldId = fieldId
    }

    // Security: If owner, strictly limit to their fields
    if (session.user.role === 'owner') {
        where.field = { ownerId: session.user.id }
    }

    if (startDate || endDate) {
        where.startTime = {}
        if (startDate) where.startTime.gte = new Date(`${startDate}T00:00:00`)
        if (endDate) where.startTime.lte = new Date(`${endDate}T23:59:59`)
    }

    try {
        const bookings = await prisma.booking.findMany({
            where,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                totalPrice: true,
                refundAmount: true,
                isSettled: true,
                field: {
                    select: {
                        id: true,
                        name: true,
                        pricePerHour: true
                    }
                }
            },
            orderBy: { startTime: 'desc' }
        })

        const report: any = {
            totalGross: 0,
            totalRefunds: 0,
            totalNet: 0,
            totalBookings: bookings.length,
            fieldBreakdown: {} as Record<string, any>,
            bookings: bookings // Include individual bookings for the UI
        }

        bookings.forEach((booking: any) => {
            const durationHours = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60)
            const gross = booking.totalPrice || (durationHours * booking.field.pricePerHour)
            const refund = booking.status === 'CANCELLED' ? (booking.refundAmount || 0) : 0
            const net = gross - refund

            report.totalGross += gross
            report.totalRefunds += refund
            report.totalNet += net

            if (!report.fieldBreakdown[booking.field.id]) {
                report.fieldBreakdown[booking.field.id] = {
                    name: booking.field.name,
                    bookings: 0,
                    hours: 0,
                    gross: 0,
                    refunds: 0,
                    net: 0,
                    settled: 0,
                    pending: 0
                }
            }

            const fb = report.fieldBreakdown[booking.field.id]
            fb.bookings += 1
            fb.hours += durationHours
            fb.gross += gross
            fb.refunds += refund
            fb.net += net

            if (booking.isSettled) {
                fb.settled += net
            } else {
                fb.pending += net
            }
        })

        return report
    } catch (error) {
        console.error("Financial Report Error:", error)
        return {
            totalGross: 0,
            totalRefunds: 0,
            totalNet: 0,
            totalBookings: 0,
            fieldBreakdown: {},
            bookings: [],
            error: "Failed to load financial data. Please ensure database is migrated."
        }
    }
}

export async function markBookingsSettled(bookingIds: string[]) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        await prisma.booking.updateMany({
            where: { id: { in: bookingIds } },
            data: { isSettled: true }
        })

        revalidatePath('/admin/accounts')
        return { message: "Bookings marked as settled", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function getGlobalSettings() {
    try {
        const settings = await prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: {},
            create: {
                id: 'global',
                serviceFee: 10.0,
                adminPhone: "201009410112",
                whatsappEnabled: true,
                whatsappInstanceId: null,
                whatsappToken: null
            }
        })
        return { success: true, settings }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Failed to fetch settings" }
    }
}

export async function updateGlobalSettings(prevState: any, formData: FormData) {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const serviceFee = parseFloat(formData.get("serviceFee") as string)
    const adminPhone = formData.get("adminPhone") as string
    const whatsappEnabled = formData.get("whatsappEnabled") === "true"
    const whatsappInstanceId = formData.get("whatsappInstanceId") as string || null
    const whatsappToken = formData.get("whatsappToken") as string || null

    if (isNaN(serviceFee)) {
        return { message: "Invalid service fee amount", success: false }
    }

    try {
        await prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: { serviceFee, adminPhone, whatsappEnabled, whatsappInstanceId, whatsappToken },
            create: { id: 'global', serviceFee, adminPhone, whatsappEnabled, whatsappInstanceId, whatsappToken }
        })

        revalidatePath('/admin')
        return { message: "Settings updated successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function deleteBookingAdmin(bookingId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        const booking = await prisma.booking.delete({
            where: { id: bookingId }
        })

        revalidatePath('/admin')
        revalidatePath('/admin/accounts')
        revalidatePath('/dashboard')
        revalidatePath(`/fields/${booking.fieldId}`)
        return { message: "Booking deleted successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to delete booking", success: false }
    }
}
