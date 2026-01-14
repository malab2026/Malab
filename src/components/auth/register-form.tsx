"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { registerUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useTranslation } from "@/components/providers/locale-context"

export function RegisterForm() {
    const { t } = useTranslation()
    const [errorMessage, dispatch] = useActionState(registerUser, undefined)

    return (
        <form action={dispatch} className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" type="text" name="name" placeholder={locale === 'ar' ? "أحمد محمد" : "John Doe"} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">{t('phoneNumber')} <span className="text-red-500">*</span></Label>
                <Input id="phone" type="tel" name="phone" placeholder="010xxxxxxxxx" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input id="password" type="password" name="password" placeholder="••••••••" required />
            </div>

            <div className="pt-2 border-t border-gray-100">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-500 font-normal">
                        {t('email')} <span className="text-xs text-gray-400 font-light">({t('optional')})</span>
                    </Label>
                    <Input id="email" type="email" name="email" placeholder="m@example.com" className="bg-gray-50/50" />
                </div>
            </div>

            <RegisterButton t={t} />

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
                {t('alreadyHaveAccount')}{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                    {t('logIn')}
                </a>
            </div>
        </form>
    )
}

function RegisterButton({ t }: { t: any }) {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" disabled={pending}>
            {pending ? t('creatingAccount') : t('signUp')}
        </Button>
    )
}
