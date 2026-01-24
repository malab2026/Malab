'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WeeklySchedule } from "@/components/booking/weekly-schedule"
import { createBooking, getFieldBookings } from "@/actions/booking-actions"
import { useTranslation } from "@/components/providers/locale-context"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function AdminBlockSlotsDialog({ field }: { field: any }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [existingBookings, setExistingBookings] = useState<any[]>([])
    const [fetchingBookings, setFetchingBookings] = useState(false)

    const handleOpenChange = async (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            setFetchingBookings(true)
            const result = await getFieldBookings(field.id, new Date().toISOString().split('T')[0], new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            if (result.success) {
                setExistingBookings(result.bookings || [])
            }
            setFetchingBookings(false)
        } else {
            setSlots([])
        }
    }

    const handleSlotSelect = (slot: any) => {
        setSlots(prev => [...prev, slot])
    }

    const handleSlotRemove = (date: string, startTime: string) => {
        setSlots(prev => prev.filter(s => !(s.date === date && s.startTime === startTime)))
    }

    const handleConfirm = async () => {
        if (slots.length === 0) return

        setLoading(true)
        const formData = new FormData()
        formData.append('fieldId', field.id)
        formData.append('slots', JSON.stringify(slots))
        formData.append('isBlock', 'true')

        // Note: createBooking on server will handle admin-specific logic 
        // (no receipt required, auto-confirmation)
        const result = await createBooking(null, formData)

        setLoading(false)

        if (result && result.message) {
            toast.error(result.message)
        } else {
            toast.success(t('slotsAvailable')) // Reuse success message
            setOpen(false)
            setSlots([])
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    🔒 {t('blockSlots')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center pr-8">
                        <span>{t('blockSlots')} - {field.name}</span>
                        {slots.length > 0 && (
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                                {slots.length} {t('selected')}
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {fetchingBookings ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <WeeklySchedule
                            existingBookings={existingBookings}
                            selectedSlots={slots}
                            onSlotSelect={handleSlotSelect}
                            onSlotRemove={handleSlotRemove}
                        />
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="ghost" onClick={() => setOpen(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={loading || slots.length === 0}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('blockingSlots')}
                            </>
                        ) : t('confirmBlockSlots')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Badge({ children, className, variant = "default" }: any) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${className}`}>
            {children}
        </span>
    )
}
