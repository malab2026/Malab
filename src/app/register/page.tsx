'use client'

import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/components/providers/locale-context"

export default function RegisterPage() {
    const { t } = useTranslation()
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="mx-auto max-w-sm w-full shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('createAccountTitle')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('createAccountDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm />
                </CardContent>
            </Card>
        </div>
    )
}
