'use client'

import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/components/providers/locale-context"

export default function LoginPage() {
    const { t } = useTranslation()
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <Card className="mx-auto max-w-sm w-full shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('loginTitle')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('loginDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    )
}
