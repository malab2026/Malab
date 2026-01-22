import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { Navbar } from "@/components/layout/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"

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
            <div className="bg-gradient-to-br from-green-600 to-green-800 text-white py-12 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="mb-6">
                        <BackButton variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md" fallbackUrl="/" />
                    </div>
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
                </div>

                {club.fields.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-lg">No fields available yet</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {club.fields.map((field: any) => (
                            <Link key={field.id} href={`/fields/${field.id}`}>
                                <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-green-500 cursor-pointer h-full">
                                    <div className="relative h-48 w-full bg-gray-100">
                                        <Image
                                            src={`/api/field-image/${field.id}`}
                                            alt={field.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {bookedFieldIds.includes(field.id) && (
                                            <Badge className="absolute top-3 right-3 bg-green-500 text-white shadow-lg">
                                                Booked Before ⚽
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-6">
                                        <h3 className="font-black text-xl text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                                            {field.name}
                                        </h3>
                                        {field.address && (
                                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                                <span>📍</span>
                                                <span className="truncate">{field.address}</span>
                                            </p>
                                        )}
                                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-2xl font-black text-green-600">
                                                {field.pricePerHour} EGP
                                            </span>
                                            <span className="text-xs text-gray-500 font-semibold">/ Hour</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
