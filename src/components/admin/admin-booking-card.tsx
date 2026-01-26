'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { updateBookingStatus } from "@/actions/admin-actions"
import { ProcessCancellationDialog } from "@/components/admin/process-cancellation-dialog"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"

export function AdminBookingCard({ booking, isAdmin = false, isCancelRequest = false }: { booking: any, isAdmin?: boolean, isCancelRequest?: boolean }) {
    return (
        <Card className="flex flex-col md:flex-row items-center overflow-hidden border-l-4 border-l-transparent data-[cancel=true]:border-l-orange-500 bg-white" data-cancel={isCancelRequest}>
            <div className="relative w-full md:w-32 h-24 shrink-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                <Image
                    src={`/api/receipt-image/${booking.id}`}
                    alt="Receipt"
                    fill
                    className="object-cover"
                />
                <span>No Receipt</span>
            </div>
            <div className="flex-1 p-4 grid md:grid-cols-2 gap-4 w-full text-left">
                <div>
                    <h3 className="font-bold text-gray-900">{booking.field.name}</h3>
                    <p className="text-sm text-gray-500">
                        {formatInEgyptDate(booking.startTime)} • {formatInEgyptTime(booking.startTime)}
                    </p>
                    <p className="text-sm text-gray-700">User: <span className="font-medium">{booking.user.name}</span> ({booking.user.email || 'No Email'})</p>
                    <p className="text-sm text-gray-600">Phone: {booking.user.phone || 'N/A'}</p>
                    {isCancelRequest && booking.cancellationReason && (
                        <p className="text-xs mt-2 p-2 bg-orange-50 text-orange-800 rounded border border-orange-100 italic">
                            Reason: {booking.cancellationReason}
                        </p>
                    )}
                    {booking.receiptUrl && (
                        <div className="mt-1">
                            <div className="flex gap-3">
                                <Link href={`/receipt/${booking.id}`} target="_blank" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                    <span>📄</span> View Full
                                </Link>
                                <a href={`/api/receipt-image/${booking.id}?download=true`} className="text-green-600 hover:underline text-xs flex items-center gap-1" download>
                                    <span>⬇️</span> Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2">
                    <StatusBadge status={booking.status} />

                    {isAdmin && booking.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                            <form action={async () => {
                                await updateBookingStatus(booking.id, 'CONFIRMED')
                            }}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Confirm</Button>
                            </form>
                            <form action={async () => {
                                await updateBookingStatus(booking.id, 'REJECTED')
                            }}>
                                <Button size="sm" variant="destructive">Reject</Button>
                            </form>
                        </div>
                    )}

                    {isAdmin && isCancelRequest && (
                        <div className="ml-4">
                            <ProcessCancellationDialog booking={booking} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800",
        CANCEL_APPROVED: "bg-gray-100 text-gray-800",
        CANCELLED: "bg-gray-100 text-gray-800",
        BLOCKED: "bg-orange-100 text-orange-800 border-orange-200"
    }
    return (
        <Badge className={(styles[status as keyof typeof styles] || "") + " hover:none shadow-none border-0"}>
            {status.replace('_', ' ')}
        </Badge>
    )
}
