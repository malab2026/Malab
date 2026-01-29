'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { AdminBookingCard } from "./admin-booking-card"

import { useTranslation } from "@/components/providers/locale-context"

interface AdminHistoryManagerProps {
    bookings: any[]
}

export function AdminHistoryManager({ bookings }: AdminHistoryManagerProps) {
    const { t } = useTranslation()
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [selectedFieldId, setSelectedFieldId] = useState<string>("all")
    const [showFilters, setShowFilters] = useState(false)

    const statuses = [
        { id: 'PENDING', label: t('statusPending') },
        { id: 'CONFIRMED', label: t('statusConfirmed') },
        { id: 'REJECTED', label: t('statusRejected') },
        { id: 'CANCEL_REQUESTED', label: t('statusCancelRequested') },
        { id: 'CANCEL_APPROVED', label: t('statusCancelled') },
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 inline-block">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        {t('recentActivity')}
                        <Badge variant="secondary" className="bg-gray-100 ml-2">{filteredBookings.length}</Badge>
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={showFilters ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="rounded-xl h-10 gap-2 border-white/20 bg-white/50 font-bold"
                    >
                        <Filter className="h-4 w-4" />
                        {t('filters')}
                        {(selectedStatuses.length > 0 || selectedFieldId !== "all") && (
                            <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 rounded-full font-bold">
                                {(selectedStatuses.length > 0 ? 1 : 0) + (selectedFieldId !== "all" ? 1 : 0)}
                            </Badge>
                        )}
                    </Button>
                    {(selectedStatuses.length > 0 || selectedFieldId !== "all") && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-red-500 font-bold">
                            <X className="h-4 w-4 mr-1" /> {t('clear')}
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-white/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-black text-gray-700 uppercase tracking-wider">{t('filterByStatus')}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {statuses.map(status => (
                                <div key={status.id} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <Checkbox
                                        id={`status-${status.id}`}
                                        checked={selectedStatuses.includes(status.id)}
                                        onCheckedChange={() => toggleStatus(status.id)}
                                        className="rounded-md"
                                    />
                                    <Label
                                        htmlFor={`status-${status.id}`}
                                        className="text-[10px] font-bold text-gray-600 cursor-pointer flex-1 group-hover:text-gray-900 uppercase tracking-tight"
                                    >
                                        {status.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-black text-gray-700 uppercase tracking-wider">{t('fieldStadium')}</Label>
                        <select
                            className="w-full md:w-1/3 h-11 bg-white border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold shadow-sm"
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
                {filteredBookings.map((booking) => (
                    <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                ))}
                {filteredBookings.length === 0 && (
                    <div className="bg-white/50 rounded-2xl p-16 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <X className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-1">{t('noBookingsFound')}</h3>
                        <p className="text-gray-500 font-bold">{t('adjustFilters')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
