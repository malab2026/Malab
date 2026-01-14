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

import { useTranslation } from "@/components/providers/locale-context"

export function CancellationRequestButton({ bookingId }: { bookingId: string }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState("")
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    async function handleRequest() {
        if (!reason.trim()) {
            toast.error(t('reasonRequired'))
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
                <Button variant="destructive" size="sm">{t('requestCancellation')}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('requestCancellation')}</DialogTitle>
                    <DialogDescription>
                        {t('cancellationNote')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder={t('reasonPlaceholder')}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>{t('cancel')}</Button>
                    <Button variant="destructive" onClick={handleRequest} disabled={pending}>
                        {pending ? t('sending') : t('submitRequest')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
