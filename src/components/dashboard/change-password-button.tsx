'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { changePassword } from "@/actions/auth-actions"
import { useTranslation } from "@/components/providers/locale-context"
import { toast } from "sonner"
import { Lock, Loader2, KeyRound } from "lucide-react"

export function ChangePasswordButton() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error(t('passwordMismatch') || "Passwords do not match")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append('currentPassword', currentPassword)
            formData.append('newPassword', newPassword)
            formData.append('confirmPassword', confirmPassword)

            const result = await changePassword(undefined, formData)
            if (result.success) {
                toast.success(result.message)
                setIsOpen(false)
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="bg-white/5 hover:bg-white/10 text-white border-white/20"
            >
                <KeyRound className="mr-2 h-4 w-4" />
                {t('changePassword') || "Change Password"}
            </Button>
        )
    }

    return (
        <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    {t('changePassword') || "Change Password"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-white/80">
                            {t('currentPassword') || "Current Password"}
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white/80">
                            {t('newPassword') || "New Password"}
                        </Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white/80">
                            {t('confirmNewPassword') || "Confirm New Password"}
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                            required
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('saving') || "Saving..."}
                                </>
                            ) : (
                                t('save') || "Save"
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            {t('cancel') || "Cancel"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
