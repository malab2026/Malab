'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function updateOwnerBookingStatus(bookingId: string, status: "CONFIRMED" | "REJECTED") {
    const session = await auth()

    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { field: true }
        })

        if (!booking) return { message: "Booking not found", success: false }

        await prisma.booking.update({
            where: { id: bookingId },
            data: { status },
        })

        revalidatePath('/owner')
        revalidatePath(`/owner/fields/${booking.fieldId}`)
        return { message: `Booking ${status.toLowerCase()} successfully`, success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function blockSlot(fieldId: string, date: string, hour: number, duration: number = 1) {
    const session = await auth()

    if (!session || (session.user.role !== 'owner' && session.user.role !== 'admin')) {
        return { message: "Unauthorized", success: false }
    }

    try {
        const field = await prisma.field.findUnique({ where: { id: fieldId } })
        if (!field) return { message: "Field not found", success: false }

        const startTime = new Date(date)
        startTime.setHours(hour, 0, 0, 0)

        const endTime = new Date(startTime)
        endTime.setHours(hour + duration)

        await prisma.booking.create({
            data: {
                userId: session.user.id, // Use owner ID as the 'user' for blocks
                fieldId,
                startTime,
                endTime,
                status: "BLOCKED",
                serviceFee: 0,
                totalPrice: 0,
            }
        })

        revalidatePath(`/owner/fields/${fieldId}`)
        return { message: "Slot blocked", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}
