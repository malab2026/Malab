import { Navbar } from "@/components/layout/navbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Landmark, Plus } from "lucide-react"
import { getClubs } from "@/actions/club-actions"
import { ClubList } from "@/components/admin/club-list"
import { AddClubForm } from "@/components/admin/add-club-form"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
        redirect("/")
    }

    return (
        <main className="min-h-screen pb-20 bg-gray-50/50 leading-relaxed tracking-tight">
            <Navbar />

            <div className="container mx-auto py-12 px-4">
                <div className="mb-12">
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors font-bold uppercase tracking-widest">
                        <ArrowLeft className="h-4 w-4" /> Back to Admin
                    </Link>
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">Club Management</h1>
                            <p className="text-gray-400 font-bold text-lg">Organize and brand stadium groups</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 animate-in fade-in duration-700">
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <AddClubForm />
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <Suspense fallback={<ClubsSkeleton />}>
                            <ClubsContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </main>
    )
}

async function ClubsContent() {
    const clubs = await getClubs()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-4">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Portfolios</h2>
                <div className="bg-white px-4 py-1.5 rounded-full shadow-sm text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-50">
                    {clubs.length} Clubs Registered
                </div>
            </div>
            <ClubList clubs={clubs} />
        </div>
    )
}

function ClubsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[600px] w-full rounded-[3rem]" />
        </div>
    )
}
