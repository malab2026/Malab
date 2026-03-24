'use client'

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, CheckCircle2 } from "lucide-react"
import { useTranslation } from "@/components/providers/locale-context"

function ResetPasswordForm() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!token) {
        return (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 font-medium">{t('invalidToken')}</p>
                <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/login')}
                >
                    {t('back')}
                </Button>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error(t('passwordMismatch'))
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            const result = await resetPassword(token, password)
            if (result.success) {
                setIsSuccess(true)
                toast.success(t('passwordResetSuccess'))
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center p-10 space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="bg-green-100 p-3 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('passwordResetSuccess')}</h2>
                <p className="text-gray-500">توجيهك لصفحة تسجيل الدخول خلال لحظات...</p>
                <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push('/login')}
                >
                    {t('logIn')}
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="password">{t('newPassword')}</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('confirmNewPassword')}</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('resettingPassword')}
                    </>
                ) : (
                    t('resetButton')
                )}
            </Button>
        </form>
    )
}

export default function ResetPasswordPage() {
    console.log('[ResetPasswordPage] Page loaded')
    return (
        <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-white py-12">
            <Card className="mx-auto max-w-md w-full shadow-2xl border-none ring-1 ring-gray-200">
                <CardHeader className="space-y-2 text-center pb-8 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                    <div className="flex justify-center mb-2">
                        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg ring-4 ring-blue-100">
                            <Lock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">إعادة تعيين كلمة المرور</CardTitle>
                    <CardDescription className="text-gray-500">
                        أدخل كلمة المرور الجديدة لحسابك في ملاعبنا
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}
