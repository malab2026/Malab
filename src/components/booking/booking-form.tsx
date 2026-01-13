'use client'

import { useActionState, useState, useMemo } from "react"
import { useFormStatus } from "react-dom"
import { checkAvailability, createBooking } from "@/actions/booking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Timer, Calendar, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { WeeklySchedule } from "./weekly-schedule"

export function BookingForm({
    field,
    userRole,
    initialBookings = [],
    serviceFee: initialServiceFee = 10
}: {
    field: any,
    userRole: string,
    initialBookings?: any[],
    serviceFee?: number
}) {
    const [step, setStep] = useState(1)
    const [slots, setSlots] = useState<any[]>([])
    const serviceFeePerBooking = initialServiceFee

    // Receipt state and other existing states
    const [state, dispatch] = useActionState(createBooking, null)
    const [isChecking, setIsChecking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

    const isOwner = userRole === 'owner' || userRole === 'admin'

    const totalPrice = useMemo(() => {
        const pitchSubtotal = slots.reduce((acc, slot) => acc + (field.pricePerHour * slot.duration), 0)
        return pitchSubtotal + (slots.length > 0 ? serviceFeePerBooking : 0)
    }, [slots, field.pricePerHour, serviceFeePerBooking])

    const handleSlotSelect = (slot: any) => {
        setSlots(prev => [...prev, slot])
        setError(null)
    }

    const handleSlotRemove = (date: string, startTime: string) => {
        setSlots(prev => prev.filter(s => !(s.date === date && s.startTime === startTime)))
    }

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index))
    }

    const handleNextStep = async () => {
        setError(null)
        if (slots.length === 0) {
            setError("Please select at least one time slot from the schedule.")
            return
        }

        setIsChecking(true)
        const result = await checkAvailability(field.id, slots)
        setIsChecking(false)

        if (result.success) {
            setStep(2)
        } else {
            setError(result.message || "Some selected slots are no longer available.")
        }
    }

    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number)
        const date = new Date()
        date.setHours(h, m)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
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
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Select Available Slots
                        </Label>
                        <WeeklySchedule
                            existingBookings={initialBookings}
                            selectedSlots={slots}
                            onSlotSelect={handleSlotSelect}
                            onSlotRemove={handleSlotRemove}
                        />
                    </div>

                    {/* Selected Slots List */}
                    {slots.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-700 px-1">Selected ({slots.length})</h3>
                            <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                                {slots.map((slot, index) => (
                                    <div key={index} className="flex items-center justify-between p-2.5 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                                        <div className="flex gap-4 items-center">
                                            <div className="flex items-center text-xs font-semibold text-green-800">
                                                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                                {slot.date}
                                            </div>
                                            <div className="flex items-center text-xs font-semibold text-green-800">
                                                <Timer className="mr-1.5 h-3.5 w-3.5" />
                                                {formatTime(slot.startTime)}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSlot(index)}
                                            className="h-7 w-7 text-green-700 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Card className="bg-green-600 border-green-700 shadow-xl scale-105 mx-2">
                        <CardContent className="py-6">
                            <div className="flex justify-between items-center text-2xl font-black text-white">
                                <span className="flex items-center gap-3">
                                    Total:
                                </span>
                                <span>{totalPrice} EGP</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        type="button"
                        className="w-full h-16 text-xl font-black bg-green-600 hover:bg-green-700 shadow-2xl active:scale-95 transition-all mt-4 border-b-4 border-green-800"
                        disabled={isChecking || slots.length === 0}
                        onClick={handleNextStep}
                    >
                        {isChecking ? "Checking availability..." : (
                            <>
                                NEXT: PAYMENT
                                <ChevronRight className="ml-2 h-6 w-6 stroke-[3]" />
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

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Booking Summary</h3>
                            <div className="h-0.5 flex-1 mx-4 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="grid gap-3">
                            {slots.map((slot, idx) => (
                                <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-gray-900">{slot.date}</p>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                <Timer className="h-3 w-3" />
                                                {formatTime(slot.startTime)} - {slot.duration} Hour
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">{slot.duration * field.pricePerHour} EGP</p>
                                        </div>
                                    </div>
                            ))}

                                    {/* Service Fee Row */}
                                    {slots.length > 0 && (
                                        <div className="px-4 py-2 flex justify-between items-center text-sm font-bold bg-green-50/50 rounded-xl border border-green-100 text-green-700">
                                            <span className="uppercase tracking-tight">رسم خدمة (Service Fee)</span>
                                            <span>{serviceFeePerBooking} EGP</span>
                                        </div>
                                    )}

                                    <div className="mt-2 bg-green-600 p-5 rounded-3xl shadow-xl shadow-green-100 flex justify-between items-center text-white">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Amount</p>
                                            <p className="text-3xl font-black tracking-tighter">{totalPrice} EGP</p>
                                        </div>
                                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                    </div>
                                </div>
                    </div>

                        {!isOwner ? (
                            <div className="space-y-4 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                                <h3 className="font-semibold text-yellow-800">Payment Instructions</h3>
                                <p className="text-sm text-yellow-700 leading-relaxed font-medium">
                                    قم بتحويل مبلغ <strong className="text-lg text-yellow-900">{totalPrice} EGP</strong> شامل (سعر الملاعب + {serviceFeePerBooking} ج خدمة) إلى رقم <strong>01000000000 (InstaPay)</strong> وارفع صورة التحويل بالأسفل.
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

            function SubmitButton({isOwner, canSubmit}: {isOwner: boolean, canSubmit: boolean }) {
    const {pending} = useFormStatus()
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
