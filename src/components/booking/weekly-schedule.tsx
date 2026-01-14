'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, addDays, isSameDay, isBefore } from 'date-fns'
import { ChevronLeft, ChevronRight, Timer, Calendar } from 'lucide-react'
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
    const [selectedDay, setSelectedDay] = useState<Date>(new Date())

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(viewDate, i))
    }, [viewDate])

    // Sync selectedDay with viewDate changes if needed
    useEffect(() => {
        if (!weekDays.some(day => isSameDay(day, selectedDay))) {
            setSelectedDay(weekDays[0])
        }
    }, [weekDays, selectedDay])

    // Generate hours from 8 AM to 2 AM (next day)
    const hours = useMemo(() => {
        return Array.from({ length: 19 }).map((_, i) => {
            const h = (i + 8) % 24
            return `${h.toString().padStart(2, '0')}:00`
        })
    }, [])

    const getSlotDateTime = (date: Date, time: string) => {
        const [h, m] = time.split(':').map(Number)
        // Create a new date starting from the selected day's year/month/day
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0, 0)

        // If the hour is early morning (0, 1, 2 AM), it's part of the session 
        // starting on the previous calendar day's night.
        if (h < 8) {
            d.setDate(d.getDate() + 1)
        }
        return d
    }

    const isBooked = (date: Date, time: string) => {
        const slotStart = getSlotDateTime(date, time)
        return existingBookings.some(b => {
            const bStart = new Date(b.startTime)
            const bEnd = new Date(b.endTime)
            return slotStart >= bStart && slotStart < bEnd
        })
    }

    const isSelected = (date: Date, time: string) => {
        const slotStart = getSlotDateTime(date, time)
        const dateStr = format(slotStart, 'yyyy-MM-dd')
        return selectedSlots.some(s => s.date === dateStr && s.startTime === time)
    }

    const handleSlotClick = (date: Date, time: string) => {
        const slotStart = getSlotDateTime(date, time)
        const dateStr = format(slotStart, 'yyyy-MM-dd')

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
        const today = new Date()
        setViewDate(today)
        setSelectedDay(today)
    }

    const formatTimeDisplay = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(h, m)
        return format(date, 'h:mm a')
    }

    return (
        <div className="space-y-6">
            {/* Header - Simple Title, No Navigation */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Booking Schedule</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={goToToday} className="text-[10px] font-black uppercase tracking-widest text-green-600 hover:bg-green-50">
                    RESET TO TODAY
                </Button>
            </div>

            {/* Horizontal Day Picker */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x h-24">
                {weekDays.map((day, i) => {
                    const active = isSameDay(day, selectedDay)
                    const isToday = isSameDay(day, new Date())
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[70px] rounded-2xl border transition-all active:scale-95 snap-start",
                                active
                                    ? "bg-green-600 border-green-600 text-white shadow-lg ring-4 ring-green-100"
                                    : "bg-white border-gray-100 text-gray-600 hover:border-green-200"
                            )}
                        >
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest mb-1", active ? "text-green-100" : "text-gray-400")}>
                                {format(day, 'EEE')}
                            </span>
                            <span className="text-xl font-black leading-none tracking-tighter">
                                {format(day, 'd')}
                            </span>
                            {isToday && !active && <div className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                        </button>
                    )
                })}
            </div>

            {/* Selection Status For Selected Day */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <div>
                        <h3 className="font-black text-gray-900 leading-tight">
                            Available slots for {format(selectedDay, 'EEEE')}
                        </h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {format(selectedDay, 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {hours.map((time) => {
                        const booked = isBooked(selectedDay, time)
                        const selected = isSelected(selectedDay, time)
                        const slotDateTime = getSlotDateTime(selectedDay, time)
                        const past = isBefore(slotDateTime, new Date())

                        return (
                            <button
                                key={time}
                                type="button"
                                disabled={booked || past}
                                onClick={() => handleSlotClick(selectedDay, time)}
                                className={cn(
                                    "relative h-16 rounded-2xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1.5",
                                    booked ? "bg-red-600 border-red-700 text-white cursor-not-allowed shadow-sm" :
                                        selected ? "bg-blue-600 border-blue-700 text-white shadow-lg scale-[1.05] z-10" :
                                            past ? "bg-gray-50 border-gray-100 text-gray-300 cursor-default" :
                                                "bg-green-500 border-green-600 text-white hover:bg-green-600 active:scale-95 shadow-sm"
                                )}
                            >
                                <Timer className={cn("h-4 w-4", (selected || booked || !past) ? "text-white/80" : "text-gray-400")} />
                                {formatTimeDisplay(time)}
                                {booked && <span className="absolute -top-1 -right-1 text-[8px] bg-white text-red-600 px-2 py-0.5 rounded-full border-2 border-red-600 font-bold leading-none">BOOKED</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Optimized Legend */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-green-500 shadow-sm"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-red-600 shadow-sm"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Occupied</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-blue-600 shadow-sm"></div>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Selected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
