
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminBookingCard } from "@/components/admin/admin-booking-card"

export const dynamic = 'force-dynamic'

export default async function AdminCancellationsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const cancelRequests = await prisma.booking.findMany({
        where: { status: 'CANCEL_REQUESTED' },
        select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            cancellationReason: true,
            createdAt: true,
            receiptUrl: true,
            field: { select: { id: true, name: true, pricePerHour: true } },
            user: { select: { id: true, name: true, email: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2 text-orange-600">Cancellation Requests</h1>
                    <p className="text-gray-500">Review and process booking cancellation requests.</p>
                </div>

                <div className="space-y-4 max-w-3xl mx-auto">
                    {cancelRequests.map((booking) => (
                        <AdminBookingCard key={booking.id} booking={booking} isAdmin isCancelRequest />
                    ))}
                    {cancelRequests.length === 0 && (
                        <p className="text-center text-gray-500 py-10">No cancellation requests.</p>
                    )}
                </div>
            </div>
        </main>
    )
}
