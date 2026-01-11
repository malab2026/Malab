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

export const dynamic = 'force-dynamic'

import { AddFieldForm } from "@/components/admin/add-field-form"
import { CreateOwnerForm } from "@/components/admin/create-owner-form"
import { ProcessCancellationDialog } from "@/components/admin/process-cancellation-dialog"

export default async function AdminPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [
        pendingBookings,
        cancelRequests,
        historyBookings,
        fields,
        owners,
        users
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
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
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
                field: { select: { id: true, name: true, pricePerHour: true } },
                user: { select: { id: true, name: true, email: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
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
                owner: { select: { name: true, email: true } }
            }
        }),
        prisma.user.findMany({
            where: { role: 'owner' },
            select: { id: true, name: true, email: true }
        }),
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        })
    ]) as any

    return (
        <main className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <Button asChild variant="outline" className="bg-white">
                            <Link href="/admin/accounts">💰 View Accounts</Link>
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
                        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            👥 User Management
                        </h2>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
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
                                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={user.role === 'admin' ? 'default' : user.role === 'owner' ? 'secondary' : 'outline'}>
                                                                {user.role}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {user.role === 'user' && (
                                                                <form action={updateUserRole.bind(null, user.id, 'owner') as any}>
                                                                    <Button size="sm" variant="outline">Promote to Owner</Button>
                                                                </form>
                                                            )}
                                                            {user.role === 'owner' && (
                                                                <form action={updateUserRole.bind(null, user.id, 'user') as any}>
                                                                    <Button size="sm" variant="ghost" className="text-red-600">Demote to User</Button>
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
                    {/* Field Management Section */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Manage Fields</h2>
                        </div>
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <AddFieldForm owners={owners} />
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
                            <h2 className="text-2xl font-semibold">Pending Approvals</h2>
                            <Badge variant="secondary">{pendingBookings.length}</Badge>
                        </div>

                        <div className="space-y-4">
                            {pendingBookings.map((booking: any) => (
                                <BookingCard key={booking.id} booking={booking} isAdmin />
                            ))}
                            {pendingBookings.length === 0 && (
                                <p className="text-gray-500 italic">No pending bookings.</p>
                            )}
                        </div>
                    </section>

                    {/* Cancellation Requests Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-2xl font-semibold text-orange-600">Cancellation Requests</h2>
                            <Badge variant="destructive" className="bg-orange-600">{cancelRequests.length}</Badge>
                        </div>

                        <div className="space-y-4">
                            {cancelRequests.map((booking: any) => (
                                <BookingCard key={booking.id} booking={booking} isAdmin isCancelRequest />
                            ))}
                            {cancelRequests.length === 0 && (
                                <p className="text-gray-500 italic">No cancellation requests.</p>
                            )}
                        </div>
                    </section>

                    {/* Recent History Section */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Recent Actvity</h2>
                        <div className="space-y-4 opacity-80">
                            {historyBookings.map((booking: any) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}

function BookingCard({ booking, isAdmin = false, isCancelRequest = false }: { booking: any, isAdmin?: boolean, isCancelRequest?: boolean }) {
    return (
        <Card className="flex flex-col md:flex-row items-center overflow-hidden border-l-4 border-l-transparent data-[cancel=true]:border-l-orange-500" data-cancel={isCancelRequest}>
            <div className="relative w-full md:w-32 h-24 shrink-0 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                <Image
                    src={`/api/receipt-image/${booking.id}`}
                    alt="Receipt"
                    fill
                    className="object-cover"
                />
                <span>No Receipt</span>
            </div>
            <div className="flex-1 p-4 grid md:grid-cols-2 gap-4 w-full">
                <div>
                    <h3 className="font-bold">{booking.field.name}</h3>
                    <p className="text-sm text-gray-500">
                        {booking.startTime.toLocaleDateString()} • {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm">User: <span className="font-medium">{booking.user.name}</span> ({booking.user.email})</p>
                    <p className="text-sm text-gray-600">Phone: {booking.user.phone || 'N/A'}</p>
                    {isCancelRequest && booking.cancellationReason && (
                        <p className="text-xs mt-2 p-2 bg-orange-50 text-orange-800 rounded border border-orange-100 italic">
                            Reason: {booking.cancellationReason}
                        </p>
                    )}
                    {booking.receiptUrl && (
                        <div className="mt-1">
                            <Link href={`/receipt/${booking.id}`} target="_blank" className="text-blue-600 hover:underline text-xs">
                                View Receipt Full
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2">
                    <StatusBadge status={booking.status} />

                    {isAdmin && booking.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                            <form action={updateBookingStatus.bind(null, booking.id, 'CONFIRMED') as any}>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Confirm</Button>
                            </form>
                            <form action={updateBookingStatus.bind(null, booking.id, 'REJECTED') as any}>
                                <Button size="sm" variant="destructive">Reject</Button>
                            </form>
                        </div>
                    )}

                    {isAdmin && isCancelRequest && (
                        <div className="ml-4">
                            <ProcessCancellationDialog booking={booking} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800",
        CONFIRMED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        CANCEL_REQUESTED: "bg-orange-100 text-orange-800",
        CANCEL_APPROVED: "bg-gray-100 text-gray-800",
        CANCELLED: "bg-gray-100 text-gray-800",
    }
    return (
        <Badge className={(styles[status as keyof typeof styles] || "") + " hover:none shadow-none border-0"}>
            {status.replace('_', ' ')}
        </Badge>
    )
}
