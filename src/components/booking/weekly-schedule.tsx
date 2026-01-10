'use client'

import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, addHours, isSameDay, parseISO, isAfter, isBefore } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Slot {
    date: string
    startTime: string
    duration: number
}

interface WeeklyScheduleProps {
    existingBookings: any[]
    selectedSlots: Slot[]
    onSlotSelect: (slot: Slot) => void
    onSlotRemove: (date: string, startTime: string) => void
}

export function WeeklySchedule({ existingBookings, selectedSlots, onSlotSelect, onSlotRemove }: WeeklyScheduleProps) {
    const [viewDate, setViewDate] = useState(new Date())

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(viewDate, i))
    }, [viewDate])

    // Generate hours from 8 AM to 1 AM (next day)
    const hours = useMemo(() => {
        return Array.from({ length: 18 }).map((_, i) => {
            const h = (i + 8) % 24
            return `${h.toString().padStart(2, '0')}:00`
        })
    }, [])

    const isBooked = (date: Date, time: string) => {
        const slotStart = new Date(`${format(date, 'yyyy-MM-dd')}T${time}:00`)
        return existingBookings.some(b => {
            const bStart = new Date(b.startTime)
            const bEnd = new Date(b.endTime)
            return slotStart >= bStart && slotStart < bEnd
        })
    }

    const isSelected = (date: Date, time: string) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return selectedSlots.some(s => s.date === dateStr && s.startTime === time)
    }

    const handleSlotClick = (date: Date, time: string) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        if (isBooked(date, time)) return

        if (isSelected(date, time)) {
            onSlotRemove(dateStr, time)
        } else {
            onSlotSelect({ date: dateStr, startTime: time, duration: 1 })
        }
    }

    const navigateWeek = (direction: 'next' | 'prev') => {
        setViewDate(prev => addDays(prev, direction === 'next' ? 7 : -7))
    }

    const goToToday = () => {
        setViewDate(new Date())
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday} className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-semibold text-lg ml-2">
                        {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
                <div className="min-w-[600px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b bg-gray-50/50">
                        <div className="p-2 border-r text-xs font-medium text-gray-500 flex items-center justify-center">Time</div>
                        {weekDays.map((day, i) => (
                            <div key={i} className={cn(
                                "p-2 text-center border-r last:border-r-0",
                                isSameDay(day, new Date()) && "bg-green-50"
                            )}>
                                <div className="text-xs text-gray-500 uppercase font-bold">{format(day, 'EEE')}</div>
                                <div className={cn(
                                    "text-sm font-bold",
                                    isSameDay(day, new Date()) ? "text-green-600" : "text-gray-900"
                                )}>
                                    {format(day, 'd MMM')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Slots Grid */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {hours.map((time) => (
                            <div key={time} className="grid grid-cols-8 border-b last:border-b-0 hover:bg-gray-50/30 transition-colors">
                                <div className="p-2 border-r text-xs font-semibold text-gray-400 flex items-center justify-center bg-gray-50/30">
                                    {time}
                                </div>
                                {weekDays.map((day, i) => {
                                    const booked = isBooked(day, time)
                                    const selected = isSelected(day, time)
                                    const past = isBefore(new Date(`${format(day, 'yyyy-MM-dd')}T${time}:00`), new Date())

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => !past && handleSlotClick(day, time)}
                                            className={cn(
                                                "p-1 border-r last:border-r-0 h-12 cursor-pointer transition-all flex items-center justify-center",
                                                booked ? "bg-red-50 cursor-not-allowed" :
                                                    selected ? "bg-green-600 shadow-inner" :
                                                        past ? "bg-gray-100/50 cursor-default" : "hover:bg-green-50/50",
                                            )}
                                        >
                                            {booked ? (
                                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-tighter">Booked</div>
                                            ) : selected ? (
                                                <div className="text-[10px] font-bold text-white uppercase tracking-tighter">Selected</div>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-green-200 opacity-0 group-hover:opacity-100" />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 text-xs font-medium text-gray-500 px-1 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-white border shadow-sm"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-600"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
                    <span>Past</span>
                </div>
            </div>
        </div>
    )
}
