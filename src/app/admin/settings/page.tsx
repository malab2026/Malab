
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { GlobalSettingsForm } from "@/components/admin/global-settings-form"

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const settings = await prisma.globalSettings.upsert({
        where: { id: 'global' },
        update: {},
        create: { id: 'global', serviceFee: 10.0, adminPhone: "201009410112", whatsappEnabled: true }
    })

    const initialServiceFee = settings?.serviceFee ?? 10
    const initialPhone = settings?.adminPhone ?? "201009410112"
    const initialWhatsappEnabled = settings?.whatsappEnabled ?? true

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Global Settings</h1>
                    <p className="text-gray-500">Configure application-wide settings.</p>
                </div>

                <div className="max-w-xl mx-auto">
                    <GlobalSettingsForm
                        initialFee={initialServiceFee}
                        initialPhone={initialPhone}
                        initialWhatsappEnabled={initialWhatsappEnabled}
                    />
                </div>
            </div>
        </main>
    )
}
