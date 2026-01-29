import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { DashboardHistoryManager } from "@/components/dashboard/dashboard-history-manager"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        include: {
            field: {
                select: {
                    id: true,
                    name: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <DashboardHistoryManager bookings={bookings} />
            </div>
        </main>
    )
}

// Note: This StatusBadge is local to this file, we should probably unify them but for now let's localize it.
function StatusBadge({ status }: { status: string }) {
    // This is a server component, so we can't use useTranslation hook directly here. 
    // Usually we'd pass the locale or use a server-side translation helper.
    // However, DashboardPage is async and can access headers.
    // But wait, the manager is a client component. Let's look at DashboardPage again.
    const labels: Record<string, string> = {
        PENDING: "قيد الانتظار",
        CONFIRMED: "مقبول",
        REJECTED: "مرفوض",
        CANCEL_REQUESTED: "طلب إلغاء",
        CANCELLED: "ملغي",
    }

    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100",
        REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return (
        <Badge className={styles[status as keyof typeof styles] || ""}>
            {labels[status] || status.replace('_', ' ')}
        </Badge>
    )
}
