"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { registerUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function RegisterForm() {
    const [errorMessage, dispatch] = useActionState(registerUser, undefined)

    return (
        <form action={dispatch} className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="phone" type="tel" name="phone" placeholder="010xxxxxxxxx" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-gray-400 text-xs font-normal">(Optional)</span></Label>
                <Input id="email" type="email" name="email" placeholder="m@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
            </div>

            <RegisterButton />

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
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 hover:underline">
                    Log in
                </a>
            </div>
        </form>
    )
}

function RegisterButton() {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full bg-green-600 hover:bg-green-700 mt-4" disabled={pending}>
            {pending ? "Creating account..." : "Sign Up"}
        </Button>
    )
}
