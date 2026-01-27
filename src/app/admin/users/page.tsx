
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateUserRole } from "@/actions/admin-actions"
import { CreateOwnerForm } from "@/components/admin/create-owner-form"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
        take: 100
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">User Management</h1>
                        <p className="text-gray-500">Manage users, owners, and roles.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <CreateOwnerForm />
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3">User</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((user) => (
                                            <tr key={user.id} className="bg-white hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold">{user.name}</div>
                                                    <div className="text-gray-500 text-xs">{user.email || user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'owner' ? 'secondary' : 'outline'}>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <EditUserDialog user={user} />
                                                    {user.role === 'user' && (
                                                        <form action={async () => {
                                                            'use server';
                                                            await updateUserRole(user.id, 'owner', new FormData());
                                                        }}>
                                                            <Button size="sm" variant="outline">Promote</Button>
                                                        </form>
                                                    )}
                                                    {user.role === 'owner' && (
                                                        <form action={async () => {
                                                            'use server';
                                                            await updateUserRole(user.id, 'user', new FormData());
                                                        }}>
                                                            <Button size="sm" variant="ghost" className="text-red-600">Demote</Button>
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
            </div>
        </main>
    )
}
