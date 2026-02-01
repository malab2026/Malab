'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { updateBookingStatus } from "@/actions/admin-actions"
import { ProcessCancellationDialog } from "@/components/admin/process-cancellation-dialog"
import { useTranslation } from "@/components/providers/locale-context"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"
import { BookingWithDetails } from "@/types"

export function AdminBookingCard({ booking, isAdmin = false, isCancelRequest = false }: { booking: BookingWithDetails, isAdmin?: boolean, isCancelRequest?: boolean }) {
    const { t } = useTranslation()

    return (
        <Card className="flex flex-col md:flex-row items-center overflow-hidden border-l-4 border-l-transparent data-[cancel=true]:border-l-orange-500 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-3xl" data-cancel={isCancelRequest}>
            <div className="relative w-full md:w-32 h-32 shrink-0 bg-blue-50/50 flex flex-col items-center justify-center text-xs text-blue-400 group border-r border-gray-50">
                <span className="text-3xl mb-1">📄</span>
                <span className="font-bold uppercase tracking-widest text-[8px]">{t('statusReceipt')}</span>

                {booking.receiptUrl && (
                    <Link
                        href={`/receipt/${booking.id}`}
                        target="_blank"
                        className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1"
                    >
                        <span className="text-xl">👁️</span>
                        <span className="font-black text-[10px] uppercase">{t('viewFull')}</span>
                    </Link>
                )}
            </div>
            <div className="flex-1 p-5 grid md:grid-cols-2 gap-4 w-full text-left">
                <div>
                    <h3 className="font-black text-gray-900 text-lg">{booking.field.name}</h3>
                    <p className="text-sm font-bold text-blue-600 mb-2">
                        {formatInEgyptDate(booking.startTime)} • {formatInEgyptTime(booking.startTime)}
                    </p>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600 font-bold flex items-center gap-1.5">
                            <span className="opacity-50">👤</span> {booking.user.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                            <span className="opacity-50">📧</span> {booking.user.email || 'No Email'}
                        </p>
                        <p className="text-[11px] text-gray-700 font-black flex items-center gap-1.5">
                            <span className="opacity-50">📞</span> {booking.user.phone || 'N/A'}
                        </p>
                    </div>

                    {isCancelRequest && booking.cancellationReason && (
                        <p className="text-[11px] mt-3 p-2.5 bg-red-50 text-red-700 rounded-xl border border-red-100 italic font-medium">
                            {t('reason')}: {booking.cancellationReason}
                        </p>
                    )}

                    {(booking.receiptUrl || (booking as any).hasReceipt) && (
                        <div className="mt-3">
                            <div className="flex gap-4">
                                <Link
                                    href={`/receipt/${booking.id}`}
                                    target="_blank"
                                    className="text-blue-600 hover:text-blue-700 font-black text-xs flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl transition-all border border-blue-100/50 shadow-sm"
                                >
                                    <span>📄</span> {t('viewReceipt')}
                                </Link>
                                <a
                                    href={`/api/receipt-image/${booking.id}?download=true`}
                                    className="text-green-600 hover:text-green-700 font-black text-xs flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl transition-all border border-green-100/50 shadow-sm"
                                    download
                                >
                                    <span>⬇️</span> {t('download')}
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end justify-between gap-3">
                    <StatusBadge status={booking.status} />

                    {isAdmin && booking.status === 'PENDING' && (
                        <div className="flex gap-2 w-full md:w-auto">
                            <form action={async (formData) => {
                                await updateBookingStatus(booking.id, 'CONFIRMED', formData)
                            }} className="flex-1 md:flex-none">
                                <Button size="sm" className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-black rounded-xl px-4">
                                    {t('confirm')}
                                </Button>
                            </form>
                            <form action={async (formData) => {
                                await updateBookingStatus(booking.id, 'REJECTED', formData)
                            }} className="flex-1 md:flex-none">
                                <Button size="sm" variant="destructive" className="w-full md:w-auto font-black rounded-xl px-4 bg-red-500 hover:bg-red-600 border-0">
                                    {t('reject')}
                                </Button>
                            </form>
                        </div>
                    )}

                    {isAdmin && isCancelRequest && (
                        <div className="w-full md:w-auto">
                            <ProcessCancellationDialog booking={booking} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation()
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800",
        CANCEL_APPROVED: "bg-gray-100 text-gray-800",
        CANCELLED: "bg-gray-100 text-gray-800",
        BLOCKED: "bg-orange-100 text-orange-800 border-orange-200"
    }

    const labels = {
        PENDING: t('statusPending'),
        CONFIRMED: t('statusConfirmed'),
        REJECTED: t('statusRejected'),
        CANCEL_REQUESTED: t('statusCancelRequested'),
        CANCEL_APPROVED: t('statusCancelled'),
        CANCELLED: t('statusCancelled'),
        BLOCKED: t('statusBlocked')
    }

    return (
        <Badge className={(styles[status as keyof typeof styles] || "") + " hover:none shadow-none border-0 px-3 py-1 rounded-full text-[10px] font-black tracking-tight"}>
            {labels[status as keyof typeof labels] || status.replace('_', ' ')}
        </Badge>
    )
}
