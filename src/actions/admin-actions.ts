'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile } from "fs/promises"
import path from "path"

const FieldSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().min(0),
    address: z.string().optional(),
    locationUrl: z.string().url().optional().or(z.literal('')),
    description: z.string().optional(),
    cancellationPolicy: z.string().optional(),
    ownerId: z.string().optional().or(z.literal('')),
    newManagerName: z.string().optional(),
    newManagerEmail: z.string().email().optional().or(z.literal('')),
    newManagerPassword: z.string().min(6).optional().or(z.literal('')),
})

export async function createField(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const file = formData.get("image") as File
    if (!file || file.size === 0) {
        return { message: "Image is required", success: false }
    }

    const validatedFields = FieldSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        address: formData.get("address"),
        locationUrl: formData.get("locationUrl"),
        description: formData.get("description"),
        cancellationPolicy: formData.get("cancellationPolicy"),
        ownerId: formData.get("ownerId"),
        newManagerName: formData.get("newManagerName"),
        newManagerEmail: formData.get("newManagerEmail"),
        newManagerPassword: formData.get("newManagerPassword"),
    })

    if (!validatedFields.success) {
        return { message: "Invalid Inputs", success: false }
    }

    const {
        name, price, address, locationUrl, description, cancellationPolicy,
        ownerId, newManagerName, newManagerEmail, newManagerPassword
    } = validatedFields.data

    let finalOwnerId = ownerId || null

    // Handle New Owner Creation if details provided
    if (newManagerEmail && newManagerPassword && newManagerName) {
        try {
            const existing = await prisma.user.findUnique({ where: { email: newManagerEmail } })
            if (existing) return { message: "User with this email already exists", success: false }

            const hashedPassword = await bcrypt.hash(newManagerPassword, 10)
            const newUser = await prisma.user.create({
                data: {
                    name: newManagerName,
                    email: newManagerEmail,
                    password: hashedPassword,
                    role: 'owner'
                }
            })
            finalOwnerId = newUser.id
        } catch (e) {
            console.error(e)
            return { message: "Failed to create manager account", success: false }
        }
    }

    // Handle Image Upload
    // Handle Image Upload (Base64)
    let imageUrl = '';
    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        if (buffer.length > 4 * 1024 * 1024) {
            return { message: "Image too large (max 4MB)", success: false }
        }
        const base64String = buffer.toString('base64')
        const mimeType = file.type || 'image/jpeg'
        imageUrl = `data:${mimeType};base64,${base64String}`
    } catch (error) {
        console.error("Error processing image", error)
        return { message: "Failed to process image.", success: false }
    }

    try {
        await prisma.field.create({
            data: {
                name,
                pricePerHour: price,
                address: address || null,
                locationUrl: locationUrl || null,
                description: description || null,
                cancellationPolicy: cancellationPolicy || "No cancellation policy specified.",
                imageUrl,
                ownerId: finalOwnerId,
            }
        })
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }

    revalidatePath('/admin')
    revalidatePath('/fields')
    return { message: "Field Created Successfully!", success: true }
}

export async function updateField(fieldId: string, prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const validatedFields = FieldSchema.safeParse({
        name: formData.get("name"),
        price: formData.get("price"),
        address: formData.get("address"),
        locationUrl: formData.get("locationUrl"),
        description: formData.get("description"),
        cancellationPolicy: formData.get("cancellationPolicy"),
        ownerId: formData.get("ownerId"),
    })

    if (!validatedFields.success) {
        return { message: "Invalid Inputs", success: false }
    }

    const { name, price, address, locationUrl, description, cancellationPolicy, ownerId } = validatedFields.data
    const file = formData.get("image") as File
    let imageUrl = undefined

    // Handle Image Upload if a new file is provided
    if (file && file.size > 0) {
        try {
            const buffer = Buffer.from(await file.arrayBuffer())
            if (buffer.length > 4 * 1024 * 1024) {
                return { message: "Image too large (max 4MB)", success: false }
            }
            const base64String = buffer.toString('base64')
            const mimeType = file.type || 'image/jpeg'
            imageUrl = `data:${mimeType};base64,${base64String}`
        } catch (error) {
            console.error("Error processing image", error)
            return { message: "Failed to process image.", success: false }
        }
    }

    try {
        await prisma.field.update({
            where: { id: fieldId },
            data: {
                name,
                pricePerHour: price,
                address: address || null,
                locationUrl: locationUrl || null,
                description: description || null,
                cancellationPolicy: cancellationPolicy || null,
                ...(imageUrl && { imageUrl }),
                ownerId: ownerId || null,
            }
        })
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
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
        })
    } catch (e) {
        console.error(e)
        return { message: "Database Error" }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
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
export async function createOwnerAccount(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const phone = formData.get("phone") as string

    if (!name || !email || !password) {
        return { message: "Name, email and password are required", success: false }
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) return { message: "User already exists", success: false }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: 'owner'
            }
        })

        revalidatePath('/admin')
        return { message: "Owner account created successfully", success: true }
    } catch (e) {
        console.error(e)
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

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status,
                refundAmount: refundAmount || 0,
                cancellationAdminNote: adminNote || null
            }
        })

        revalidatePath('/admin')
        revalidatePath('/dashboard')
        return { message: `Cancellation ${action.toLowerCase()}d successfully`, success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}
