'use client'

import { EditClubDialog } from "./edit-club-dialog"
import { DeleteClubButton } from "./delete-club-button"
import { Badge } from "@/components/ui/badge"
import { Landmark, Users, MapPin } from "lucide-react"

interface ClubListProps {
    clubs: any[]
}

export function ClubList({ clubs }: ClubListProps) {
    if (clubs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                <div className="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Landmark className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900">No Clubs Found</h3>
                <p className="text-gray-400 font-bold">Start by adding your first sports club.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Club Info</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Stadiums</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {clubs.map((club) => (
                            <tr key={club.id} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white shrink-0">
                                            {club.logoUrl ? (
                                                <img src={club.logoUrl} alt={club.name} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                                                    <Landmark className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{club.name}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">{club.nameEn || "---"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-xl border-0">
                                        {club._count?.fields || 0} Fields
                                    </Badge>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                        <MapPin className="h-4 w-4 text-gray-300" />
                                        <span className="truncate max-w-[200px]">{club.address || "No address"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex justify-end items-center gap-2">
                                        <EditClubDialog club={club} />
                                        <DeleteClubButton clubId={club.id} clubName={club.name} hasFields={(club._count?.fields || 0) > 0} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
