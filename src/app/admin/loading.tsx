import { Skeleton } from "@/components/ui/skeleton"
import { LayoutDashboard } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="container mx-auto py-12 px-4 animate-pulse">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gray-200 p-2 rounded-lg w-9 h-9" />
                    <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
                <Skeleton className="h-12 w-64 bg-gray-200 mb-2" />
                <Skeleton className="h-6 w-96 bg-gray-200" />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-white h-64 shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <Skeleton className="h-16 w-16 rounded-3xl bg-gray-100" />
                            <Skeleton className="h-8 w-24 rounded-xl bg-gray-100" />
                        </div>
                        <Skeleton className="h-8 w-48 mb-2 bg-gray-100" />
                        <Skeleton className="h-6 w-full bg-gray-50" />
                        <div className="mt-auto pt-6 border-t border-gray-50">
                            <Skeleton className="h-4 w-24 bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-24 shadow-sm" />
                ))}
            </div>
        </div>
    )
}
