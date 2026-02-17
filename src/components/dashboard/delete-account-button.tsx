'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteAccount } from "@/actions/auth-actions"
import { useTranslation } from "@/components/providers/locale-context"
import { toast } from "sonner"

export function DeleteAccountButton() {
    const { t } = useTranslation()
    const [isDeleting, setIsDeleting] = useState(false)

    async function handleDelete() {
        if (!confirm(t('deleteAccountConfirm') || "Are you sure you want to delete your account? This action cannot be undone and all your data will be properly removed.")) {
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteAccount()
            if (!result.success) {
                toast.error(result.message || "Failed to delete account")
                setIsDeleting(false)
            } else {
                toast.success("Account deleted successfully")
                // Redirect is handled by server action, but just in case
                window.location.href = "/"
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
            setIsDeleting(false)
        }
    }

    return (
        <div className="pt-8 mt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-red-400 mb-2">{t('dangerZone') || "Danger Zone"}</h3>
            <p className="text-sm text-gray-400 mb-4">
                {t('deleteAccountDescription') || "Once you delete your account, there is no going back. Please be certain."}
            </p>
            <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
            >
                {isDeleting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('deleting') || "Deleting..."}
                    </>
                ) : (
                    <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteAccount') || "Delete Account"}
                    </>
                )}
            </Button>
        </div>
    )
}
