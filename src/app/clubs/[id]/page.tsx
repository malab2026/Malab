import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { Navbar } from "@/components/layout/navbar"
import { ClubDetailsClient } from "@/components/clubs/club-details-client"

export const dynamic = 'force-dynamic'

interface ClubPageProps {
    params: Promise<{ id: string }>
}

export default async function ClubPage({ params }: ClubPageProps) {
    const { id } = await params
    const session = await auth()

    const club = await prisma.club.findUnique({
        where: { id },
        include: {
            fields: {
                select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    pricePerHour: true,
                    description: true,
                    descriptionEn: true,
                    address: true,
                    addressEn: true,
                    area: true,
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!club) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Club not found</h1>
                </div>
            </main>
        )
    }

    // Get user's bookings for this club
    const userBookings = session?.user?.id ? await prisma.booking.findMany({
        where: {
            userId: session.user.id,
            field: { clubId: id }
        },
        select: { fieldId: true }
    }) : []

    const bookedFieldIds = Array.from(new Set(userBookings.map(b => b.fieldId)))

    return (
        <main className="min-h-screen">
            <Navbar />
            <ClubDetailsClient club={club} bookedFieldIds={bookedFieldIds} />
        </main>
    )
}
