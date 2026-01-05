import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id },
        include: { field: true },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">My Bookings</h1>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href="/fields">Book a New Field</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {bookings.map((booking: any) => (
                        <Card key={booking.id} className="flex flex-col md:flex-row items-center overflow-hidden">
                            <div className="relative w-full md:w-48 h-32 md:h-auto shrink-0">
                                <Image
                                    src={booking.field.imageUrl || '/placeholder.jpg'}
                                    alt={booking.field.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-xl">{booking.field.name}</h3>
                                        <p className="text-gray-500">
                                            {booking.startTime.toLocaleDateString()} at {booking.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-gray-500">
                                            Duration: {(booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60)} Hours
                                        </p>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>
                                {booking.receiptUrl && (
                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <Link href={`/receipt/${booking.id}`} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">
                                            View Receipt
                                        </Link>

                                        {booking.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/dashboard/edit/${booking.id}`}>Edit</Link>
                                                </Button>
                                                <form action={async () => {
                                                    'use server'
                                                    const { cancelBooking } = await import("@/actions/booking-actions")
                                                    await cancelBooking(booking.id)
                                                }}>
                                                    <Button variant="destructive" size="sm" type="submit">Cancel</Button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!booking.receiptUrl && booking.status === 'PENDING' && (
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/dashboard/edit/${booking.id}`}>Edit</Link>
                                        </Button>
                                        <form action={async () => {
                                            'use server'
                                            const { cancelBooking } = await import("@/actions/booking-actions")
                                            await cancelBooking(booking.id)
                                        }}>
                                            <Button variant="destructive" size="sm" type="submit">Cancel</Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    {bookings.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-lg shadow">
                            <p className="text-gray-500 mb-4">You haven't booked any fields yet.</p>
                            <Link href="/fields" className="text-blue-600 hover:underline">Browse Fields</Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-100",
        REJECTED: "bg-red-100 text-red-800 hover:bg-red-100",
    }
    return (
        <Badge className={styles[status as keyof typeof styles] || ""}>
            {status}
        </Badge>
    )
}
