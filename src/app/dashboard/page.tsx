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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                        <h1 className="text-3xl font-black text-white mb-1 drop-shadow-sm">My Bookings</h1>
                        <p className="text-sm text-green-100/80 font-bold uppercase tracking-wider">Manage your reservations and blocks</p>
                    </div>
                    <Button asChild className="bg-green-600 hover:bg-green-700 h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 transition-all hover:scale-105 active:scale-95 border-0">
                        <Link href="/fields">Book a New Field 🏟️</Link>
                    </Button>
                </div>

                <DashboardHistoryManager bookings={bookings} />
            </div>
        </main>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100",
        REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        CANCELLED: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    }
    return (
        <Badge className={styles[status as keyof typeof styles] || ""}>
            {status.replace('_', ' ')}
        </Badge>
    )
}
