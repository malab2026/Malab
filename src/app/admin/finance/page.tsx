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

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import { FinanceFilter } from "@/components/admin/finance-filter"

export const dynamic = 'force-dynamic'

export default async function AdminFinancePage({
    searchParams
}: {
    searchParams: { fieldId?: string, clubId?: string }
}) {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-20 bg-gray-50/50 leading-relaxed tracking-tight">
            <Navbar />

            <div className="container mx-auto py-12 px-4">
                <div className="mb-12">
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors font-bold uppercase tracking-widest">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin
                    </Link>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Finance & Settlements</h1>
                    <p className="text-gray-400 font-bold text-lg">Detailed financial oversight and management</p>
                </div>

                <Suspense fallback={<FinanceSkeleton />}>
                    <FinanceContent searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    )
}

async function FinanceContent({ searchParams }: { searchParams: { fieldId?: string, clubId?: string } }) {
    const { fieldId, clubId } = searchParams

    const whereClause: any = {
        status: { in: ['CONFIRMED', 'CANCELLED'] }
    }

    if (fieldId) {
        whereClause.fieldId = fieldId
    } else if (clubId) {
        whereClause.field = { clubId: clubId }
    }

    const [bookings, clubs, fields] = await Promise.all([
        prisma.booking.findMany({
            where: whereClause,
            include: { field: { select: { name: true, pricePerHour: true, clubId: true } } },
            orderBy: { createdAt: 'desc' },
            take: 200
        }),
        prisma.club.findMany({ select: { id: true, name: true, nameEn: true } }),
        prisma.field.findMany({ select: { id: true, name: true, nameEn: true } })
    ]) as any

    const totalRevenue = bookings.reduce((acc: number, b: any) => {
        if (b.status === 'CONFIRMED') return acc + (b.totalPrice || 0)
        if (b.status === 'CANCELLED') return acc + ((b.totalPrice || 0) - (b.refundAmount || 0))
        return acc
    }, 0)

    const totalFees = bookings.reduce((acc: number, b: any) => {
        if (b.status === 'CONFIRMED') return acc + (b.serviceFee || 0)
        const net = (b.totalPrice || 0) - (b.refundAmount || 0)
        if (b.status === 'CANCELLED' && net > 0) return acc + Math.min(b.serviceFee || 0, net)
        return acc
    }, 0)

    const settledCount = bookings.filter((b: any) => b.isSettled).length

    return (
        <div className="animate-in fade-in duration-700">
            <FinanceFilter clubs={clubs} fields={fields} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <Card className="p-8 rounded-[2.5rem] border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest opacity-80 mt-1">Total Revenue</span>
                        </div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">{totalRevenue.toLocaleString()} <span className="text-xl">EGP</span></div>
                        <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Gross booking value (Filtered)</p>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-0 shadow-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest opacity-80 mt-1">Platform Fees</span>
                        </div>
                        <div className="text-5xl font-black mb-2 tracking-tighter">{totalFees.toLocaleString()} <span className="text-xl">EGP</span></div>
                        <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest">Net platform income (Filtered)</p>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2.5rem] border-0 shadow-xl bg-white border-gray-100 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <History className="h-24 w-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-orange-100 p-2.5 rounded-2xl text-orange-600">
                                <History className="h-6 w-6" />
                            </div>
                            <span className="font-black text-gray-400 text-xs uppercase tracking-widest mt-1">Settlement Status</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900 mb-2">{settledCount} <span className="text-sm text-gray-400 uppercase">Settled</span></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processed payout transactions</p>
                    </div>
                </Card>
            </div>

            <section className="bg-white p-8 sm:p-12 rounded-[4rem] shadow-2xl border border-gray-50">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-5">
                        <div className="bg-blue-50 p-4 rounded-3xl">
                            <Wallet className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Owner Settlements</h2>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Transaction level detail and payout management</p>
                        </div>
                    </div>
                </div>
                <SettlementManager bookings={bookings} />
            </section>
        </div>
    )
}

function FinanceSkeleton() {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-40 w-full rounded-3xl" />
                ))}
            </div>
            <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
    )
}
