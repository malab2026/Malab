'use client'

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { createOwnerAccount } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CreateOwnerForm() {
    const [state, dispatch] = useActionState(createOwnerAccount, null)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Owner Account</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="owner-name">Full Name</Label>
                        <Input id="owner-name" name="name" placeholder="Owner Name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" placeholder="01xxxxxxxxx" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="owner@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="owner-password">Temporary Password</Label>
                        <Input id="owner-password" name="password" type="password" required />
                    </div>

                    <SubmitButton />

                    {state?.message && (
                        <p className={`text-sm mt-2 ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                            {state.message}
                        </p>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
            {pending ? "Creating Account..." : "Create Owner Account"}
        </Button>
    )
}
