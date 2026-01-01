import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { EditBookingForm } from "@/components/booking/edit-booking-form"

export default async function EditBookingPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
        redirect("/login")
    }

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { field: true }
    })

    if (!booking) {
        notFound()
    }

    // Security check
    if (booking.userId !== session.user.id) {
        redirect("/dashboard")
    }

    // Only allow editing if pending
    if (booking.status !== "PENDING") {
        redirect("/dashboard")
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Edit Your Booking</h1>
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-6 border-b pb-4">
                            Changing details for: <span className="text-green-600">{booking.field.name}</span>
                        </h2>
                        <EditBookingForm booking={booking} />
                    </div>
                </div>
            </div>
        </main>
    )
}
