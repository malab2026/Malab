import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Users, Shield, Settings2, UserPlus, Globe } from "lucide-react"
import { GlobalSettingsForm } from "@/components/admin/global-settings-form"
import { CreateOwnerForm } from "@/components/admin/create-owner-form"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import { BroadcastForm } from "@/components/admin/broadcast-form"
import { updateUserRole } from "@/actions/admin-actions"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-10 bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                    </div>
                </div>

                <Suspense fallback={<UsersSkeleton />}>
                    <UsersContent />
                </Suspense>
            </div>
        </main>
    )
}

async function UsersContent() {
    const [
        users,
        settings
    ] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
            take: 200
        }),
        prisma.globalSettings.upsert({
            where: { id: 'global' },
            update: {},
            create: {
                id: 'global',
                serviceFee: 10.0,
                adminPhone: "01020155988",
                whatsappEnabled: true,
                whatsappInstanceId: null,
                whatsappToken: null,
                emailEnabled: false,
                emailApiKey: null,
                emailFromAddress: null
            }
        })
    ]) as any

    const initialServiceFee = settings?.serviceFee ?? 10
    const initialPhone = settings?.adminPhone ?? "01020155988"
    const initialWhatsappEnabled = settings?.whatsappEnabled ?? true
    const initialEmailEnabled = settings?.emailEnabled ?? false
    const initialEmailApiKey = settings?.emailApiKey ?? null
    const initialEmailFromAddress = settings?.emailFromAddress ?? null
    const initialEmailSmtpHost = settings?.emailSmtpHost ?? null
    const initialEmailSmtpPort = settings?.emailSmtpPort ?? 587
    const initialEmailSmtpUser = settings?.emailSmtpUser ?? null
    const initialEmailSmtpPass = settings?.emailSmtpPass ?? null
    const initialEmailSmtpSecure = settings?.emailSmtpSecure ?? false

    return (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Left Column: Settings & Direct Actions */}
            <div className="lg:col-span-4 space-y-8">
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-blue-100 p-2 rounded-xl">
                            <Globe className="h-5 w-5 text-blue-700" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Global Settings</h2>
                    </div>
                    <GlobalSettingsForm
                        initialFee={initialServiceFee}
                        initialPhone={initialPhone}
                        initialWhatsappEnabled={initialWhatsappEnabled}
                        initialInstanceId={settings?.whatsappInstanceId}
                        initialToken={settings?.whatsappToken}
                        initialEmailEnabled={initialEmailEnabled}
                        initialEmailApiKey={initialEmailApiKey}
                        initialEmailFromAddress={initialEmailFromAddress}
                        initialEmailSmtpHost={initialEmailSmtpHost}
                        initialEmailSmtpPort={initialEmailSmtpPort}
                        initialEmailSmtpUser={initialEmailSmtpUser}
                        initialEmailSmtpPass={initialEmailSmtpPass}
                        initialEmailSmtpSecure={initialEmailSmtpSecure}
                    />
                </section>

                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <UserPlus className="h-5 w-5 text-green-700" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Create Owner</h2>
                    </div>
                    <CreateOwnerForm />
                </section>

                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-purple-100 p-2 rounded-xl">
                            <Shield className="h-5 w-5 text-purple-700" />
                        </div>
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Broadcast</h2>
                    </div>
                    <BroadcastForm />
                </section>
            </div>

            {/* Right Column: User Table */}
            <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Platform Users</h2>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg">
                        {users.length} Total Users
                    </Badge>
                </div>
                <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-gray-900 text-base">{user.name}</div>
                                            <div className="text-gray-400 font-bold text-xs">{user.email || user.phone}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge className={`rounded-lg px-2 py-1 font-black text-[10px] uppercase tracking-wider ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                                                user.role === 'owner' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-gray-50 text-gray-500 border-gray-100'
                                                } border hover:none shadow-none`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 text-right flex justify-end gap-2 items-center">
                                            <EditUserDialog user={user} />
                                            {user.role === 'user' && (
                                                <form action={updateUserRole.bind(null, user.id, 'owner') as any}>
                                                    <Button size="sm" variant="outline" className="h-8 text-xs font-bold rounded-lg border-green-200 text-green-700 hover:bg-green-50">Promote</Button>
                                                </form>
                                            )}
                                            {user.role === 'owner' && (
                                                <form action={updateUserRole.bind(null, user.id, 'user') as any}>
                                                    <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">Demote</Button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    )
}

function UsersSkeleton() {
    return (
        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
                <Skeleton className="h-[300px] w-full rounded-3xl" />
                <Skeleton className="h-[250px] w-full rounded-3xl" />
            </div>
            <div className="lg:col-span-8">
                <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
        </div>
    )
}
