'use client'

import { useState } from "react"
import { markBookingsSettled } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { useTranslation } from "@/components/providers/locale-context"
import { Checkbox } from "@/components/ui/checkbox"

interface SettlementManagerProps {
    bookings: any[]
    isAdmin?: boolean
}

export function SettlementManager({ bookings, isAdmin = true }: SettlementManagerProps) {
    const [isPending, setIsPending] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const { t, locale } = useTranslation()
    const isRtl = locale === 'ar'

    const unsettledBookings = bookings.filter(b => !b.isSettled)
    const unsettledIds = unsettledBookings.map(b => b.id)

    // Aggregations for ALL bookings in the current view
    const generalStats = bookings.reduce((acc, b) => {
        const total = b.totalPrice || 0;
        const refund = b.refundAmount || 0;
        const fee = b.serviceFee || 0;
        const netCollected = total - refund;
        const ownerShare = Math.max(0, netCollected - fee);
        const platformShare = Math.min(fee, netCollected);

        acc.totalCollections += netCollected;
        acc.platformProfit += platformShare;

        if (!b.isSettled) {
            acc.pendingOwnerPayout += ownerShare;
        } else {
            acc.alreadySettledPayout += ownerShare;
        }

        return acc;
    }, {
        totalCollections: 0,
        platformProfit: 0,
        pendingOwnerPayout: 0,
        alreadySettledPayout: 0,
    })

    // Aggregations for SELECTED bookings ONLY
    const selectionStats = bookings.filter(b => selectedIds.includes(b.id)).reduce((acc, b) => {
        const total = b.totalPrice || 0;
        const refund = b.refundAmount || 0;
        const fee = b.serviceFee || 0;
        const netCollected = total - refund;
        const ownerShare = Math.max(0, netCollected - fee);
        const platformShare = Math.min(fee, netCollected);

        acc.payout += ownerShare;
        acc.profit += platformShare;
        return acc;
    }, { payout: 0, profit: 0 })

    const handleSettleSelected = async () => {
        if (selectedIds.length === 0) {
            toast.info(t('selectItemsToSettle'))
            return
        }

        const confirmationMessage = `
--- ${t('settlementConfirmationTitle')} ---
${t('settlementConfirmationDesc', { count: selectedIds.length })}
• ${t('settlementConfirmationPending', { amount: selectionStats.payout.toFixed(2) })}
• ${t('settlementConfirmationPlatform', { amount: selectionStats.profit.toFixed(2) })}

${t('settlementConfirmationCheck')}
`.trim();

        if (!confirm(confirmationMessage)) {
            return
        }

        setIsPending(true)
        const result = await markBookingsSettled(selectedIds)
        setIsPending(false)

        if (result.success) {
            setSelectedIds([])
            toast.success(locale === 'ar' ? "تم تأكيد المحاسبة بنجاح" : "Settlement confirmed successfully")
        } else {
            toast.error(result.message)
        }
    }

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(unsettledIds)
        } else {
            setSelectedIds([])
        }
    }

    const toggleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id))
        }
    }

    return (
        <div className={`space-y-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Interpretation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50/50 p-6 rounded-[2rem] border border-red-100/50 ring-2 ring-red-500/10 text-center">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{t('pendingPayout')}</p>
                    <div className="text-2xl font-black text-red-700">{generalStats.pendingOwnerPayout.toLocaleString()} <span className="text-xs">{t('egp')}</span></div>
                    <p className="text-[10px] font-bold text-red-300 uppercase mt-1">{t('pendingPayoutDesc')}</p>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t('alreadySettled')}</p>
                    <div className="text-2xl font-black text-blue-700">{generalStats.alreadySettledPayout.toLocaleString()} <span className="text-xs">{t('egp')}</span></div>
                    <p className="text-[10px] font-bold text-blue-300 uppercase mt-1">{t('alreadySettledDesc')}</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100/50 text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t('platformProfit')}</p>
                    <div className="text-2xl font-black text-emerald-700">{generalStats.platformProfit.toLocaleString()} <span className="text-xs">{t('egp')}</span></div>
                    <p className="text-[10px] font-bold text-emerald-300 uppercase mt-1">{t('platformProfitDesc')}</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('totalCollections')}</p>
                    <div className="text-2xl font-black text-gray-700">{generalStats.totalCollections.toLocaleString()} <span className="text-xs">{t('egp')}</span></div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{t('totalCollectionsDesc')}</p>
                </div>
            </div>

            <div className={`flex justify-between items-center px-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('bookingsDetail')}</h2>
                    {selectedIds.length > 0 && (
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                            {t('itemsSelected', { count: selectedIds.length })} ( {selectionStats.payout.toFixed(2)} {t('egp')} )
                        </p>
                    )}
                </div>
                {isAdmin && (
                    <Button
                        onClick={handleSettleSelected}
                        disabled={isPending || selectedIds.length === 0}
                        className="bg-gray-900 border-0 hover:bg-black text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
                    >
                        {isPending ? (isRtl ? "جاري المعالجة..." : "Processing...") : t('settleSelected', { count: selectedIds.length })}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" dir={isRtl ? 'rtl' : 'ltr'}>
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-6 text-center w-12">
                                    {unsettledIds.length > 0 && (
                                        <Checkbox
                                            checked={selectedIds.length === unsettledIds.length && unsettledIds.length > 0}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                            className="border-gray-300"
                                            title={t('selectAll')}
                                        />
                                    )}
                                </th>
                                <th className={`px-6 py-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t('bookingStatus')}</th>
                                <th className={`px-8 py-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t('fieldStadium')}</th>
                                <th className="px-8 py-6 text-center">{t('dateAndTime')}</th>
                                <th className={`px-8 py-6 ${isRtl ? 'text-right' : 'text-left'}`}>{t('netOwnerShare')}</th>
                                <th className={`px-8 py-6 ${isRtl ? 'text-left' : 'text-right'}`}>{t('settlement')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {bookings.map((booking: any) => {
                                const total = booking.totalPrice || 0;
                                const refund = booking.refundAmount || 0;
                                const fee = booking.serviceFee || 0;
                                const netCollected = total - refund;
                                const ownerShare = Math.max(0, netCollected - fee);
                                const isSelected = selectedIds.includes(booking.id);

                                return (
                                    <tr
                                        key={booking.id}
                                        className={`transition-colors group ${booking.isSettled ? 'bg-blue-50/10' : isSelected ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-6 text-center">
                                            {!booking.isSettled && (
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => toggleSelectOne(booking.id, !!checked)}
                                                    className="border-gray-200"
                                                />
                                            )}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <Badge
                                                variant="outline"
                                                className={`rounded-xl px-3 py-1 font-black text-[10px] transition-all whitespace-nowrap ${booking.status === 'CANCELLED'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : 'bg-green-50 text-green-600 border-green-100'
                                                    }`}
                                            >
                                                {booking.status === 'CANCELLED' ? t('penalty') : t('active')}
                                            </Badge>
                                        </td>
                                        <td className={`px-8 py-6 font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
                                            {booking.field.name}
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div>
                                                <div className="font-black text-gray-700 whitespace-nowrap">{format(new Date(booking.startTime), 'MMM d, yyyy')}</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight whitespace-nowrap">
                                                    {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="font-black text-gray-900 text-xl tracking-tight leading-none mb-1 whitespace-nowrap">
                                                {ownerShare.toFixed(2)} <span className="text-xs text-gray-400">{t('egp')}</span>
                                            </div>
                                            <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''} whitespace-nowrap`}>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{t('grossAmount')}: {netCollected.toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase">{t('feeAmount')}: {fee}</span>
                                            </div>
                                        </td>
                                        <td className={`px-8 py-6 ${isRtl ? 'text-left' : 'text-right'}`}>
                                            {booking.isSettled ? (
                                                <div className="inline-flex items-center gap-2 bg-blue-100/50 px-4 py-2 rounded-2xl border border-blue-200">
                                                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">{t('settledStatus')}</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 bg-red-100/50 px-4 py-2 rounded-2xl border border-red-100">
                                                    <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">{t('pendingStatus')}</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="text-gray-300 font-black text-lg uppercase tracking-widest">{t('noMatchingRecords')}</div>
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
