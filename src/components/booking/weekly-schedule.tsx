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

    // Generate hours from 8 AM to 2 AM (next day)
    const hours = useMemo(() => {
        return Array.from({ length: 19 }).map((_, i) => {
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
                    <Button variant="outline" size="sm" onClick={goToToday} className="flex items-center gap-1 border-green-200 text-green-700 hover:bg-green-50">
                        <CalendarIcon className="h-4 w-4" />
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="text-gray-500">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="text-gray-500">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className="font-bold text-gray-700 ml-2">
                        {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-sm">
                <div className="min-w-[700px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-8 border-b bg-gray-50/50">
                        <div className="p-3 border-r text-[10px] font-black text-gray-400 flex items-center justify-center uppercase tracking-widest">Time</div>
                        {weekDays.map((day, i) => (
                            <div key={i} className={cn(
                                "p-3 text-center border-r last:border-r-0",
                                isSameDay(day, new Date()) && "bg-green-50/50"
                            )}>
                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-0.5">{format(day, 'EEE')}</div>
                                <div className={cn(
                                    "text-xs font-black",
                                    isSameDay(day, new Date()) ? "text-green-600" : "text-gray-800"
                                )}>
                                    {format(day, 'd MMM')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Slots Grid */}
                    <div className="max-h-[600px] overflow-y-auto">
                        {hours.map((time) => (
                            <div key={time} className="grid grid-cols-8 border-b last:border-b-0">
                                <div className="p-2 border-r text-[11px] font-bold text-gray-400 flex items-center justify-center bg-gray-50/30">
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
                                                "p-1 border-r last:border-r-0 h-10 cursor-pointer transition-all duration-150 border-b border-gray-100",
                                                booked ? "bg-red-600 cursor-not-allowed" :
                                                    selected ? "bg-green-900 shadow-inner ring-1 ring-inset ring-black/20" :
                                                        past ? "bg-gray-100 cursor-default" : "bg-green-400/30 hover:bg-green-400/50",
                                            )}
                                        >
                                            {/* No text inside, just color squares */}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 text-[10px] font-black text-gray-400 px-1 mt-3 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-400/30 border border-green-200"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-900 border border-black/20"></div>
                    <span>Your Selection</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                    <span>Past</span>
                </div>
            </div>
        </div>
    )
}
