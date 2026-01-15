import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const index = parseInt(searchParams.get('index') || '0')

    // Public route for field images (anyone can see field photos)
    const field = await prisma.field.findUnique({
        where: { id },
        select: { imageUrl: true, imageUrl2: true, imageUrl3: true }
    } as any)

    if (!field) {
        return new NextResponse("Not Found", { status: 404 })
    }

    const imageUrls = [field.imageUrl, field.imageUrl2, field.imageUrl3]
    const targetImageUrl = imageUrls[index]

    if (!targetImageUrl) {
        return new NextResponse("Not Found", { status: 404 })
    }

    // Parse Base64 Data URI
    try {
        const matches = targetImageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

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
    } catch (error) {
        return new NextResponse("Error processing image", { status: 500 })
    }
}
