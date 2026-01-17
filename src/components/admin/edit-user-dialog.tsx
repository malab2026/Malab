'use client'

import { useState } from "react"
import { useActionState } from "react"
import { updateUser } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

interface EditUserDialogProps {
    user: {
        id: string
        name: string | null
        email: string | null
        phone: string | null
        role: string
    }
}

export function EditUserDialog({ user }: EditUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [state, dispatch, isPending] = (useActionState as any)(
        updateUser.bind(null, user.id),
        undefined
    )

    const handleSubmit = async (formData: FormData) => {
        dispatch(formData)
    }

    if (state?.success && open) {
        toast.success(state.message)
        setOpen(false)
    } else if (state?.success === false && state?.message) {
        toast.error(state.message)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User: {user.name}</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={user.name || ""}
                            required
                        />
                        {state?.errors?.name && (
                            <p className="text-xs text-red-500">{state.errors.name[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user.email || ""}
                        />
                        {state?.errors?.email && (
                            <p className="text-xs text-red-500">{state.errors.email[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            defaultValue={user.phone || ""}
                            required
                        />
                        {state?.errors?.phone && (
                            <p className="text-xs text-red-500">{state.errors.phone[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            name="role"
                            defaultValue={user.role}
                            className="w-full h-10 px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                        </select>
                        {state?.errors?.role && (
                            <p className="text-xs text-red-500">{state.errors.role[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                        <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min 6 characters"
                        />
                        {state?.errors?.password && (
                            <p className="text-xs text-red-500">{state.errors.password[0]}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
