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

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminApprovalsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-10 bg-gray-50/50">
            <Navbar />
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-transparent hover:border-gray-200 transition-all">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Approvals & History</h1>
                            <p className="text-gray-500 font-bold">Manage booking requests and cancellation tickets.</p>
                        </div>
                    </div>

                    <Suspense fallback={<ManagementSkeleton />}>
                        <ApprovalsContent />
                    </Suspense>
                </div>
            </div>
        </main>
    )
}

async function ApprovalsContent() {
    const [
        pendingBookings,
        cancelRequests
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
        })
    ]) as any

    return (
        <div className="flex flex-col gap-12">
            {pendingBookings.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="h-6 w-6 text-amber-500" />
                        <h2 className="text-2xl font-black text-gray-900">New Booking Requests</h2>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 ml-2">{pendingBookings.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingBookings.map((booking: any) => (
                            <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                        ))}
                    </div>
                </section>
            )}

            {cancelRequests.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                        <h2 className="text-2xl font-black text-gray-900">Cancellation Requests</h2>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 ml-2">{cancelRequests.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
    )
}

function ManagementSkeleton() {
    return (
        <div className="space-y-12">
            {[1, 2].map(i => (
                <section key={i}>
                    <div className="h-8 w-64 bg-gray-200 rounded mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(j => (
                            <div key={j} className="h-48 bg-white rounded-3xl animate-pulse" />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
