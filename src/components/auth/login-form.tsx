"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// React 19 usage: useActionState from react.

import { useRouter } from "next/navigation"
import { useTranslation } from "@/components/providers/locale-context"

export function LoginForm() {
    const { t } = useTranslation()
    const [state, dispatch] = useActionState(authenticate, undefined)
    const router = useRouter()

    useEffect(() => {
        if (state?.redirectUrl) {
            router.push(state.redirectUrl)
            router.refresh()
        }
    }, [state, router])

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
                <a href="#" className="text-sm text-blue-600 hover:underline">{t('forgotPassword')}</a>
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
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={pending}>
            {pending ? t('loggingIn') : t('logIn')}
        </Button>
    )
}
