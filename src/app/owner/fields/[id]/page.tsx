import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateOwnerBookingStatus, blockSlot } from "@/actions/owner-actions"

export default async function OwnerFieldDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth()

    if (!session || (session.user.role !== "owner" && session.user.role !== "admin")) {
        redirect("/login")
    }

    const field = await prisma.field.findUnique({
        where: { id },
        include: {
            bookings: {
                orderBy: { startTime: 'desc' },
                include: { user: { select: { name: true, phone: true } } }
            }
        }
    }) as any

    if (!field) notFound()

    // Authorization check
    if (session.user.role === "owner" && field.ownerId !== session.user.id) {
        redirect("/owner")
    }

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <a href="/owner">← Back</a>
                    </Button>
                    <h1 className="text-3xl font-bold">{field.name} - Management</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>All Bookings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                    {field.bookings.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                            <p className="text-gray-500">No bookings found for this field.</p>
                                        </div>
                                    ) : (
                                        field.bookings.map((booking: any) => (
                                            <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:border-green-200 transition-colors gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-lg text-gray-900">{booking.user.name}</span>
                                                        <Badge className={
                                                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' :
                                                                booking.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' :
                                                                    booking.status === 'BLOCKED' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200'
                                                        } variant="outline">
                                                            {booking.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                                        <p className="flex items-center gap-1.5">
                                                            <span className="text-gray-400">📅</span> {new Date(booking.startTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="flex items-center gap-1.5">
                                                            <span className="text-gray-400">🕒</span> {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                                        <span className="text-gray-400">📞</span> {booking.user.phone}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 justify-end">
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            {booking.receiptUrl && (
                                                                <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                                                    <a href={`/receipt/${booking.id}`} target="_blank">View Receipt</a>
                                                                </Button>
                                                            )}
                                                            <form action={async () => {
                                                                'use server'
                                                                await updateOwnerBookingStatus(booking.id, "CONFIRMED")
                                                            }}>
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Confirm</Button>
                                                            </form>
                                                            <form action={async () => {
                                                                'use server'
                                                                await updateOwnerBookingStatus(booking.id, "REJECTED")
                                                            }}>
                                                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">Reject</Button>
                                                            </form>
                                                        </>
                                                    )}
                                                    {booking.status === 'BLOCKED' && (
                                                        <Button size="sm" variant="outline" disabled className="bg-gray-50">Blocked Slot</Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Block Availability</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-500 mb-4">Manually block time slots for maintenance or external bookings.</p>
                                <form action={async (formData: FormData) => {
                                    'use server'
                                    const date = formData.get('date') as string
                                    const hour = Number(formData.get('hour'))
                                    const duration = Number(formData.get('duration'))
                                    if (date && hour && duration) {
                                        await blockSlot(field.id, date, hour, duration)
                                    }
                                }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold">Date</label>
                                        <Input type="date" name="date" required min={new Date().toISOString().split('T')[0]} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold">Start Hour</label>
                                            <select
                                                name="hour"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                {Array.from({ length: 24 }).map((_, i) => (
                                                    <option key={i} value={i}>{i}:00</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold">Duration (Hours)</label>
                                            <select
                                                name="duration"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                required
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                                                    <option key={d} value={d}>{d} {d === 1 ? 'Hour' : 'Hours'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Block Slot</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
