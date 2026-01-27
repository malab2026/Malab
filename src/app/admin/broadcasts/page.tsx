
import { Navbar } from "@/components/layout/navbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BroadcastForm } from "@/components/admin/broadcast-form"

export const dynamic = 'force-dynamic'

export default async function AdminBroadcastsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Broadcast Announcements</h1>
                    <p className="text-gray-500">Send announcements to all users.</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <BroadcastForm />
                </div>
            </div>
        </main>
    )
}
