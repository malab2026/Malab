'use client'

import { useState } from "react"
import { deleteClub } from "@/actions/club-actions"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteClubButtonProps {
    clubId: string
    clubName: string
    hasFields: boolean
}

export function DeleteClubButton({ clubId, clubName, hasFields }: DeleteClubButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        const message = hasFields
            ? `Are you sure you want to delete "${clubName}"? This club has active fields. You might need to delete or reassign them first.`
            : `Are you sure you want to delete "${clubName}"?`

        if (!window.confirm(message)) return

        setIsLoading(true)
        const result = await deleteClub(clubId)
        setIsLoading(false)

        if (result.success) {
            toast.success(result.message)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
