import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session) redirect("/login")

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: { field: true }
    })

    if (!booking) notFound()

    // Access Control
    const isAdmin = session.user.role === 'admin'
    const isOwner = session.user.role === 'owner' && booking.field.ownerId === session.user.id
    const isUser = booking.userId === session.user.id

    if (!isAdmin && !isOwner && !isUser) {
        return <div className="p-10 text-center text-red-600">Unauthorized</div>
    }

    if (!booking.receiptUrl) {
        return <div className="p-10 text-center">No receipt found for this booking.</div>
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h1 className="text-xl font-bold">Booking Receipt</h1>
                    <div className="text-sm text-gray-500">
                        Date: {booking.startTime.toLocaleDateString()}
                    </div>
                </div>

                <div className="relative w-full h-[80vh] bg-white/90 rounded border flex items-center justify-center overflow-hidden">
                    <img
                        src={`/api/receipt-image/${booking.id}`}
                        alt="Receipt"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <a
                        href={`/api/receipt-image/${booking.id}?download=true`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                        download
                    >
                        <span>📥</span> Download Receipt
                    </a>
                    <a href="/dashboard" className="ml-2 text-gray-600 hover:underline flex items-center">
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
