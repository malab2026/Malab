'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Filter, X, MapPin, Calendar, Clock, History } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"
import { CancellationRequestButton } from "@/components/booking/cancellation-request-button"
import { cancelBooking } from "@/actions/booking-actions"

import { useTranslation } from "@/components/providers/locale-context"

interface DashboardHistoryManagerProps {
    bookings: any[]
}

export function DashboardHistoryManager({ bookings }: DashboardHistoryManagerProps) {
    const { t } = useTranslation()
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [selectedFieldId, setSelectedFieldId] = useState<string>("all")
    const [showFilters, setShowFilters] = useState(false)

    const statuses = [
        { id: 'PENDING', label: t('statusPending') },
        { id: 'CONFIRMED', label: t('statusConfirmed') },
        { id: 'REJECTED', label: t('statusRejected') },
        { id: 'CANCEL_REQUESTED', label: t('statusCancelRequested') },
        { id: 'CANCELLED', label: t('statusCancelled') },
        { id: 'BLOCKED', label: t('statusBlocked') },
    ]

    // Extract unique fields from bookings
    const fields = Array.from(new Set(bookings.map(b => JSON.stringify(b.field))))
        .map(s => JSON.parse(s))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

    const filteredBookings = bookings.filter(b => {
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(b.status)
        const fieldMatch = selectedFieldId === "all" || b.field.id === selectedFieldId
        return statusMatch && fieldMatch
    })

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        )
    }

    const clearFilters = () => {
        setSelectedStatuses([])
        setSelectedFieldId("all")
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="px-1 py-4">
                    <h1 className="text-3xl font-black text-white mb-1 drop-shadow-lg">{t('myBookings')}</h1>
                    <p className="text-sm text-green-100 font-bold uppercase tracking-wider drop-shadow-sm">{t('manageReservations')}</p>
                </div>
                <Button asChild className="bg-green-600 hover:bg-green-700 h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 transition-all hover:scale-105 active:scale-95 border-0">
                    <Link href="/fields">{t('bookNewField')}</Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="px-2 py-2 inline-flex items-center gap-2">
                    <History className="h-5 w-5 text-white drop-shadow-sm" />
                    <h2 className="text-xl font-bold text-white drop-shadow-md">
                        {t('bookingHistoryTitle')}
                    </h2>
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">{filteredBookings.length}</Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={showFilters ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="rounded-xl h-10 gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm shadow-sm hover:bg-white/20 transition-all font-bold"
                    >
                        <Filter className="h-4 w-4" />
                        {t('filters')}
                        {(selectedStatuses.length > 0 || selectedFieldId !== "all") && (
                            <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 rounded-full font-black bg-white text-black">
                                {(selectedStatuses.length > 0 ? 1 : 0) + (selectedFieldId !== "all" ? 1 : 0)}
                            </Badge>
                        )}
                    </Button>
                    {(selectedStatuses.length > 0 || selectedFieldId !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white drop-shadow-sm hover:text-red-400 font-bold">
                            <X className="h-4 w-4 mr-1" /> {t('clear')}
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-black text-white uppercase tracking-wider">{t('filterByStatus')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {statuses.map(status => (
                                <div key={status.id} className="flex items-center space-x-2 bg-white/50 p-2.5 rounded-xl border border-white/60 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <Checkbox
                                        id={`dash-status-${status.id}`}
                                        checked={selectedStatuses.includes(status.id)}
                                        onCheckedChange={() => toggleStatus(status.id)}
                                        className="rounded-md"
                                    />
                                    <Label
                                        htmlFor={`dash-status-${status.id}`}
                                        className="text-xs font-bold text-white/80 cursor-pointer flex-1 group-hover:text-white"
                                    >
                                        {status.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-black text-white uppercase tracking-wider">{t('fieldStadium')}</Label>
                        <select
                            className="w-full md:w-1/3 h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:ring-2 focus:ring-green-500 transition-all outline-none text-sm font-bold text-white shadow-sm"
                            value={selectedFieldId}
                            onChange={(e) => setSelectedFieldId(e.target.value)}
                        >
                            <option value="all">{t('allStadiums')}</option>
                            {fields.map((field: any) => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {filteredBookings.map((booking: any) => (
                    <Card key={booking.id} className="flex flex-col md:flex-row items-stretch overflow-hidden border-white/40 shadow-lg hover:shadow-xl transition-all group bg-white/90 backdrop-blur-sm">
                        <div className="relative w-full md:w-48 h-40 md:h-auto shrink-0 bg-gray-200 overflow-hidden">
                            <Image
                                src={`/api/field-image/${booking.field.id}`}
                                alt={booking.field.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex-1 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-2xl text-gray-900 mb-1">{booking.field.name}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-bold">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-green-600" />
                                                {formatInEgyptDate(booking.startTime)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-4 w-4 text-green-600" />
                                                {formatInEgyptTime(booking.startTime)}
                                            </div>
                                            <div className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                {(booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60)} {t('hoursCount')}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                                <div className="flex items-center gap-4">
                                    {booking.receiptUrl && (
                                        <Link href={`/receipt/${booking.id}`} target="_blank" className="text-green-600 hover:text-green-700 text-sm font-black flex items-center gap-1 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                            <span>📄</span> {t('viewReceipt')}
                                        </Link>
                                    )}

                                    {booking.status === 'CONFIRMED' && (
                                        <CancellationRequestButton bookingId={booking.id} />
                                    )}
                                </div>

                                {booking.status === 'PENDING' && (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" asChild className="rounded-xl font-bold px-4 h-10">
                                            <Link href={`/dashboard/edit/${booking.id}`}>{t('edit')}</Link>
                                        </Button>
                                        <form action={async () => {
                                            await cancelBooking(booking.id)
                                        }}>
                                            <Button variant="destructive" size="sm" type="submit" className="rounded-xl font-bold px-4 h-10 shadow-lg shadow-red-500/20">{t('cancel')}</Button>
                                        </form>
                                    </div>
                                )}

                                {booking.status === 'CANCEL_REQUESTED' && (
                                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-3">
                                        <span className="animate-pulse flex h-3 w-3 rounded-full bg-orange-400"></span>
                                        <p className="text-xs font-black text-orange-800 uppercase tracking-tight">{t('cancellationPending')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredBookings.length === 0 && (
                    <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border-2 border-dashed border-white/10">
                        <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <History className="h-8 w-8 text-white/50" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">{t('noBookingsFound')}</h3>
                        <p className="text-white/60 font-bold">{t('adjustFilters')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation()
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
        CONFIRMED: "bg-green-100 text-green-800 border-green-200",
        REJECTED: "bg-red-100 text-red-800 border-red-200",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800 border-orange-200",
        CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
        BLOCKED: "bg-orange-100 text-orange-800 border-orange-400"
    }

    const labels = {
        PENDING: t('statusPending'),
        CONFIRMED: t('statusConfirmed'),
        REJECTED: t('statusRejected'),
        CANCEL_REQUESTED: t('statusCancelRequested'),
        CANCELLED: t('statusCancelled'),
        BLOCKED: t('statusBlocked')
    }

    return (
        <Badge className={(styles[status as keyof typeof styles] || "") + " py-1.5 px-3 rounded-xl border font-black text-[10px] uppercase tracking-wider shadow-sm"}>
            {labels[status as keyof typeof labels] || status.replace('_', ' ')}
        </Badge>
    )
}
