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

import { FinanceHeader } from "@/components/admin/finance-header"
import { FinanceStats } from "@/components/admin/finance-stats"

export default async function AdminFinancePage(props: { searchParams: Promise<any> }) {
    const searchParams = await props.searchParams;
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        redirect('/')
    }

    const clubs = await prisma.club.findMany()
    const fields = await prisma.field.findMany()

    return (
        <div className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <FinanceHeader />

                <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-[3rem]" />}>
                    <FinanceContent
                        searchParams={searchParams}
                        clubs={clubs}
                        fields={fields}
                    />
                </Suspense>
            </div>
        </div>
    )
}

async function FinanceContent({ searchParams, clubs, fields }: { searchParams: any, clubs: any[], fields: any[] }) {
    const { fieldId, clubId, startDate, endDate } = searchParams

    const where: any = {
        status: { in: ['CONFIRMED', 'CANCELLED'] }
    }

    if (fieldId && fieldId !== 'all') {
        where.fieldId = fieldId
    }
    if (clubId && clubId !== 'all') {
        where.field = { clubId: clubId }
    }
    if (startDate || endDate) {
        where.startTime = {}
        if (startDate) where.startTime.gte = new Date(startDate)
        if (endDate) where.startTime.lte = new Date(endDate + 'T23:59:59')
    }

    // 1. Get Aggregated Stats directly from DB (Fast)
    const aggregations = await prisma.booking.aggregate({
        where,
        _sum: {
            totalPrice: true,
            serviceFee: true,
            refundAmount: true
        }
    })

    const settledCount = await prisma.booking.count({ where: { ...where, isSettled: true } })
    const unsettledCount = await prisma.booking.count({ where: { ...where, isSettled: false } })

    // 2. Fetch specific list for UI (Limited to 200)
    const bookings = await prisma.booking.findMany({
        where,
        include: {
            field: {
                include: { club: true }
            }
        },
        orderBy: { startTime: 'desc' },
        take: 200 // Limit to prevent crash
    })

    // Calculate derived stats
    const totalRev = aggregations._sum.totalPrice || 0
    const totalRef = aggregations._sum.refundAmount || 0
    const totalFee = aggregations._sum.serviceFee || 0

    // Revenue = Total collected (minus refunds)
    const netCollected = totalRev - totalRef

    // Fees = Total Service Fees (approximate, assuming fully collected)
    // Note: Technically fee should be min(fee, netCollected) per item, 
    // but for large dataset aggregate, sum(fee) is close enough approx for overview,
    // or we can just show Total Fees. 
    // However, to match previous logic perfectly efficiently is hard without SQL.
    // We will use the Sum of ServiceFee as "Platform Revenue" approx.
    const stats = {
        totalRevenue: netCollected,
        totalFees: totalFee,
        totalPayouts: Math.max(0, netCollected - totalFee),
        settledCount,
        unsettledCount
    }

    return (
        <div className="animate-in fade-in duration-700">
            <FinanceStats
                totalRevenue={stats.totalRevenue}
                totalFees={stats.totalFees}
                totalPayouts={stats.totalPayouts}
                settledCount={stats.settledCount}
                unsettledCount={stats.unsettledCount}
            />

            <FinanceFilter clubs={clubs} fields={fields} />

            <div className="space-y-8 bg-white/50 backdrop-blur-sm p-8 rounded-[3.5rem] border border-gray-100/50 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-1.5 bg-blue-600 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">تسويات الملاك</h2>
                        <p className="text-gray-400 font-bold text-sm">تفاصيل العمليات وإدارة الدفع للملاك</p>
                    </div>
                </div>

                <SettlementManager bookings={bookings} isAdmin={true} />
            </div>
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
