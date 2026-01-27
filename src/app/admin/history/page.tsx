
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminHistoryManager } from "@/components/admin/admin-history-manager"

export const dynamic = 'force-dynamic'

export default async function AdminHistoryPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    // Fetch history bookings (not pending)
    const historyBookings = await prisma.booking.findMany({
        where: { status: { not: 'PENDING' } },
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
        orderBy: { createdAt: 'desc' },
        take: 100
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Booking History</h1>
                    <p className="text-gray-500">Search and filter past bookings.</p>
                </div>

                <div className="bg-white/30 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/40 shadow-xl">
                    <AdminHistoryManager bookings={historyBookings} />
                </div>
            </div>
        </main>
    )
}
