"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { requestCancellation } from "@/actions/booking-actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function CancellationRequestButton({ bookingId }: { bookingId: string }) {
    const [reason, setReason] = useState("")
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    async function handleRequest() {
        if (!reason.trim()) {
            toast.error("Please provide a reason for cancellation")
            return
        }

        setPending(true)
        const res = await requestCancellation(bookingId, reason)
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
                <Button variant="destructive" size="sm">Request Cancellation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Cancellation</DialogTitle>
                    <DialogDescription>
                        Please explain why you want to cancel this booking. Your request will be reviewed by the admin.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Type your reason here..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleRequest} disabled={pending}>
                        {pending ? "Sending..." : "Submit Request"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
