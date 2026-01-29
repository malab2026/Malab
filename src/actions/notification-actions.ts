'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendWhatsAppAPI } from "@/lib/whatsapp"

export async function getNotifications() {
    const session = await auth()
    if (!session || !session.user) return []

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { userId: session.user.id },
                    { userId: null } // Global notifications
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
        return notifications
    } catch (e) {
        console.error("Error fetching notifications:", e)
        return []
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const session = await auth()
    if (!session || !session.user) return { success: false }

    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        })
        revalidatePath('/')
        return { success: true }
    } catch (e) {
        console.error("Error marking notification as read:", e)
        return { success: false }
    }
}

export async function createNotification(userId: string | null, title: string, message: string, type: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        })

        // WhatsApp Integration
        const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } })
        if (settings?.whatsappEnabled && settings?.whatsappInstanceId && settings?.whatsappToken && userId) {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } })
            if (user?.phone) {
                await sendWhatsAppAPI(
                    user.phone,
                    `${title}\n\n${message}`,
                    settings.whatsappInstanceId,
                    settings.whatsappToken
                )
            }
        }

        revalidatePath('/')
    } catch (e) {
        console.error("Error creating notification:", e)
    }
}

export async function broadcastNotification(title: string, message: string, type: string) {
    try {
        const users = await prisma.user.findMany({ select: { id: true } })

        // Create notifications for all users in one go
        await prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title,
                message,
                type
            }))
        })

        revalidatePath('/')
    } catch (e) {
        console.error("Error broadcasting notification:", e)
    }
}
