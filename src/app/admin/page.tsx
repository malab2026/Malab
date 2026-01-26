import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { updateBookingStatus, updateUserRole } from "@/actions/admin-actions"
import { DeleteFieldButton } from "@/components/admin/delete-field-button"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"

export const dynamic = 'force-dynamic'

import { AddFieldForm } from "@/components/admin/add-field-form"
import { CreateOwnerForm } from "@/components/admin/create-owner-form"
import { ProcessCancellationDialog } from "@/components/admin/process-cancellation-dialog"
import { GlobalSettingsForm } from "@/components/admin/global-settings-form"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import { AddClubForm } from "@/components/admin/add-club-form"
import { BroadcastForm } from "@/components/admin/broadcast-form"
import { AdminBlockSlotsDialog } from "@/components/admin/admin-block-slots-dialog"
import { AdminHistoryManager } from "@/components/admin/admin-history-manager"
import { ShieldAlert } from "lucide-react"
import { AdminBookingCard } from "@/components/admin/admin-booking-card"

export default async function AdminPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [
        pendingBookings,
        cancelRequests,
        fields,
        owners,
        users,
        settings,
        clubs,
        historyBookings
    ] = await Promise.all([
        prisma.booking.findMany({
            where: { status: 'PENDING' },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                cancellationReason: true,
                createdAt: true,
                receiptUrl: true,
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.booking.findMany({
            where: { status: 'CANCEL_REQUESTED' },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                cancellationReason: true,
                createdAt: true,
                receiptUrl: true,
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
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
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
            take: 50 // Limit to latest 50 for performance
        }),
        prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: {},
            create: { id: 'global', serviceFee: 10.0, adminPhone: "201009410112", whatsappEnabled: true }
        }),
        prisma.club.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, nameEn: true, _count: { select: { fields: true } } }
        }),
        prisma.booking.findMany({
            where: { status: { not: 'PENDING' } },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
                cancellationReason: true,
                createdAt: true,
                receiptUrl: true,
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })
    ]) as any

    const initialServiceFee = settings?.serviceFee ?? 10
    const initialPhone = settings?.adminPhone ?? "201009410112"
    const initialWhatsappEnabled = settings?.whatsappEnabled ?? true

    return (
        <main className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
                            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        </div>
                        <Button asChild variant="outline" className="bg-white shadow-sm ring-1 ring-black/5 h-12 rounded-xl">
                            <Link href="/admin/accounts">💰 View Accounts</Link>
                        </Button>
                        <Button asChild variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 shadow-sm h-12 rounded-xl gap-2 font-bold">
                            <Link href="/admin/blocks">
                                <ShieldAlert className="h-5 w-5" />
                                🔒 Manage Blocks
                            </Link>
                        </Button>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="bg-white px-4 py-2 rounded shadow-sm border">
                            <span className="text-gray-500">Total Users:</span> <span className="font-bold">{users.length}</span>
                        </div>
                        <div className="bg-white px-4 py-2 rounded shadow-sm border">
                            <span className="text-gray-500">Total Fields:</span> <span className="font-bold">{fields.length}</span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-12">
                    {/* User Management Section */}
                    <section>
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 inline-flex items-center gap-2 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                👥 User Management
                            </h2>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-8">
                                <GlobalSettingsForm
                                    initialFee={initialServiceFee}
                                    initialPhone={initialPhone}
                                    initialWhatsappEnabled={initialWhatsappEnabled}
                                />
                                <CreateOwnerForm />
                            </div>
                            <div className="lg:col-span-2">
                                <Card>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                                <tr>
                                                    <th className="px-6 py-3">User</th>
                                                    <th className="px-6 py-3">Role</th>
                                                    <th className="px-6 py-3 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {users.map((user: any) => (
                                                    <tr key={user.id} className="bg-white hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold">{user.name}</div>
                                                            <div className="text-gray-500 text-xs">{user.email || user.phone}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'owner' ? 'secondary' : 'outline'}>
                                                                {user.role}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                            <EditUserDialog user={user} />
                                                            {user.role === 'user' && (
                                                                <form action={updateUserRole.bind(null, user.id, 'owner') as any}>
                                                                    <Button size="sm" variant="outline">Promote</Button>
                                                                </form>
                                                            )}
                                                            {user.role === 'owner' && (
                                                                <form action={updateUserRole.bind(null, user.id, 'user') as any}>
                                                                    <Button size="sm" variant="ghost" className="text-red-600">Demote</Button>
                                                                </form>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Broadcast Section */}
                    <section>
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 inline-flex items-center gap-2 mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                📢 Broadcast Announcements
                            </h2>
                        </div>
                        <div className="max-w-2xl">
                            <BroadcastForm />
                        </div>
                    </section>

                    {/* Club Management Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
                                <h2 className="text-2xl font-semibold text-gray-900">🏟️ Manage Clubs</h2>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <AddClubForm />
                            </div>
                            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                                {/* Clubs list rendering logic was minimal, keeping it simple as before */}
                                <p className="col-span-2 text-gray-500 text-sm italic">Clubs list managed via AddClubForm...</p>
                            </div>
                        </div>
                    </section>

                    <hr />

                    {/* Field Management Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
                                <h2 className="text-2xl font-semibold text-gray-900">Manage Fields</h2>
                            </div>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <AddFieldForm owners={owners} clubs={clubs} />
                            </div>
                            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                                {fields.map((field: any) => (
                                    <Card key={field.id} className="overflow-hidden">
                                        <div className="relative h-32 w-full bg-gray-100">
                                            <Image
                                                src={`/api/field-image/${field.id}`}
                                                alt={field.name}
                                                fill
                                                className="object-cover"
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
                    </section>

                    <hr />

                    {/* Pending Bookings Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 flex items-center gap-2">
                                <h2 className="text-2xl font-semibold text-gray-900">Pending Approvals</h2>
                                <Badge variant="secondary" className="bg-gray-100">{pendingBookings.length}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {pendingBookings.map((booking: any) => (
                                <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                            ))}
                            {pendingBookings.length === 0 && (
                                <p className="text-gray-500 italic">No pending bookings.</p>
                            )}
                        </div>
                    </section>

                    {/* Cancellation Requests Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 flex items-center gap-2">
                                <h2 className="text-2xl font-semibold text-orange-600">Cancellation Requests</h2>
                                <Badge variant="destructive" className="bg-orange-600">{cancelRequests.length}</Badge>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {cancelRequests.map((booking: any) => (
                                <AdminBookingCard key={booking.id} booking={booking} isAdmin isCancelRequest />
                            ))}
                            {cancelRequests.length === 0 && (
                                <p className="text-gray-500 italic">No cancellation requests.</p>
                            )}
                        </div>
                    </section>

                    {/* Recent History Section with Advanced Filtering */}
                    <section className="bg-white/30 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/40 shadow-xl">
                        <AdminHistoryManager
                            bookings={historyBookings}
                        />
                    </section>
                </div>
            </div>
        </main>
    )
}
