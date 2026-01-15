import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { EditFieldForm } from "@/components/admin/edit-field-form"

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

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <EditFieldForm field={field} owners={owners} />
            </div>
        </main>
    )
}
