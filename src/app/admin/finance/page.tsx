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
    searchParams: { fieldId?: string, clubId?: string, startDate?: string, endDate?: string }
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
                        <ArrowLeft className="h-4 w-4" /> العودة للوحة التحكم
                    </Link>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">المالية والتسويات</h1>
                    <p className="text-gray-400 font-bold text-lg">إدارة ورقابة مالية شاملة للحجوزات</p>
                </div>

                <Suspense fallback={<FinanceSkeleton />}>
                    <FinanceContent searchParams={searchParams} />
                </Suspense>
            </div>
        </main>
    )
}

async function FinanceContent({ searchParams }: { searchParams: { fieldId?: string, clubId?: string, startDate?: string, endDate?: string } }) {
    const { fieldId, clubId, startDate, endDate } = searchParams

    const whereClause: any = {
        status: { in: ['CONFIRMED', 'CANCELLED'] }
    }

    if (fieldId) {
        whereClause.fieldId = fieldId
    } else if (clubId) {
        whereClause.field = { clubId: clubId }
    }

    if (startDate || endDate) {
        whereClause.startTime = {}
        if (startDate) whereClause.startTime.gte = new Date(`${startDate}T00:00:00`)
        if (endDate) whereClause.startTime.lte = new Date(`${endDate}T23:59:59`)
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

    const totalPayouts = totalRevenue - totalFees

    const settledCount = bookings.filter((b: any) => b.isSettled).length
    const unsettledCount = bookings.filter((b: any) => !b.isSettled).length

    return (
        <div className="animate-in fade-in duration-700">
            <FinanceFilter clubs={clubs} fields={fields} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-4 w-4 opacity-70" />
                            <span className="font-black text-[10px] uppercase tracking-widest opacity-80">إجمالي الإيرادات</span>
                        </div>
                        <div className="text-3xl font-black mb-1">{totalRevenue.toLocaleString()} <span className="text-sm">ج.م</span></div>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">إجمالي ما تم تحصيله</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="h-4 w-4 opacity-70" />
                            <span className="font-black text-[10px] uppercase tracking-widest opacity-80">عمولة المنصة</span>
                        </div>
                        <div className="text-3xl font-black mb-1">{totalFees.toLocaleString()} <span className="text-sm">ج.م</span></div>
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">صافي ربح البرنامج</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-white border-blue-50 relative overflow-hidden group ring-2 ring-blue-500/10 text-right">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-blue-600 justify-end">
                            <span className="font-black text-[10px] uppercase tracking-widest mt-0.5">مستحقات الملاك</span>
                            <Wallet className="h-4 w-4" />
                        </div>
                        <div className="text-3xl font-black mb-1 text-gray-900">{totalPayouts.toLocaleString()} <span className="text-sm text-gray-400">ج.م</span></div>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">نصيب المالك الصافي</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-[2rem] border-0 shadow-lg bg-gray-50 flex flex-col justify-center relative overflow-hidden group text-right">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 justify-end">
                            <span className="font-black text-[10px] uppercase tracking-widest mt-0.5">عمليات التسوية</span>
                            <History className="h-4 w-4" />
                        </div>
                        <div className="text-2xl font-black text-gray-900 mb-1">{settledCount} <span className="text-xs text-gray-400 uppercase tracking-widest">تمت محاسبتها</span></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unsettledCount} في انتظار المحاسبة</p>
                    </div>
                </Card>
            </div>

            <section className="bg-white p-8 sm:p-12 rounded-[4rem] shadow-2xl border border-gray-50 text-right" dir="rtl">
                <div className="flex items-center justify-between mb-12 flex-row-reverse">
                    <div className="flex items-center gap-5 flex-row-reverse">
                        <div className="bg-blue-50 p-4 rounded-3xl">
                            <Wallet className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-1">تسويات الملاك</h2>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">تفاصيل العمليات وإدارة الدفع للملاك</p>
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
