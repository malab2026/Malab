"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { processCancellationRequest } from "@/actions/admin-actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function ProcessCancellationDialog({ booking }: { booking: any }) {
    const [refundAmount, setRefundAmount] = useState(booking.field.pricePerHour.toString())
    const [adminNote, setAdminNote] = useState("")
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    async function handleProcess(action: "APPROVE" | "REJECT") {
        setPending(true)
        const res = await processCancellationRequest(
            booking.id,
            action,
            parseFloat(refundAmount),
            adminNote
        )
        setPending(false)

        if (res.success) {
            toast.success(res.message)
            setOpen(false)
        } else {
            toast.error(res.message)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-orange-600 text-white hover:bg-orange-700">Review Request</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Process Cancellation</DialogTitle>
                    <DialogDescription>
                        User: {booking.user.name} ({booking.user.email})<br />
                        Reason: {booking.cancellationReason || "No reason provided"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="refund">Refund Amount (EGP)</Label>
                        <Input
                            id="refund"
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="note">Admin Note (Internal/User)</Label>
                        <Textarea
                            id="note"
                            placeholder="Reason for refund decision..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button variant="destructive" onClick={() => handleProcess("REJECT")} disabled={pending}>
                        Reject Cancellation
                    </Button>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleProcess("APPROVE")} disabled={pending}>
                        Approve & Refund
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
