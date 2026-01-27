import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { AdminBookingCard } from "@/components/admin/admin-booking-card"
import { AdminHistoryManager } from "@/components/admin/admin-history-manager"
import { ProcessCancellationDialog } from "@/components/admin/process-cancellation-dialog"

export const dynamic = 'force-dynamic'

export default async function AdminApprovalsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [
        pendingBookings,
        cancelRequests,
        historyBookings
    ] = await Promise.all([
        prisma.booking.findMany({
            where: { status: 'PENDING' },
            include: {
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.findMany({
            where: { status: 'CANCEL_REQUESTED' },
            include: {
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.findMany({
            where: { status: { notIn: ['PENDING', 'CANCEL_REQUESTED'] } },
            include: {
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 200
        })
    ]) as any

    return (
        <main className="min-h-screen pb-10 bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-black text-gray-900">Approvals & History</h1>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-bold px-3 py-1 rounded-lg">
                                {pendingBookings.length} Pending
                            </Badge>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold px-3 py-1 rounded-lg">
                                {cancelRequests.length} Cancellations
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-12">
                    {/* Pending Bookings Section */}
                    {pendingBookings.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-yellow-100 p-2 rounded-xl">
                                    <Clock className="h-5 w-5 text-yellow-700" />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">New Booking Requests</h2>
                            </div>
                            <div className="grid gap-4">
                                {pendingBookings.map((booking: any) => (
                                    <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cancellation Requests Section */}
                    {cancelRequests.length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-orange-100 p-2 rounded-xl">
                                    <AlertCircle className="h-5 w-5 text-orange-700" />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Cancellation Requests</h2>
                            </div>
                            <div className="grid gap-4">
                                {cancelRequests.map((booking: any) => (
                                    <AdminBookingCard key={booking.id} booking={booking} isAdmin isCancelRequest />
                                ))}
                            </div>
                        </section>
                    )}

                    {pendingBookings.length === 0 && cancelRequests.length === 0 && (
                        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Inbox is Clear!</h3>
                            <p className="text-gray-500 font-bold">No pending approvals or cancellation requests at the moment.</p>
                        </div>
                    )}

                    <hr className="border-gray-200" />

                    {/* History Section */}
                    <section className="bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl">
                        <AdminHistoryManager bookings={historyBookings} />
                    </section>
                </div>
            </div>
        </main>
    )
}
