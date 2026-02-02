import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { EditFieldForm } from "@/components/admin/edit-field-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditFieldPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const field = await prisma.field.findUnique({
        where: { id }
    } as any)

    if (!field) {
        notFound()
    }

    const owners = await prisma.user.findMany({
        where: { role: 'owner' },
        select: { id: true, name: true, email: true }
    })

    const clubs = await prisma.club.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <Link href="/admin/fields" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-6 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Fields
                </Link>
                <EditFieldForm field={field} owners={owners} clubs={clubs} />
            </div>
        </main>
    )
}
