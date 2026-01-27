
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AddClubForm } from "@/components/admin/add-club-form"

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const clubs = await prisma.club.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, nameEn: true, _count: { select: { fields: true } } }
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Manage Clubs</h1>
                    <p className="text-gray-500">Add and manage sports clubs.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <AddClubForm />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-sm border text-gray-500 italic text-center">
                            Clubs list is currently managed directly via DB or implicitly.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
