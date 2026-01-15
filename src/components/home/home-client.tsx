'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Navigation2, SlidersHorizontal } from "lucide-react"
import { useTranslation } from "@/components/providers/locale-context"

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export function HomeClient({ session, sortedFields, bookedFieldIds }: any) {
    const { t, isRtl } = useTranslation()
    const [search, setSearch] = useState("")
    const [selectedArea, setSelectedArea] = useState("")
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
    const [isNearestActive, setIsNearestActive] = useState(false)

    // Extract unique areas for the filter
    const areas = useMemo(() => {
        const uniqueAreas = new Set<string>()
        sortedFields.forEach((f: any) => {
            if (f.area) uniqueAreas.add(f.area)
        })
        return Array.from(uniqueAreas)
    }, [sortedFields])

    // Request location if nearest is active
    useEffect(() => {
        if (isNearestActive && !userLoc) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                },
                (err) => {
                    console.error("Geolocation error:", err)
                    setIsNearestActive(false)
                }
            )
        }
    }, [isNearestActive, userLoc])

    const filteredAndSortedFields = useMemo(() => {
        let result = [...sortedFields]

        // 1. Filter by Name (Search both Arabic and English)
        if (search) {
            const searchLower = search.toLowerCase()
            result = result.filter(f =>
                f.name.toLowerCase().includes(searchLower) ||
                (f.nameEn && f.nameEn.toLowerCase().includes(searchLower))
            )
        }

        // 2. Filter by Area
        if (selectedArea) {
            result = result.filter(f => f.area === selectedArea)
        }

        // 3. Sort by Distance if active
        if (isNearestActive && userLoc) {
            result.sort((a, b) => {
                if (!a.lat || !a.lng) return 1
                if (!b.lat || !b.lng) return -1
                const distA = calculateDistance(userLoc.lat, userLoc.lng, a.lat, a.lng)
                const distB = calculateDistance(userLoc.lat, userLoc.lng, b.lat, b.lng)
                return distA - distB
            })
        }

        return result
    }, [sortedFields, search, selectedArea, isNearestActive, userLoc])

    return (
        <div className="flex flex-col bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <Image
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
                        alt="Football Field"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="relative z-20 space-y-4 max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 font-medium">
                        {t('heroSubtitle')}
                    </p>
                    {!session && (
                        <div className="flex gap-4 justify-center pt-6">
                            <Link href="/register">
                                <Button size="lg" className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600 font-bold border-0 shadow-xl">
                                    {t('joinNow')}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <div className="container mx-auto -mt-8 relative z-40 px-4 pb-20 space-y-8 flex flex-col items-center">
                {/* Filter Bar */}
                <Card className="rounded-lg shadow-lg border-0 overflow-hidden bg-white/95 backdrop-blur-md w-full max-w-2xl">
                    <CardContent className="p-1 md:p-1.5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-1 items-center">
                            {/* Search */}
                            <div className="md:col-span-5 relative">
                                <Search className={`absolute ${isRtl ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-gray-400 h-2.5 w-2.5`} />
                                <Input
                                    placeholder={t('searchByName')}
                                    className={`${isRtl ? 'pr-7' : 'pl-7'} h-7 bg-gray-50/50 border-gray-100 rounded-md text-[11px] focus:ring-green-500 focus:border-green-500 transition-all`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Area Select */}
                            <div className="md:col-span-4 relative group">
                                <MapPin className={`absolute ${isRtl ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 text-gray-400 h-2.5 w-2.5`} />
                                <select
                                    value={selectedArea}
                                    onChange={(e) => setSelectedArea(e.target.value)}
                                    className={`w-full h-7 bg-gray-50/50 border-gray-100 rounded-md ${isRtl ? 'pr-7' : 'pl-7'} text-[11px] focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer transition-all hover:bg-white`}
                                >
                                    <option value="">{t('allAreas')}</option>
                                    {areas.map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Nearest Filter */}
                            <div className="md:col-span-3">
                                <Button
                                    onClick={() => setIsNearestActive(!isNearestActive)}
                                    className={`w-full h-7 rounded-md flex items-center justify-center gap-1.5 font-bold transition-all text-[9px] ${isNearestActive
                                        ? 'bg-green-600 text-white shadow-[0_2px_4px_rgba(34,197,94,0.3)]'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Navigation2 className={`h-2.5 w-2.5 ${isNearestActive ? 'animate-pulse' : ''}`} />
                                    {t('nearest')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fields Section */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="h-10 w-2 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                            <h2 className="text-4xl font-black text-white md:text-gray-900 tracking-tight drop-shadow-sm md:drop-shadow-none">
                                {t('availableFields')}
                            </h2>
                        </div>
                        {filteredAndSortedFields.length > 0 && (
                            <Link href="/fields" className="text-sm font-bold text-white md:text-green-600 hover:underline bg-green-600/20 md:bg-transparent px-3 py-1 rounded-full backdrop-blur-sm md:backdrop-none">
                                {t('viewAll')}
                            </Link>
                        )}
                    </div>

                    {filteredAndSortedFields.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredAndSortedFields.map((field: any) => {
                                const distance = userLoc && field.lat && field.lng
                                    ? calculateDistance(userLoc.lat, userLoc.lng, field.lat, field.lng)
                                    : null

                                return (
                                    <Card key={field.id} className="group overflow-hidden border-0 shadow-2xl hover:shadow-green-100 transition-all duration-500 rounded-[2.5rem] bg-white">
                                        <Link href={`/fields/${field.id}`}>
                                            <div className="relative h-72 w-full overflow-hidden">
                                                <Image
                                                    src={`/api/field-image/${field.id}`}
                                                    alt={field.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                                <div className={`absolute top-6 ${isRtl ? 'left-6 flex-row-reverse' : 'right-6 flex-row'} flex gap-2`}>
                                                    {bookedFieldIds.includes(field.id) && (
                                                        <Badge className="bg-green-500 text-white border-0 font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md whitespace-nowrap">
                                                            ⚽
                                                        </Badge>
                                                    )}
                                                    {distance !== null && (
                                                        <Badge className="bg-white/90 text-green-700 border-0 font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md whitespace-nowrap">
                                                            📍 {distance.toFixed(1)} {t('km')}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className={`absolute bottom-8 ${isRtl ? 'right-8 text-right' : 'left-8 text-left'} right-8`}>
                                                    <h3 className="text-3xl font-black text-white tracking-tight">
                                                        {isRtl ? field.name : (field.nameEn || field.name)}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-300 text-sm font-bold mt-2">
                                                        {field.area && (
                                                            <span className="bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">🏢 {field.area}</span>
                                                        )}
                                                        {field.address && (
                                                            <span className="bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">📍 {field.address.split(',')[0]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        <CardContent className="p-8">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-4xl font-black text-green-600">{field.pricePerHour} <span className="text-sm text-gray-400">{t('egp')}</span></p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">{t('ratePerHour')}</p>
                                                </div>
                                                <Link href={`/fields/${field.id}`}>
                                                    <Button className="rounded-2xl h-14 px-8 bg-green-600 hover:bg-green-700 font-black text-lg shadow-[0_10px_20px_rgba(34,197,94,0.3)] transition-all active:scale-95 border-0">
                                                        {t('bookNow')}
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] shadow-xl border border-gray-100">
                            <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <Search className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{t('noFieldsFound')}</h3>
                            <Button
                                variant="outline"
                                onClick={() => { setSearch(""); setSelectedArea(""); setIsNearestActive(false); }}
                                className="rounded-xl border-green-200 text-green-600 hover:bg-green-50"
                            >
                                {t('allAreas')}
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
