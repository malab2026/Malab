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
            _count: { select: { bookings: true } },
            bookings: {
                orderBy: { startTime: 'desc' },
                take: 10,
                include: { user: { select: { name: true, phone: true } } }
            }
        }
    }) as any[]

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Owner Dashboard</h1>
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
                                    <h2 className="text-2xl font-semibold">{field.name}</h2>
                                    <Badge variant="outline">{field._count.bookings} Total Bookings</Badge>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Recent Bookings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {field.bookings.length === 0 ? (
                                                    <p className="text-sm text-gray-500 italic">No bookings yet.</p>
                                                ) : (
                                                    field.bookings.map((booking: any) => (
                                                        <div key={booking.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                                            <div>
                                                                <p className="font-medium">{booking.user.name}</p>
                                                                <p className="text-xs text-gray-500">{new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
                                                                <p className="text-xs text-green-600">{booking.user.phone}</p>
                                                            </div>
                                                            <Badge className={
                                                                booking.status === 'CONFIRMED' ? 'bg-green-500' :
                                                                    booking.status === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                            }>
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            <Button variant="outline" className="w-full mt-4 text-green-700 border-green-200 hover:bg-green-50" asChild>
                                                <Link href={`/owner/fields/${field.id}`}>
                                                    Manage All Bookings & Availability →
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Field Info</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <p className="text-sm"><span className="font-semibold">Price:</span> {field.pricePerHour} EGP/hr</p>
                                            <p className="text-sm"><span className="font-semibold">Address:</span> {field.address}</p>
                                            {field.locationUrl && (
                                                <a href={field.locationUrl} target="_blank" className="text-xs text-blue-600 hover:underline">View on Maps</a>
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
