import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { updateOwnerBookingStatus, blockSlot } from "@/actions/owner-actions"

export default async function OwnerFieldDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth()

    if (!session || (session.user.role !== "owner" && session.user.role !== "admin")) {
        redirect("/login")
    }

    const field = await prisma.field.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            pricePerHour: true,
            address: true,
            locationUrl: true,
            description: true,
            ownerId: true,
            bookings: {
                where: { status: { in: ['CONFIRMED', 'CANCELLED', 'BLOCKED'] } },
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
                    <Button variant="outline" asChild className="bg-white">
                        <Link href="/owner">← Dashboard</Link>
                    </Button>
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <h1 className="text-2xl font-bold text-gray-900">{field.name} - View Schedule</h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-0 shadow-xl overflow-hidden">
                            <CardHeader className="bg-white border-b">
                                <CardTitle>Schedule History</CardTitle>
                            </CardHeader>
                            <CardContent className="bg-gray-50/50 pt-6">
                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                                    {field.bookings.length === 0 ? (
                                        <div className="text-center py-10 bg-white rounded-xl border-2 border-dashed border-gray-100">
                                            <p className="text-gray-400 font-medium">No confirmed bookings yet.</p>
                                        </div>
                                    ) : (
                                        field.bookings.map((booking: any) => (
                                            <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:border-green-200 transition-colors gap-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-lg text-gray-900">{booking.user.name}</span>
                                                        <Badge className={
                                                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' :
                                                                booking.status === 'BLOCKED' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200' : 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
                                                        } variant="outline">
                                                            {booking.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                                        <p className="flex items-center gap-1.5 font-medium">
                                                            <span className="text-gray-400">📅</span> {new Date(booking.startTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </p>
                                                        <p className="flex items-center gap-1.5 font-medium">
                                                            <span className="text-gray-400">🕒</span> {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    {booking.status !== 'BLOCKED' && (
                                                        <p className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                                                            <span className="text-gray-400">📞</span> {booking.user.phone}
                                                        </p>
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
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-white border-b">
                                <CardTitle>Field Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</p>
                                    <p className="text-2xl font-black text-green-600">{field.pricePerHour} <span className="text-sm text-gray-400">EGP/HR</span></p>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Location</p>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{field.address}</p>
                                </div>
                                {field.locationUrl && (
                                    <Button variant="outline" className="w-full font-bold bg-white text-blue-600 border-blue-100 hover:bg-blue-50" asChild>
                                        <a href={field.locationUrl} target="_blank">📍 Open in Maps</a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
