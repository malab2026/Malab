import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
        where: { id: params.id },
        include: { field: true }
    })

    if (!booking || !booking.receiptUrl) {
        return new NextResponse("Not Found", { status: 404 })
    }

    // Access Control
    const isAdmin = session.user.role === 'admin'
    const isOwner = session.user.role === 'owner' && booking.field.ownerId === session.user.id
    const isUser = booking.userId === session.user.id

    if (!isAdmin && !isOwner && !isUser) {
        return new NextResponse("Forbidden", { status: 403 })
    }

    // Parse Base64 Data URI
    // Format: data:image/png;base64,......
    const matches = booking.receiptUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
        return new NextResponse("Invalid Image Data", { status: 500 })
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': mimeType,
            'Content-Length': buffer.length.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    })
}
