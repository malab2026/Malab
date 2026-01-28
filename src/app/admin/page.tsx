import { Navbar } from "@/components/layout/navbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    CheckSquare,
    Landmark,
    Users,
    LayoutGrid,
    Wallet,
    ChevronRight,
    LayoutDashboard,
    AlertCircle,
    ArrowUpRight
} from "lucide-react"
import prisma from "@/lib/prisma"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

export default async function AdminHubPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    const navItems = [
        {
            title: "Approvals & History",
            description: "Manage booking requests and cancellation tickets.",
            href: "/admin/approvals",
            icon: CheckSquare,
            color: "bg-amber-500",
        },
        {
            title: "User Management",
            description: "Control user roles, global settings, and broadcasts.",
            href: "/admin/users",
            icon: Users,
            color: "bg-blue-500",
        },
        {
            title: "Fields Management",
            description: "Add or edit stadiums and block time slots.",
            href: "/admin/fields",
            icon: LayoutGrid,
            color: "bg-emerald-500",
        },
        {
            title: "Clubs Management",
            description: "Manage sports clubs portfolios and branding.",
            href: "/admin/clubs",
            icon: Landmark,
            color: "bg-indigo-600",
            badge: "New",
            badgeColor: "bg-indigo-100 text-indigo-700"
        },
        {
            title: "Finance & Settlements",
            description: "Track revenue, fees, and process owner payouts.",
            href: "/admin/finance",
            icon: Wallet,
            color: "bg-purple-500",
            badge: "Economy",
            badgeColor: "bg-purple-100 text-purple-700"
        }
    ]

    return (
        <main className="min-h-screen pb-20 bg-[#F8FAFC]">
            <Navbar />

            <div className="container mx-auto py-12 px-4">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-gray-900 p-2 rounded-lg">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Management Hub</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 text-lg">
                        Select a module to manage your platform's core operations.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {navItems.map((item) => (
                        <Link href={item.href} key={item.href} className="group">
                            <Card className="p-8 rounded-[2.5rem] border-0 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col h-full relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`${item.color} p-4 rounded-3xl text-white shadow-lg shadow-${item.color.split('-')[1]}-200/50`}>
                                        <item.icon className="h-8 w-8" />
                                    </div>
                                    {item.badge && (
                                        <Badge className={`${item.badgeColor} border-0 font-black px-3 py-1 rounded-xl`}>
                                            {item.badge}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h2>
                                    <p className="text-gray-400 font-bold leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-sm font-black text-blue-600 uppercase tracking-widest pt-6 border-t border-gray-50 group-hover:gap-4 transition-all">
                                    Open Module
                                    <ArrowUpRight className="h-4 w-4" />
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Suspense fallback={<StatsSkeleton />}>
                    <AdminStats />
                </Suspense>
            </div>
        </main>
    )
}

async function AdminStats() {
    const [
        pendingCount,
        cancelCount,
        userCount,
        fieldCount
    ] = await Promise.all([
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'CANCEL_REQUESTED' } }),
        prisma.user.count(),
        prisma.field.count()
    ])

    return (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-700">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pending</p>
                <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cancellations</p>
                <p className="text-2xl font-black text-red-500">{cancelCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
                <p className="text-2xl font-black text-emerald-500">{fieldCount}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Accounts</p>
                <p className="text-2xl font-black text-blue-500">{userCount}</p>
            </div>
        </div>
    )
}

function StatsSkeleton() {
    return (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-24 flex items-center justify-center">
                    <Skeleton className="h-6 w-12 bg-gray-100" />
                </div>
            ))}
        </div>
    )
}
