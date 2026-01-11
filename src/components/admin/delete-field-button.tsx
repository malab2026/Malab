"use client"

import { Button } from "@/components/ui/button"
import { deleteField } from "@/actions/admin-actions"
import { toast } from "sonner"

export function DeleteFieldButton({ fieldId }: { fieldId: string }) {
    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this field? All associated bookings will also be deleted.")) {
            return
        }

        try {
            const res = await deleteField(fieldId)
            if (res.success) {
                toast.success(res.message)
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("An error occurred while deleting the field")
        }
    }

    return (
        <Button
            size="sm"
            variant="destructive"
            className="h-8 text-xs"
            onClick={handleDelete}
        >
            Delete
        </Button>
    )
}
