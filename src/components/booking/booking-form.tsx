'use client'

import { useActionState, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { checkAvailability, createBooking } from "@/actions/booking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, PlusCircle, Timer, Calendar, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"

export function BookingForm({ field, userRole }: { field: any, userRole: string }) {
    const [step, setStep] = useState(1)
    const [slots, setSlots] = useState<any[]>([])
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
    const [currentTime, setCurrentTime] = useState("")
    const [currentDuration, setCurrentDuration] = useState(1)

    const [state, dispatch] = useActionState(createBooking, null)
    const [isChecking, setIsChecking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

    const isOwner = userRole === 'owner' || userRole === 'admin'

    const totalPrice = useMemo(() => {
        let basePrice = slots.reduce((acc, slot) => acc + (field.pricePerHour * slot.duration), 0)
        // If no slots added yet, but current picker has values, show that price as preview
        if (slots.length === 0 && currentDate && currentTime) {
            basePrice = field.pricePerHour * currentDuration
        }
        return basePrice
    }, [slots, field.pricePerHour, currentDate, currentTime, currentDuration])

    const handleAddSlot = () => {
        if (!currentDate || !currentTime) return
        const exists = slots.find(s => s.date === currentDate && s.startTime === currentTime)
        if (exists) return
        setSlots([...slots, { date: currentDate, startTime: currentTime, duration: currentDuration }])
        setCurrentTime("")
        setError(null)
    }

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index))
    }

    const handleNextStep = async () => {
        setError(null)
        const slotsToValidate = slots.length > 0
            ? slots
            : (currentDate && currentTime ? [{ date: currentDate, startTime: currentTime, duration: currentDuration }] : [])

        if (slotsToValidate.length === 0) {
            setError("Please select at least one time slot.")
            return
        }

        setIsChecking(true)
        const result = await checkAvailability(field.id, slotsToValidate)
        setIsChecking(false)

        if (result.success) {
            if (slots.length === 0 && currentDate && currentTime) {
                // Auto-add the current selection if not added to list
                setSlots([{ date: currentDate, startTime: currentTime, duration: currentDuration }])
            }
            setStep(2)
        } else {
            setError(result.message || "Slots are not available.")
        }
    }

    return (
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="fieldId" value={field.id} />
            <input type="hidden" name="slots" value={JSON.stringify(slots)} />

            {/* Stepper Header */}
            <div className="flex items-center justify-between px-2 mb-4">
                <div className={`flex items-center gap-2 ${step === 1 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>1</div>
                    <span className="text-sm font-semibold">Select Time</span>
                </div>
                <div className="h-px flex-1 bg-gray-200 mx-4"></div>
                <div className={`flex items-center gap-2 ${step === 2 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</div>
                    <span className="text-sm font-semibold">Payment</span>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                                Add Another
                            </Button>
                        </div>
                    </div>

                    {/* Selected Slots List (only if multiple added) */}
                    {slots.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-700 px-1">Selected Slots</h3>
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

                    <Card className="bg-green-50 border-green-100">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center text-lg font-bold text-green-900">
                                <span>Estimated Total:</span>
                                <span>{totalPrice} EGP</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="button"
                        className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                        disabled={isChecking}
                        onClick={handleNextStep}
                    >
                        {isChecking ? "Checking availability..." : (
                            <>
                                Next: Payment Instructions
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-green-900">Slots are Available!</h3>
                            <p className="text-sm text-green-800">Please complete the payment to secure your booking.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700 px-1">Booking Summary</h3>
                        <div className="grid gap-2">
                            {slots.map((slot, idx) => (
                                <div key={idx} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-600">{slot.date} @ {slot.startTime}</span>
                                    <span className="font-medium">{slot.duration * field.pricePerHour} EGP</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-bold text-lg">
                                <span>Total:</span>
                                <span>{totalPrice} EGP</span>
                            </div>
                        </div>
                    </div>

                    {!isOwner ? (
                        <div className="space-y-4 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                            <h3 className="font-semibold text-yellow-800">Payment Instructions</h3>
                            <p className="text-sm text-yellow-700">
                                Please transfer <strong>{totalPrice} EGP</strong> to <strong>01000000000 (InstaPay)</strong> and upload the receipt screenshot below.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="receipt">Upload Receipt</Label>
                                <Input
                                    type="file"
                                    id="receipt"
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
                    ) : (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                            <strong>Note:</strong> As an admin/owner, you are blocking this slot manually. No receipt is required.
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12"
                            onClick={() => setStep(1)}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <SubmitButton isOwner={isOwner} canSubmit={true} />
                    </div>
                </div>
            )}

            {(error || state?.message) && (
                <p className="text-sm mt-2 text-center text-red-500 font-medium">
                    {error || state?.message}
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
            {pending ? "Booking..." : "Confirm & Book Now"}
        </Button>
    )
}
