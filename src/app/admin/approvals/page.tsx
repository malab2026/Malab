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

import { ApprovalsClient } from "@/components/admin/approvals-client"

export default async function AdminApprovalsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-20 bg-[#F8FAFC]">
            <Navbar />
            <Suspense fallback={<ManagementSkeleton />}>
                <ApprovalsContent />
            </Suspense>
        </main>
    )
}

import { BookingWithDetails } from "@/types"

async function ApprovalsContent() {
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
            orderBy: { createdAt: 'desc' },
            take: 100 // Cap to prevent slow load
        }),
        prisma.booking.findMany({
            where: { status: 'CANCEL_REQUESTED' },
            include: {
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Cap to prevent slow load
        }),
        prisma.booking.findMany({
            where: {
                status: { notIn: ['PENDING', 'CANCEL_REQUESTED'] }
            },
            take: 20,
            include: {
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    ]) as BookingWithDetails[][]

    return (
        <ApprovalsClient
            pendingBookings={pendingBookings}
            cancelRequests={cancelRequests}
            historyBookings={historyBookings}
        />
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
