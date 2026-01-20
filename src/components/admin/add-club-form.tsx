'use client'

import { useState } from "react"
import { createClub } from "@/actions/club-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function AddClubForm() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await createClub(formData)

        if (result.success) {
            toast.success(result.message)
            e.currentTarget.reset()
        } else {
            toast.error(result.message)
        }

        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Club</CardTitle>
                <CardDescription>Create a new sports club</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Club Name (Arabic) *</Label>
                        <Input id="name" name="name" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nameEn">Club Name (English)</Label>
                        <Input id="nameEn" name="nameEn" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://..." />
                        <p className="text-xs text-gray-500">Upload logo separately and paste URL</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address (Arabic)</Label>
                        <Input id="address" name="address" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="addressEn">Address (English)</Label>
                        <Input id="addressEn" name="addressEn" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Arabic)</Label>
                        <Textarea id="description" name="description" rows={3} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descriptionEn">Description (English)</Label>
                        <Textarea id="descriptionEn" name="descriptionEn" rows={3} />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? "Creating..." : "Create Club"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
