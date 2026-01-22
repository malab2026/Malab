'use client'

import { useState } from "react"
import { broadcastNotification } from "@/actions/notification-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Megaphone } from "lucide-react"

export function BroadcastForm() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const message = formData.get('message') as string

        try {
            await broadcastNotification(title, message, "ANNOUNCEMENT")
            toast.success("Broadcast sent to all users!")
            e.currentTarget.reset()
        } catch (error) {
            toast.error("Failed to send broadcast")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-blue-50/50">
                <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl">Broadcast Announcement</CardTitle>
                </div>
                <CardDescription>Send a notification to all registered users</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Announcement Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="e.g., Tournament Registration Open!"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message Content *</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Type your message to all users here..."
                            rows={4}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {isLoading ? "Sending..." : "Send to All Users 🚀"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
