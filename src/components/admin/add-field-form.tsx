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
                            <Label htmlFor="name">Field Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Camp Nou" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Price per Hour (EGP)</Label>
                            <Input id="price" name="price" type="number" min="0" placeholder="200" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Detailed Address</Label>
                        <Input id="address" name="address" placeholder="e.g. 5th Settlement, near AUC" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="locationUrl">Google Maps Link</Label>
                        <Input id="locationUrl" name="locationUrl" type="url" placeholder="https://maps.google.com/..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" name="description" placeholder="Good lighting, 5-a-side..." />
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
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-dashed border-gray-300">
                             <p className="text-xs text-gray-500 font-medium">-- OR -- Create New Manager Account</p>
                             <div className="space-y-2">
                                 <Label htmlFor="newManagerName">Manager Full Name</Label>
                                 <Input id="newManagerName" name="newManagerName" placeholder="Management Name" />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                 <div className="space-y-2">
                                     <Label htmlFor="newManagerEmail">Manager Email</Label>
                                     <Input id="newManagerEmail" name="newManagerEmail" type="email" placeholder="manager@example.com" />
                                 </div>
                                 <div className="space-y-2">
                                     <Label htmlFor="newManagerPassword">Temp Password</Label>
                                     <Input id="newManagerPassword" name="newManagerPassword" type="password" placeholder="******" />
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image">Field Image</Label>
                        <Input id="image" name="image" type="file" accept="image/*" required />
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
