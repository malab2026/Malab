import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Wallet, TrendingUp, History, DollarSign } from "lucide-react"
import { SettlementManager } from "@/components/admin/settlement-manager"

export const dynamic = 'force-dynamic'

export default async function AdminFinancePage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const bookings = await prisma.booking.findMany({
        where: { status: 'CONFIRMED' },
        include: { field: { select: { name: true, pricePerHour: true } } },
        orderBy: { createdAt: 'desc' }
    }) as any

    const totalRevenue = bookings.reduce((acc: number, b: any) => acc + (b.totalPrice || 0), 0)
    const totalFees = bookings.reduce((acc: number, b: any) => acc + (b.serviceFee || 0), 0)
    const settledCount = bookings.filter((b: any) => b.isSettled).length

    return (
        <main className="min-h-screen pb-10 bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-black text-gray-900">Finance & Settlements</h1>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold px-3 py-1 rounded-lg">
                            Active Economy
                        </Badge>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <Card className="p-6 rounded-3xl border-0 shadow-sm bg-blue-600 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-sm uppercase tracking-wider opacity-80">Total Revenue</span>
                        </div>
                        <div className="text-4xl font-black mb-1">{totalRevenue.toLocaleString()} EGP</div>
                        <p className="text-xs font-bold opacity-60">Gross booking value across all fields</p>
                    </Card>

                    <Card className="p-6 rounded-3xl border-0 shadow-sm bg-emerald-600 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-sm uppercase tracking-wider opacity-80">Platform Fees</span>
                        </div>
                        <div className="text-4xl font-black mb-1">{totalFees.toLocaleString()} EGP</div>
                        <p className="text-xs font-bold opacity-60">Revenue generated from service fees</p>
                    </Card>

                    <Card className="p-6 rounded-3xl border-0 shadow-sm bg-white border-gray-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                                <History className="h-5 w-5" />
                            </div>
                            <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Settlement Log</span>
                        </div>
                        <div className="text-2xl font-black text-gray-900">{settledCount} Transactions</div>
                        <p className="text-[10px] font-bold text-gray-400">Total processed payouts to owners</p>
                    </Card>
                </div>

                <section className="bg-white p-6 sm:p-10 rounded-[3rem] shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-blue-100 p-3 rounded-2xl">
                            <Wallet className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">Owner Settlements</h2>
                            <p className="text-sm font-bold text-gray-400">Manage payouts and verify account balances</p>
                        </div>
                    </div>
                    <SettlementManager bookings={bookings} />
                </section>
            </div>
        </main>
    )
}
