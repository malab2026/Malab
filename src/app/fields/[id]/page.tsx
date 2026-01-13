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
            cancellationPolicy: true,
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

    // Fetch dynamic service fee
    const settings = await prisma.globalSettings.upsert({
        where: { id: 'global' },
        update: {},
        create: { id: 'global', serviceFee: 10.0 }
    })
    const serviceFee = settings.serviceFee

    return (
        <main className="min-h-screen pb-10 bg-gray-50/30">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col gap-10 max-w-5xl mx-auto">
                    {/* Top: Image & Info */}
                    <div className="space-y-6">
                        <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={`/api/field-image/${field.id}`}
                                alt={field.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 md:p-10">
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{field.name}</h1>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <p className="text-3xl md:text-4xl font-black text-green-600">{field.pricePerHour} EGP <span className="text-sm font-medium text-gray-400">/ hour</span></p>
                                    {field.address && (
                                        <p className="text-gray-500 mt-2 flex items-center gap-2 font-semibold">
                                            📍 {field.address}
                                        </p>
                                    )}
                                </div>
                                {field.locationUrl && (
                                    <a
                                        href={field.locationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full md:w-auto text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                    >
                                        Open Maps 🗺️
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Booking Form */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="w-2 h-10 bg-green-500 rounded-full"></div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                Reserve Your Slot
                            </h2>
                        </div>
                        <BookingForm
                            field={field}
                            userRole={session.user.role}
                            initialBookings={initialBookings}
                            serviceFee={serviceFee}
                        />
                    </div>

                    {/* About Section */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            📖 About this Field
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-8 text-lg">{field.description}</p>

                        <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                            <h4 className="text-orange-900 font-bold mb-3 flex items-center gap-2 text-lg">
                                🛡️ Cancellation Policy
                            </h4>
                            <p className="text-orange-800/80 leading-relaxed whitespace-pre-line font-medium">
                                {field.cancellationPolicy}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
