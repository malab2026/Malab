import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { Navbar } from "@/components/layout/navbar"
import { FieldCard } from "@/components/fields/field-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

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
                    lat: true,
                    lng: true,
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!club) {
        return (
            <main className="min-h-screen pb-10">
                <Navbar />
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Club not found</h1>
                    <Button asChild className="mt-4">
                        <Link href="/">Back to Home</Link>
                    </Button>
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
        <main className="min-h-screen pb-10">
            <Navbar />

            {/* Club Header */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-6">
                        {club.logoUrl && (
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-xl">
                                <Image
                                    src={club.logoUrl}
                                    alt={club.name}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-4xl font-black tracking-tight mb-2">{club.name}</h1>
                            {club.address && (
                                <p className="text-green-100 flex items-center gap-2">
                                    <span>📍</span> {club.address}
                                </p>
                            )}
                        </div>
                    </div>

                    {club.description && (
                        <p className="mt-6 text-green-50 max-w-3xl">
                            {club.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Fields List */}
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Available Fields ({club.fields.length})
                    </h2>
                    <Button asChild variant="outline">
                        <Link href="/">← Back to Clubs</Link>
                    </Button>
                </div>

                {club.fields.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg">No fields available yet</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {club.fields.map((field: any) => (
                            <FieldCard
                                key={field.id}
                                field={field}
                                isBooked={bookedFieldIds.includes(field.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
