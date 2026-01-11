import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function OwnerPage() {
    const session = await auth()

    if (!session || session.user.role !== "owner") {
        redirect("/login")
    }

    const fields = await prisma.field.findMany({
        where: { ownerId: session.user.id },
        include: {
            _count: {
                select: {
                    bookings: { where: { status: 'CONFIRMED' } }
                }
            },
            bookings: {
                where: { status: 'CONFIRMED' },
                orderBy: { startTime: 'desc' },
                take: 10,
                include: { user: { select: { name: true, phone: true } } }
            }
        }
    }) as any[]

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                    </div>
                    <Button asChild variant="outline" className="bg-white shadow-sm ring-1 ring-black/5 h-12">
                        <Link href="/owner/accounts">💰 View My Accounts</Link>
                    </Button>
                </div>

                {fields.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-gray-500">
                            You don't have any fields assigned yet. Contact Admin to assign your fields.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-8">
                        {fields.map((field) => (
                            <div key={field.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                                        <h2 className="text-2xl font-bold text-gray-900">{field.name}</h2>
                                    </div>
                                    <Badge variant="outline" className="bg-white">{field._count.bookings} Confirmed Bookings</Badge>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Recent Confirmed Bookings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {field.bookings.length === 0 ? (
                                                    <p className="text-sm text-gray-500 italic">No confirmed bookings yet.</p>
                                                ) : (
                                                    field.bookings.map((booking: any) => (
                                                        <div key={booking.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                                            <div>
                                                                <p className="font-semibold">{booking.user.name}</p>
                                                                <p className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
                                                                <p className="text-xs text-green-600 font-bold">{booking.user.phone}</p>
                                                            </div>
                                                            <Badge className="bg-green-500 text-white border-0">
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <Button variant="outline" className="w-full mt-4 text-green-700 bg-white border-green-200 hover:bg-green-50 shadow-sm" asChild>
                                                <Link href={`/owner/fields/${field.id}`}>
                                                    View Full Schedule →
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Field Details</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center pb-2 border-b">
                                                <span className="text-sm text-gray-500">Rate:</span>
                                                <span className="font-bold text-green-600">{field.pricePerHour} EGP/hr</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold text-gray-400 uppercase">Address</p>
                                                <p className="text-sm text-gray-600">{field.address}</p>
                                            </div>
                                            {field.locationUrl && (
                                                <Button variant="link" className="px-0 h-auto text-blue-600 font-bold text-sm" asChild>
                                                    <a href={field.locationUrl} target="_blank">📍 View on Google Maps</a>
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
