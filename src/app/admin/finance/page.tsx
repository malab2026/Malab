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

    const [clubs, fields] = await Promise.all([
        prisma.club.findMany(),
        prisma.field.findMany()
    ])

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

    // Default to current month if no dates selected to optimize initial load
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]

    // Check if "all time" is explicitly requested (e.g. via specific flag) or just use default
    // Ideally we default to "This Month" to be fast.
    let effectiveStartDate = startDate
    let effectiveEndDate = endDate

    // Optimization: If no filters at all, default to this month.
    // If user explicitly wants all, they might clear date input? 
    // We'll trust the user to remove the default if they want, but for now apply it if param is missing.
    if (!startDate && !endDate && !fieldId && !clubId) {
        effectiveStartDate = firstDayOfMonth
    }

    const where: any = {
        status: { in: ['CONFIRMED', 'CANCELLED'] }
    }

    if (fieldId && fieldId !== 'all') {
        where.fieldId = fieldId
    }
    if (clubId && clubId !== 'all') {
        where.field = { clubId: clubId }
    }

    if (effectiveStartDate || effectiveEndDate) {
        where.startTime = {}
        if (effectiveStartDate) where.startTime.gte = new Date(effectiveStartDate)
        if (effectiveEndDate) where.startTime.lte = new Date(effectiveEndDate + 'T23:59:59')
    }

    // Parallelize all DB queries for maximum speed
    const [aggregations, settledCount, unsettledCount, bookings] = await Promise.all([
        // 1. Aggregates
        prisma.booking.aggregate({
            where,
            _sum: {
                totalPrice: true,
                serviceFee: true,
                refundAmount: true
            }
        }),
        // 2. Counts
        prisma.booking.count({ where: { ...where, isSettled: true } }),
        prisma.booking.count({ where: { ...where, isSettled: false } }),
        // 3. List
        prisma.booking.findMany({
            where,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                totalPrice: true,
                serviceFee: true,
                refundAmount: true,
                isSettled: true,
                field: {
                    select: {
                        id: true,
                        name: true,
                        club: { select: { id: true, name: true } }
                    }
                }
            },
            orderBy: { startTime: 'desc' },
            take: 200
        })
    ])

    // Calculate derived stats
    const totalRev = aggregations._sum.totalPrice || 0
    const totalRef = aggregations._sum.refundAmount || 0
    const totalFee = aggregations._sum.serviceFee || 0

    const netCollected = totalRev - totalRef

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
