'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClubSchema = z.object({
    name: z.string().min(1),
    nameEn: z.string().optional(),
    address: z.string().optional(),
    addressEn: z.string().optional(),
    description: z.string().optional(),
    descriptionEn: z.string().optional(),
    logoUrl: z.string().optional()
})

export async function createClub(formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        const data = {
            name: formData.get('name') as string,
            nameEn: formData.get('nameEn') as string || null,
            address: formData.get('address') as string || null,
            addressEn: formData.get('addressEn') as string || null,
            description: formData.get('description') as string || null,
            descriptionEn: formData.get('descriptionEn') as string || null,
            logoUrl: formData.get('logoUrl') as string || null
        }

        await prisma.club.create({ data })

        revalidatePath('/admin')
        revalidatePath('/')
        return { message: "Club created successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function updateClub(clubId: string, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        const data = {
            name: formData.get('name') as string,
            nameEn: formData.get('nameEn') as string || null,
            address: formData.get('address') as string || null,
            addressEn: formData.get('addressEn') as string || null,
            description: formData.get('description') as string || null,
            descriptionEn: formData.get('descriptionEn') as string || null,
            logoUrl: formData.get('logoUrl') as string || null
        }

        await prisma.club.update({
            where: { id: clubId },
            data
        })

        revalidatePath('/admin')
        revalidatePath('/')
        return { message: "Club updated successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Database Error", success: false }
    }
}

export async function deleteClub(clubId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return { message: "Unauthorized", success: false }
    }

    try {
        await prisma.club.delete({
            where: { id: clubId }
        })

        revalidatePath('/admin')
        revalidatePath('/')
        return { message: "Club deleted successfully", success: true }
    } catch (e) {
        console.error(e)
        return { message: "Failed to delete club. It might have active fields.", success: false }
    }
}

export async function getClubs() {
    try {
        const clubs = await prisma.club.findMany({
            include: {
                _count: {
                    select: { fields: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return clubs
    } catch (e) {
        console.error(e)
        return []
    }
}

export async function getClubWithFields(clubId: string) {
    try {
        const club = await prisma.club.findUnique({
            where: { id: clubId },
            include: {
                fields: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })
        return club
    } catch (e) {
        console.error(e)
        return null
    }
}
