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
        }

        return acc;
    }, {
        totalCollections: 0,
        platformProfit: 0,
        totalOwnerShare: 0,
        pendingOwnerPayout: 0,
        unsettledCount: 0,
        unsettledIds: [] as string[]
    })

    const handleSettleAll = async () => {
        if (stats.unsettledIds.length === 0) {
            toast.info("No unsettled bookings in this range.")
            return
        }

        const confirmationMessage = `
--- ACCOUNTING INTERPRETATION ---
Settling ${stats.unsettledCount} bookings:
• Total Pending for Owner: ${stats.pendingOwnerPayout.toFixed(2)} EGP
• Platform Share already kept: ${stats.platformProfit.toFixed(2)} EGP

Are you sure you want to mark these as SETTLED?
`.trim();

        if (!confirm(confirmationMessage)) {
            return
        }

        setIsPending(true)
        const result = await markBookingsSettled(stats.unsettledIds)
        setIsPending(false)

        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="space-y-8">
            {/* Interpretation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 text-center">Interpreted Pending</p>
                    <div className="text-2xl font-black text-blue-700 text-center">{stats.pendingOwnerPayout.toLocaleString()} <span className="text-xs">EGP</span></div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase text-center mt-1">Due to Owner</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 text-center">Platform Profit</p>
                    <div className="text-2xl font-black text-emerald-700 text-center">{stats.platformProfit.toLocaleString()} <span className="text-xs">EGP</span></div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase text-center mt-1">Platform Net Net</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Total Collections</p>
                    <div className="text-2xl font-black text-gray-700 text-center">{stats.totalCollections.toLocaleString()} <span className="text-xs">EGP</span></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center mt-1">Gross Net (After Refunds)</p>
                </div>
            </div>

            <div className="flex justify-between items-center px-4">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bookings Detail</h2>
                {isAdmin && (
                    <Button
                        onClick={handleSettleAll}
                        disabled={isPending || stats.unsettledIds.length === 0}
                        className="bg-gray-900 border-0 hover:bg-black text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
                    >
                        {isPending ? "Processing..." : "Mark Period as Settled"}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Field / Stadium</th>
                                <th className="px-8 py-6 text-center">Date & Time</th>
                                <th className="px-8 py-6">Net Owner Share</th>
                                <th className="px-8 py-6 text-right">Settlement</th>
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
                                        className={`transition-colors group ${booking.isSettled ? 'bg-red-50/30' : 'bg-white hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-8 py-6">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-xl px-3 py-1 font-black text-[10px] transition-all ${booking.status === 'CANCELLED'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-green-50 text-green-600 border-green-100'
                                                    }`}
                                            >
                                                {booking.status === 'CANCELLED' ? 'PENALTY' : 'ACTIVE'}
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
                                                {ownerShare.toFixed(2)} <span className="text-xs text-gray-400">EGP</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Gross: {netCollected.toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase">Fee: {fee}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {booking.isSettled ? (
                                                <div className="inline-flex items-center gap-2 bg-red-100/50 px-4 py-2 rounded-2xl border border-red-200">
                                                    <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.1em]">Settled (تم)</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 bg-gray-100/50 px-4 py-2 rounded-2xl border border-gray-100">
                                                    <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em]">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="text-gray-300 font-black text-lg uppercase tracking-widest">No matching records</div>
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
