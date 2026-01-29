'use client'

import { useState } from "react"
import { markBookingsSettled } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface SettlementManagerProps {
    bookings: any[]
    isAdmin?: boolean
}

export function SettlementManager({ bookings, isAdmin = true }: SettlementManagerProps) {
    const [isPending, setIsPending] = useState(false)

    // Aggregations
    const stats = bookings.reduce((acc, b) => {
        const total = b.totalPrice || 0;
        const refund = b.refundAmount || 0;
        const fee = b.serviceFee || 0;
        const netCollected = total - refund;
        const ownerShare = Math.max(0, netCollected - fee);
        const platformShare = Math.min(fee, netCollected);

        acc.totalCollections += netCollected;
        acc.platformProfit += platformShare;
        acc.totalOwnerShare += ownerShare;

        if (!b.isSettled) {
            acc.pendingOwnerPayout += ownerShare;
            acc.unsettledCount += 1;
            acc.unsettledIds.push(b.id);
        } else {
            acc.alreadySettledPayout += ownerShare;
        }

        return acc;
    }, {
        totalCollections: 0,
        platformProfit: 0,
        totalOwnerShare: 0,
        pendingOwnerPayout: 0,
        alreadySettledPayout: 0,
        unsettledCount: 0,
        unsettledIds: [] as string[]
    })

    const handleSettleAll = async () => {
        if (stats.unsettledIds.length === 0) {
            toast.info("لا توجد حجوزات في انتظار المحاسبة حالياً.")
            return
        }

        const confirmationMessage = `
--- تفسير الحسابات المالية ---
محاسبة عدد ${stats.unsettledCount} حجز:
• إجمالي المستحق للمالك: ${stats.pendingOwnerPayout.toFixed(2)} ج.م
• عمولة المنصة (مخصومة بالفعل): ${stats.platformProfit.toFixed(2)} ج.م

هل أنت متأكد من تأكيد المحاسبة وتحويل الحالة لـ "تمت المحاسبة"؟
`.trim();

        if (!confirm(confirmationMessage)) {
            return
        }

        setIsPending(true)
        const result = await markBookingsSettled(stats.unsettledIds)
        setIsPending(false)

        if (result.success) {
            toast.success("تم تأكيد المحاسبة بنجاح")
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="space-y-8 text-right" dir="rtl">
            {/* Interpretation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100/50 ring-2 ring-red-500/10">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 text-center">في انتظار المحاسبة</p>
                    <div className="text-2xl font-black text-red-700 text-center">{stats.pendingOwnerPayout.toLocaleString()} <span className="text-xs">ج.م</span></div>
                    <p className="text-[10px] font-bold text-red-300 uppercase text-center mt-1">مبالغ "عليك" دفعها للمالك</p>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">تمت محاسبته</p>
                    <div className="text-2xl font-black text-blue-700 text-center">{stats.alreadySettledPayout.toLocaleString()} <span className="text-xs">ج.م</span></div>
                    <p className="text-[10px] font-bold text-blue-300 uppercase text-center mt-1">إجمالي ما دفعته للمالك</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 text-center">أرباح المنصة</p>
                    <div className="text-2xl font-black text-emerald-700 text-center">{stats.platformProfit.toLocaleString()} <span className="text-xs">ج.م</span></div>
                    <p className="text-[10px] font-bold text-emerald-300 uppercase text-center mt-1">مكسب البرنامج الصافي</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">إجمالي التحصيل</p>
                    <div className="text-2xl font-black text-gray-700 text-center">{stats.totalCollections.toLocaleString()} <span className="text-xs">ج.م</span></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center mt-1">الصافي بعد المرتجعات</p>
                </div>
            </div>

            <div className="flex justify-between items-center px-4 flex-row-reverse">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">تفاصيل الحجوزات</h2>
                {isAdmin && (
                    <Button
                        onClick={handleSettleAll}
                        disabled={isPending || stats.unsettledIds.length === 0}
                        className="bg-gray-900 border-0 hover:bg-black text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
                    >
                        {isPending ? "جاري المعالجة..." : "تأكيد المحاسبة للفترة"}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right" dir="rtl">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-right">الحالة</th>
                                <th className="px-8 py-6 text-right">الملعب / النادي</th>
                                <th className="px-8 py-6 text-center">التاريخ والوقت</th>
                                <th className="px-8 py-6 text-right">نصيب المالك الصافي</th>
                                <th className="px-8 py-6 text-left">المحاسبة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bookings.map((booking: any) => {
                                const total = booking.totalPrice || 0;
                                const refund = booking.refundAmount || 0;
                                const fee = booking.serviceFee || 0;
                                const netCollected = total - refund;
                                const ownerShare = Math.max(0, netCollected - fee);

                                return (
                                    <tr
                                        key={booking.id}
                                        className={`transition-colors group ${booking.isSettled ? 'bg-blue-50/20' : 'bg-white hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-8 py-6">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-xl px-3 py-1 font-black text-[10px] transition-all ${booking.status === 'CANCELLED'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-green-50 text-green-600 border-green-100'
                                                    }`}
                                            >
                                                {booking.status === 'CANCELLED' ? 'غرامة' : 'نشط'}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                            {booking.field.name}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-center">
                                                <div className="font-black text-gray-700">{format(new Date(booking.startTime), 'MMM d, yyyy')}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1">
                                                {ownerShare.toFixed(2)} <span className="text-xs text-gray-400">ج.م</span>
                                            </div>
                                            <div className="flex gap-2 flex-row-reverse">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">الإجمالي: {netCollected.toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase">العمولة: {fee}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-left">
                                            {booking.isSettled ? (
                                                <div className="inline-flex items-center gap-2 bg-blue-100/50 px-4 py-2 rounded-2xl border border-blue-200">
                                                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.1em]">تمت المحاسبة</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 bg-red-100/50 px-4 py-2 rounded-2xl border border-red-100">
                                                    <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.1em]">لم يحاسب</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="text-gray-300 font-black text-lg uppercase tracking-widest">لا توجد سجلات مطابقة</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
