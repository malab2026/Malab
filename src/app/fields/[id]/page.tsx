import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"
import { getFieldBookings } from "@/actions/booking-actions"
import { format, addDays } from "date-fns"

export default async function FieldDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params;

    if (!session) {
        redirect(`/login?callbackUrl=/fields/${id}`)
    }
    const field = await prisma.field.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            pricePerHour: true,
            address: true,
            locationUrl: true,
            description: true,
            ownerId: true,
        }
    })

    if (!field) {
        notFound()
    }

    // Fetch existing bookings for the next 7 days
    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd')
    const bookingsResult = await getFieldBookings(field.id, startDate, endDate)
    const initialBookings = bookingsResult.success ? bookingsResult.bookings : []

    return (
        <main className="min-h-screen pb-10 bg-gray-50/30">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Left: Image & Info */}
                    <div className="space-y-6">
                        <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={`/api/field-image/${field.id}`}
                                alt={field.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <h1 className="text-4xl font-bold text-white tracking-tight">{field.name}</h1>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-3xl font-black text-green-600">{field.pricePerHour} EGP <span className="text-sm font-medium text-gray-400">/ hour</span></p>
                                    {field.address && (
                                        <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
                                            📍 {field.address}
                                        </p>
                                    )}
                                </div>
                                {field.locationUrl && (
                                    <a
                                        href={field.locationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-blue-50 text-blue-600 p-3 rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        <span className="text-sm font-bold">Open Maps ↗</span>
                                    </a>
                                )}
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">About this Field</h3>
                                <p className="text-gray-600 leading-relaxed">{field.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Booking Form */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-fit">
                        <h2 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                            Reserve Your Slot
                        </h2>
                        <BookingForm field={field} userRole={session.user.role} initialBookings={initialBookings} />
                    </div>
                </div>
            </div>
        </main>
    )
}
