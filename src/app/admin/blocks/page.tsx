import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BlocksManager } from "@/components/admin/blocks-manager"

export const dynamic = 'force-dynamic'

export default async function AdminBlocksPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const [blocks, fields] = await Promise.all([
        prisma.booking.findMany({
            where: { status: 'BLOCKED' },
            include: {
                field: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, phone: true } }
            },
            orderBy: { startTime: 'desc' }
        }),
        prisma.field.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })
    ])

    return <BlocksManager blocks={blocks} fields={fields} />
}
