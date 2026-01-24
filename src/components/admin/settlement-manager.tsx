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

    const unsettledBookings = bookings.filter(b => !b.isSettled)
    const unsettledIds = unsettledBookings.map(b => b.id)

    const handleSettleAll = async () => {
        if (unsettledIds.length === 0) {
            toast.info("No unsettled bookings in this range.")
            return
        }

        if (!confirm(`Are you sure you want to mark ${unsettledIds.length} bookings as settled?`)) {
            return
        }

        setIsPending(true)
        const result = await markBookingsSettled(unsettledIds)
        setIsPending(false)

        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Bookings Detail</h2>
                {isAdmin && (
                    <Button
                        onClick={handleSettleAll}
                        disabled={isPending || unsettledIds.length === 0}
                        className="bg-green-600 hover:bg-green-700 font-bold"
                    >
                        {isPending ? "Processing..." : "Mark All as Settled (تم المحاسبة)"}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Field</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Settlement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bookings.map((booking: any) => (
                                <tr
                                    key={booking.id}
                                    className={`transition-colors ${booking.isSettled ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <td className="px-6 py-4">
                                        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'destructive'}>
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{booking.field.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{format(new Date(booking.startTime), 'MMM d, yyyy')}</div>
                                        <div className="text-xs text-gray-500">
                                            {format(new Date(booking.startTime), 'h:mm a')} - {format(new Date(booking.endTime), 'h:mm a')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {((booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60) * booking.field.pricePerHour).toFixed(2)} EGP
                                        {booking.refundAmount > 0 && (
                                            <div className="text-xs text-red-500">Refund: -{booking.refundAmount}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {booking.isSettled ? (
                                            <span className="text-red-600 font-bold text-xs uppercase tracking-wider">Settled (تمت المحاسبة)</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Unsettled</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">
                                        No individual bookings found for this range.
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
