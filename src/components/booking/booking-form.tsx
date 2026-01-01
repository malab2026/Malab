'use client'

import { useActionState, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { createBooking } from "@/actions/booking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, PlusCircle, Timer, Calendar } from "lucide-react"

export function BookingForm({ field, userRole }: { field: any, userRole: string }) {
    const [slots, setSlots] = useState<any[]>([])
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
    const [currentTime, setCurrentTime] = useState("")
    const [currentDuration, setCurrentDuration] = useState(1)

    const [state, dispatch] = useActionState(createBooking, null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

    const isOwner = userRole === 'owner' || userRole === 'admin'

    const totalPrice = useMemo(() => {
        return slots.reduce((acc, slot) => acc + (field.pricePerHour * slot.duration), 0)
    }, [slots, field.pricePerHour])

    const handleAddSlot = () => {
        if (!currentDate || !currentTime) return

        // Prevent local duplicates
        const exists = slots.find(s => s.date === currentDate && s.startTime === currentTime)
        if (exists) return

        setSlots([...slots, { date: currentDate, startTime: currentTime, duration: currentDuration }])
        setCurrentTime("") // Reset time after adding
    }

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index))
    }

    return (
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="fieldId" value={field.id} />
            <input type="hidden" name="slots" value={JSON.stringify(slots)} />

            {/* Slot Picker */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            type="date"
                            id="date"
                            name="date"
                            value={currentDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setCurrentDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                            type="time"
                            id="startTime"
                            name="startTime"
                            value={currentTime}
                            onChange={(e) => setCurrentTime(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <select
                            id="duration"
                            name="duration"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={currentDuration}
                            onChange={(e) => setCurrentDuration(Number(e.target.value))}
                        >
                            <option value="1">1 Hour</option>
                            <option value="2">2 Hours</option>
                            <option value="3">3 Hours</option>
                        </select>
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddSlot}
                        variant="outline"
                        className="bg-white text-green-700 hover:bg-green-50 border-green-200"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another Slot
                    </Button>
                </div>
                <p className="text-[10px] text-gray-500 italic px-1">
                    Tip: You can add multiple slots to book them all at once, or just fill the above and click confirm.
                </p>
            </div>

            {/* Selected Slots List (only if multiple added) */}
            {slots.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 px-1">Multiple Slots Selection</h3>
                    <div className="grid gap-3">
                        {slots.map((slot, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                                <div className="flex gap-4 items-center">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="mr-1.5 h-4 w-4 text-green-600" />
                                        {slot.date}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Timer className="mr-1.5 h-4 w-4 text-green-600" />
                                        {slot.startTime} ({slot.duration}h)
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeSlot(index)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Total Price Calculation */}
            {(slots.length > 0 || (currentDate && currentTime)) && (
                <Card className="bg-green-50 border-green-100">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-green-800">Price per hour:</span>
                            <span className="text-green-900">{field.pricePerHour} EGP</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-green-900">
                            <span>Total to Pay:</span>
                            <span>{totalPrice || (field.pricePerHour * currentDuration)} EGP</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Section */}
            {(slots.length > 0 || (currentDate && currentTime)) && !isOwner && (
                <div className="space-y-4 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                    <h3 className="font-semibold text-yellow-800">Payment Instructions</h3>
                    <p className="text-sm text-yellow-700">
                        Please transfer <strong>{totalPrice || (field.pricePerHour * currentDuration)} EGP</strong> to <strong>01000000000 (InstaPay)</strong> and upload the receipt screenshot below.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="receipt">Upload Receipt</Label>
                        <Input
                            type="file"
                            name="receipt"
                            accept="image/*"
                            required
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setReceiptPreview(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {receiptPreview && (
                            <div className="mt-2 relative h-40 w-full border rounded overflow-hidden">
                                <img src={receiptPreview} alt="Receipt preview" className="object-contain w-full h-full" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <SubmitButton isOwner={isOwner} canSubmit={slots.length > 0 || (currentDate !== "" && currentTime !== "")} />

            {state?.message && (
                <p className={`text-sm mt-2 text-center text-red-500`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}

function SubmitButton({ isOwner, canSubmit }: { isOwner: boolean, canSubmit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={pending || !canSubmit}
        >
            {pending ? "Booking..." : "Book Now"}
        </Button>
    )
}
