'use client'

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { updateField } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function EditFieldForm({ field, owners }: { field: any, owners: any[] }) {
    const updateFieldWithId = updateField.bind(null, field.id)
    const [state, dispatch] = useActionState(updateFieldWithId, null)
    const [imagePreview, setImagePreview] = useState<string | null>(field.imageUrl)
    const router = useRouter()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Field: {field.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Field Name</Label>
                            <Input id="name" name="name" defaultValue={field.name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price per Hour (EGP)</Label>
                            <Input id="price" name="price" type="number" defaultValue={field.pricePerHour} required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Detailed Address</Label>
                        <Input id="address" name="address" defaultValue={field.address || ''} placeholder="e.g. 5th Settlement, near AUC" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="locationUrl">Google Maps Link</Label>
                        <Input id="locationUrl" name="locationUrl" type="url" defaultValue={field.locationUrl || ''} placeholder="https://maps.google.com/..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" defaultValue={field.description || ''} placeholder="Good lighting, 5-a-side..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                        <textarea
                            id="cancellationPolicy"
                            name="cancellationPolicy"
                            defaultValue={field.cancellationPolicy || ''}
                            placeholder="e.g. Full refund if cancelled 24 hours before..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ownerId">Assign Owner</Label>
                        <select
                            id="ownerId"
                            name="ownerId"
                            defaultValue={field.ownerId || ''}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="">No Owner (Admin Managed)</option>
                            {owners.map(owner => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.name} ({owner.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Field Image (Leave empty to keep current)</Label>
                        <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                        {imagePreview && (
                            <div className="relative h-40 w-full mt-2 rounded-lg overflow-hidden border">
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <SubmitButton />
                    </div>

                    {state?.message && (
                        <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-500'}`}>
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
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={pending}>
            {pending ? "Saving Changes..." : "Save Changes"}
        </Button>
    )
}
