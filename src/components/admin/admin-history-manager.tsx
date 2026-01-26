'use client'

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { AdminBookingCard } from "./admin-booking-card"

interface AdminHistoryManagerProps {
    bookings: any[]
}

export function AdminHistoryManager({ bookings }: AdminHistoryManagerProps) {
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const statuses = [
        { id: 'CONFIRMED', label: 'Confirmed' },
        { id: 'REJECTED', label: 'Rejected' },
        { id: 'CANCEL_REQUESTED', label: 'Cancel Requested' },
        { id: 'CANCEL_APPROVED', label: 'Cancelled' },
        { id: 'BLOCKED', label: 'Manual Block' },
    ]

    const filteredBookings = selectedStatuses.length > 0
        ? bookings.filter(b => selectedStatuses.includes(b.status))
        : bookings

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        )
    }

    const clearFilters = () => setSelectedStatuses([])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 inline-block">
                    <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                        Recent Activity
                        <Badge variant="secondary" className="bg-gray-100 ml-2">{filteredBookings.length}</Badge>
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={showFilters ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="rounded-xl h-10 gap-2 border-white/20 bg-white/50"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {selectedStatuses.length > 0 && (
                            <Badge variant="default" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 rounded-full font-bold">
                                {selectedStatuses.length}
                            </Badge>
                        )}
                    </Button>
                    {selectedStatuses.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-red-500">
                            <X className="h-4 w-4 mr-1" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {showFilters && (
                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {statuses.map(status => (
                            <div key={status.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
                                <Checkbox
                                    id={`status-${status.id}`}
                                    checked={selectedStatuses.includes(status.id)}
                                    onCheckedChange={() => toggleStatus(status.id)}
                                />
                                <Label
                                    htmlFor={`status-${status.id}`}
                                    className="text-xs font-semibold cursor-pointer flex-1"
                                >
                                    {status.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {filteredBookings.map((booking) => (
                    <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                ))}
                {filteredBookings.length === 0 && (
                    <div className="bg-white/50 rounded-xl p-10 text-center border border-dashed text-gray-400 font-medium font-bold">
                        No results match your filters.
                    </div>
                )}
            </div>
        </div>
    )
}
