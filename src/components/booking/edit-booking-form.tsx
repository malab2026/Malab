'use client'

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { updateBooking } from "@/actions/booking-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function EditBookingForm({ booking }: { booking: any }) {
    // We bind the booking.id to the action
    const updateBookingWithId = updateBooking.bind(null, booking.id)
    const [state, dispatch] = useActionState(updateBookingWithId, null)

    // Convert Dates to strings for inputs
    const existingDate = new Date(booking.startTime).toISOString().split('T')[0]
    const existingTime = new Date(booking.startTime).toTimeString().split(' ')[0].slice(0, 5)
    const existingDuration = (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60 * 60)

    const [duration, setDuration] = useState(existingDuration)

    return (
        <form action={dispatch} className="space-y-6">
            <input type="hidden" name="fieldId" value={booking.fieldId} />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        type="date"
                        name="date"
                        defaultValue={existingDate}
                        required
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                        type="time"
                        name="startTime"
                        defaultValue={existingTime}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="duration">Duration (Hours)</Label>
                <select
                    name="duration"
                    id="duration"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                </select>
            </div>

            <Card className="bg-muted">
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Price per hour:</span>
                        <span>{booking.field.pricePerHour} EGP</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>New Total:</span>
                        <span>{booking.field.pricePerHour * duration} EGP</span>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Editing a booking will keep it in <b>PENDING</b> status until reviewed by the field owner.
                </p>
            </div>

            <div className="flex gap-4">
                <Button variant="outline" className="w-full" asChild>
                    <a href="/dashboard">Cancel</a>
                </Button>
                <SubmitButton />
            </div>

            {state?.message && (
                <p className="text-red-500 text-sm mt-2">{state.message}</p>
            )}
        </form>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={pending}>
            {pending ? "Updating..." : "Save Changes"}
        </Button>
    )
}
