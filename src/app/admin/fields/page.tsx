
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { AddFieldForm } from "@/components/admin/add-field-form"
import { DeleteFieldButton } from "@/components/admin/delete-field-button"
import { AdminBlockSlotsDialog } from "@/components/admin/admin-block-slots-dialog"

export const dynamic = 'force-dynamic'

export default async function AdminFieldsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [fields, owners, clubs] = await Promise.all([
        prisma.field.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                pricePerHour: true,
                address: true,
                locationUrl: true,
                _count: { select: { bookings: true } },
                owner: { select: { name: true, email: true } },
                club: { select: { name: true } }
            }
        }),
        prisma.user.findMany({
            where: { role: 'owner' },
            select: { id: true, name: true, email: true }
        }),
        prisma.club.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, nameEn: true, _count: { select: { fields: true } } }
        })
    ])

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Manage Fields</h1>
                    <p className="text-gray-500">Add, edit, and manage sports fields.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AddFieldForm owners={owners} clubs={clubs} />
                    </div>
                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                        {fields.map((field) => (
                            <Card key={field.id} className="overflow-hidden">
                                <div className="relative h-32 w-full bg-gray-100">
                                    <Image
                                        src={`/api/field-image/${field.id}`}
                                        alt={field.name}
                                        fill
                                        className="object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold">{field.name}</h3>
                                        <Badge variant="outline">{field._count.bookings} Bookings</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">{field.pricePerHour} EGP/hr</p>
                                    <p className="text-xs text-gray-400 mt-2 truncate">{field.address || "No address"}</p>

                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs font-semibold text-gray-600">Owner:</p>
                                        <p className="text-xs text-gray-500">{field.owner?.name || "Unassigned"} ({field.owner?.email || "N/A"})</p>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center bg-gray-50 -mx-4 -mb-4 p-3 border-t">
                                        {field.locationUrl ? (
                                            <Link href={field.locationUrl} target="_blank" className="text-blue-600 text-xs hover:underline flex items-center gap-1">
                                                <span>Map 📍</span>
                                            </Link>
                                        ) : (
                                            <span className="text-gray-300 text-xs italic">No map</span>
                                        )}

                                        <div className="flex gap-2">
                                            <AdminBlockSlotsDialog field={field} />
                                            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                                                <Link href={`/admin/edit/${field.id}`}>
                                                    Edit
                                                </Link>
                                            </Button>
                                            <DeleteFieldButton fieldId={field.id} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
