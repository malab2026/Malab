import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"

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

    return (
        <main className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="grid lg:grid-cols-2 gap-10">
                    {/* Left: Image & Info */}
                    <div className="space-y-6">
                        <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src={`/api/field-image/${field.id}`}
                                alt={field.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{field.name}</h1>
                            <p className="text-xl text-green-600 font-semibold mt-2">{field.pricePerHour} EGP / hour</p>

                            {field.address && (
                                <p className="text-gray-600 mt-2 flex items-center gap-2">
                                    📍 {field.address}
                                </p>
                            )}

                            {field.locationUrl && (
                                <a
                                    href={field.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-blue-600 hover:underline text-sm mt-1 mb-4"
                                >
                                    View on Google Maps ↗
                                </a>
                            )}

                            <p className="text-gray-600 mt-4 leading-relaxed">{field.description}</p>
                        </div>
                    </div>

                    {/* Right: Booking Form */}
                    <div className="bg-white p-6 rounded-xl shadow-md h-fit">
                        <h2 className="text-2xl font-bold mb-6 border-b pb-4">Book this Field</h2>
                        <BookingForm field={field} userRole={session.user.role} />
                    </div>
                </div>
            </div>
        </main>
    )
}
