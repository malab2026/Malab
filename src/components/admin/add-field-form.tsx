"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { createField } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function AddFieldForm({ owners }: { owners: any[] }) {
    const [state, dispatch] = useActionState(createField, null)
    const router = useRouter()

    // Reset form via key or manually if needed, for simplicity we rely on dispatch result
    // Ideally, if successful, we close modal or reset form.

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Field</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Field Name (Arabic)</Label>
                            <Input id="name" name="name" placeholder="مثلاً: ملعب الكامب نو" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameEn">Field Name (English)</Label>
                            <Input id="nameEn" name="nameEn" placeholder="e.g. Camp Nou Stadium" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Price per Hour (EGP)</Label>
                        <Input id="price" name="price" type="number" min="0" placeholder="200" required />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Detailed Address (Arabic)</Label>
                            <Input id="address" name="address" placeholder="مثلاً: بنها، بالقرب من الاستاد" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressEn">Detailed Address (English)</Label>
                            <Input id="addressEn" name="addressEn" placeholder="e.g. Benha, near Stadium" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="locationUrl">Google Maps Link</Label>
                        <Input id="locationUrl" name="locationUrl" type="url" placeholder="https://maps.google.com/..." />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Arabic)</Label>
                            <Input id="description" name="description" placeholder="نجيل ممتاز، إضاءة ليلية..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descriptionEn">Description (English)</Label>
                            <Input id="descriptionEn" name="descriptionEn" placeholder="Excellent turf, night floodlights..." />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancellationPolicy">Cancellation Policy (Arabic)</Label>
                            <textarea
                                id="cancellationPolicy"
                                name="cancellationPolicy"
                                placeholder="مثلاً: استرداد كامل إذا تم الإلغاء قبل 24 ساعة..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cancellationPolicyEn">Cancellation Policy (English)</Label>
                            <textarea
                                id="cancellationPolicyEn"
                                name="cancellationPolicyEn"
                                placeholder="e.g. Full refund if cancelled 24 hours before..."
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-700">Manager Access</h3>
                        <div className="space-y-2">
                            <Label htmlFor="ownerId">Assign Existing Owner</Label>
                            <select
                                id="ownerId"
                                name="ownerId"
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
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold text-gray-700">Images (Max 3)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="image1">Main Image</Label>
                                <Input id="image1" name="image1" type="file" accept="image/*" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image2">Image 2 (Optional)</Label>
                                <Input id="image2" name="image2" type="file" accept="image/*" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image3">Image 3 (Optional)</Label>
                                <Input id="image3" name="image3" type="file" accept="image/*" />
                            </div>
                        </div>
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
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating Field..." : "Add Field"}
        </Button>
    )
}
