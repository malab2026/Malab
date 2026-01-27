
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Users,
    CalendarCheck,
    Settings,
    History,
    ShieldAlert,
    Megaphone,
    Trophy,
    MapPin,
    AlertCircle
} from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminHubPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    // Lightweight queries for dashboard status
    const [
        pendingCount,
        cancelRequestCount,
        userCount,
        fieldCount
    ] = await Promise.all([
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'CANCEL_REQUESTED' } }),
        prisma.user.count(),
        prisma.field.count()
    ])

    const menuItems = [
        {
            title: "Pending Approvals",
            href: "/admin/approvals",
            icon: CalendarCheck,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            count: pendingCount,
            countColor: "bg-blue-600",
            description: "Review and approve new bookings"
        },
        {
            title: "Cancellation Requests",
            href: "/admin/cancellations",
            icon: AlertCircle,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            count: cancelRequestCount,
            countColor: "bg-orange-600",
            description: "Process booking cancellation requests"
        },
        {
            title: "User Management",
            href: "/admin/users",
            icon: Users,
            color: "text-green-600",
            bgColor: "bg-green-50",
            count: userCount,
            description: "Manage users, owners, and roles"
        },
        {
            title: "Manage Fields",
            href: "/admin/fields",
            icon: MapPin,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            count: fieldCount,
            description: "Add and manage sports fields"
        },
        {
            title: "Manage Clubs",
            href: "/admin/clubs",
            icon: Trophy,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            description: "Manage sports clubs and venues"
        },
        {
            title: "Broadcasts",
            href: "/admin/broadcasts",
            icon: Megaphone,
            color: "text-pink-600",
            bgColor: "bg-pink-50",
            description: "Send announcements to users"
        },
        {
            title: "Blocked Slots",
            href: "/admin/blocks",
            icon: ShieldAlert,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            description: "Manage manual field blocks"
        },
        {
            title: "Booking History",
            href: "/admin/history",
            icon: History,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
            description: "View and filter past bookings"
        },
        {
            title: "Global Settings",
            href: "/admin/settings",
            icon: Settings,
            color: "text-slate-600",
            bgColor: "bg-slate-50",
            description: "App configuration and contacts"
        }
    ]

    return (
        <main className="min-h-screen bg-gray-50/50">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back. Select a module to manage.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <Link href={item.href} key={item.href} className="group">
                            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-gray-200/60">
                                <CardContent className="p-6 flex items-start justify-between">
                                    <div className="space-y-4">
                                        <div className={`p-3 rounded-xl w-fit ${item.bgColor}`}>
                                            <item.icon className={`h-6 w-6 ${item.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                    {(item.count !== undefined && item.count > 0 || (item.title === "User Management" || item.title === "Manage Fields")) && (
                                        <Badge variant="secondary" className={`${item.countColor || 'bg-gray-100 text-gray-600'} text-xs font-bold px-2 py-0.5 mt-1`}>
                                            {item.count}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
