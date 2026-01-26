'use client'

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, Clock, User, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatInEgyptDate, formatInEgyptTime } from "@/lib/utils"
import { AdminBlockSlotsDialog } from "@/components/admin/admin-block-slots-dialog"

interface BlocksManagerProps {
    blocks: any[]
    fields: any[]
}

export function BlocksManager({ blocks, fields }: BlocksManagerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedField, setSelectedField] = useState<string>("all")

    const filteredBlocks = blocks.filter(block => {
        const matchesSearch = block.field.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesField = selectedField === "all" || block.fieldId === selectedField
        return matchesSearch && matchesField
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            🔒 Manual Blocks Report
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                {filteredBlocks.length} Active Blocks
                            </Badge>
                        </h1>
                    </div>
                </div>

                <Card className="p-6 mb-8 border-white/40 bg-white/50 backdrop-blur-xl shadow-xl rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Filter by Stadium</label>
                            <select
                                className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium"
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                            >
                                <option value="all">All Stadiums</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Search by Name</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    className="h-12 pl-12 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    placeholder="Search stadiums..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-4">
                    {filteredBlocks.map((block) => (
                        <Card key={block.id} className="overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row items-stretch">
                                <div className="bg-orange-50 w-full md:w-3 px-0 group-hover:bg-orange-200 transition-colors" />
                                <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 p-2 rounded-lg">
                                            <MapPin className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{block.field.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stadium</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{formatInEgyptDate(block.startTime)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-50 p-2 rounded-lg">
                                            <Clock className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{formatInEgyptTime(block.startTime)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start Time</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-4">
                                        <div className="flex flex-col text-right">
                                            <p className="text-xs font-bold text-gray-700 flex items-center gap-1 justify-end">
                                                <User className="h-3 w-3" /> {block.user.name}
                                            </p>
                                            <p className="text-[10px] text-gray-400">Blocked By</p>
                                        </div>
                                        <AdminBlockSlotsDialog field={block.field} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {filteredBlocks.length === 0 && (
                        <div className="py-20 text-center bg-white/50 rounded-2xl border-2 border-dashed border-gray-100">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">No Blocks Found</h3>
                            <p className="text-gray-500">Try adjusting your stadium filter or search term.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
