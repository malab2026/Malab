"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate, sendWhatsAppReset } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { MessageCircle, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { getWhatsAppChatLink } from "@/lib/whatsapp"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"
import { useTranslation } from "@/components/providers/locale-context"

export function LoginForm() {
    const { t } = useTranslation()
    const [state, dispatch] = useActionState(authenticate, undefined)
    const router = useRouter()

    const [resetPhone, setResetPhone] = useState("")
    const [isResetLoading, setIsResetLoading] = useState(false)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)

    useEffect(() => {
        if (state?.redirectUrl) {
            router.push(state.redirectUrl)
            // Force a slight delay then refresh or redirect to ensure session is picked up
            setTimeout(() => {
                window.location.href = state.redirectUrl || '/'
            }, 100)
        }
    }, [state, router])

    const handleWhatsAppReset = async () => {
        if (!resetPhone || resetPhone.length < 10) {
            toast.error("Please enter a valid phone number")
            return
        }

        setIsResetLoading(true)
        const result = await sendWhatsAppReset(resetPhone)
        setIsResetLoading(false)

        if (result.success) {
            const link = getWhatsAppChatLink(result.adminPhone as string, result.message as string)
            window.open(link, '_blank')
            setResetDialogOpen(false)
        } else {
            toast.error(result.message)
        }
    }

    const errorMessage = state?.message

    return (
        <form action={dispatch} className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')}</Label>
                <Input id="phone" type="tel" name="phone" placeholder="01xxxxxxxxx" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input id="password" type="password" name="password" required />
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300" />
                    {t('rememberMe')}
                </label>

                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                        <button type="button" className="text-sm text-blue-600 hover:underline">{t('forgotPasswordLink')}</button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('resetPasswordTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('enterPhoneToReset')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-phone">{t('phoneNumber')}</Label>
                                <Input
                                    id="reset-phone"
                                    type="tel"
                                    value={resetPhone}
                                    onChange={(e) => setResetPhone(e.target.value)}
                                    placeholder="01xxxxxxxxx"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={handleWhatsAppReset}
                                className="w-full bg-green-600 hover:bg-green-700 font-bold gap-2 text-white"
                                disabled={isResetLoading}
                            >
                                {isResetLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                                {t('sendCodeWhatsApp')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <LoginButton t={t} />

            {errorMessage && (
                <div
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <p className="text-sm text-red-500">{errorMessage}</p>
                </div>
            )}

            <div className="mt-4 text-center text-sm">
                {t('dontHaveAccount')}{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                    {t('signUp')}
                </a>
            </div>
        </form>
    )
}

function LoginButton({ t }: { t: any }) {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4 text-white" disabled={pending}>
            {pending ? t('loggingIn') : t('logIn')}
        </Button>
    )
}
