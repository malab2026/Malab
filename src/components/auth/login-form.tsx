"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// React 19 usage: useActionState from react.

import { useRouter } from "next/navigation"

export function LoginForm() {
    const [state, dispatch] = useActionState(authenticate, undefined)
    const router = useRouter()

    useEffect(() => {
        if (state?.redirectUrl) {
            router.push(state.redirectUrl)
            router.refresh()
        }
    }, [state, router])

    const errorMessage = state?.message

    return (
        <form action={dispatch} className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
            </div>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Remember me
                </label>
                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
            </div>

            <LoginButton />

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
                Don't have an account?{" "}
                <a href="/register" className="text-blue-600 hover:underline">
                    Sign up
                </a>
            </div>
        </form>
    )
}

function LoginButton() {
    const { pending } = useFormStatus()

    return (
        <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={pending}>
            {pending ? "Logging in..." : "Log in"}
        </Button>
    )
}
