import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Landmark, MapPin, Plus, Trash2, Edit3, ShieldAlert } from "lucide-react"
import { AddFieldForm } from "@/components/admin/add-field-form"
import { AddClubForm } from "@/components/admin/add-club-form"
import { AdminBlockSlotsDialog } from "@/components/admin/admin-block-slots-dialog"
import { DeleteFieldButton } from "@/components/admin/delete-field-button"

export const dynamic = 'force-dynamic'

export default async function AdminFieldsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [
        fields,
        clubs,
        owners
    ] = await Promise.all([
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
        prisma.club.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, nameEn: true, _count: { select: { fields: true } } }
        }),
        prisma.user.findMany({
            where: { role: 'owner' },
            select: { id: true, name: true, email: true }
        })
    ]) as any

    return (
        <main className="min-h-screen pb-10 bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-black text-gray-900">Fields & Clubs</h1>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg">
                            {fields.length} Active Fields
                        </Badge>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Left Column: Management Tools */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-green-100 p-2 rounded-xl">
                                    <Plus className="h-5 w-5 text-green-700" />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Add New Stadium</h2>
                            </div>
                            <AddFieldForm owners={owners} clubs={clubs} />
                        </section>

                        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-blue-100 p-2 rounded-xl">
                                    <Landmark className="h-5 w-5 text-blue-700" />
                                </div>
                                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Club Management</h2>
                            </div>
                            <AddClubForm />
                        </section>
                    </div>

                    {/* Right Column: Field Grid */}
                    <div className="lg:col-span-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {fields.map((field: any) => (
                                <Card key={field.id} className="overflow-hidden bg-white rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                                        <Image
                                            src={`/api/field-image/${field.id}`}
                                            alt={field.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 group-hover:translate-x-0 translate-x-12 transition-transform duration-500">
                                            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 font-black shadow-sm h-8">
                                                {field.pricePerHour} EGP/hr
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-black text-xl text-gray-900">{field.name}</h3>
                                            <Badge variant="outline" className="border-gray-100 text-gray-400 font-bold px-2 py-0">
                                                {field._count.bookings} Bookings
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-black uppercase tracking-wider mb-4">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate">{field.address || "No address provided"}</span>
                                        </div>

                                        <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100 mb-6">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Owner Profile</p>
                                            <p className="text-sm font-black text-gray-700 truncate">{field.owner?.name || "Unassigned"}</p>
                                            <p className="text-[10px] font-bold text-gray-400 truncate">{field.owner?.email || "No email"}</p>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-50">
                                            <div className="flex gap-1.5">
                                                <Button asChild size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                                                    <Link href={`/admin/edit/${field.id}`}>
                                                        <Edit3 className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <DeleteFieldButton fieldId={field.id} />
                                            </div>
                                            <div className="flex gap-2">
                                                <AdminBlockSlotsDialog field={field} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
