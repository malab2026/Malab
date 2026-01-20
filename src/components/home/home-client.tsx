'use client'

import Link from "next/link"
import Image from "next/image"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Building2 } from "lucide-react"
import { useTranslation } from "@/components/providers/locale-context"

export function HomeClient({ session, clubs, bookedClubIds }: any) {
    const { t, isRtl } = useTranslation()
    const [search, setSearch] = useState("")

    const filteredClubs = useMemo(() => {
        let result = [...clubs]

        if (search) {
            const searchLower = search.toLowerCase()
            result = result.filter(club =>
                club.name.toLowerCase().includes(searchLower) ||
                (club.nameEn && club.nameEn.toLowerCase().includes(searchLower)) ||
                (club.address && club.address.toLowerCase().includes(searchLower))
            )
        }

        return result
    }, [clubs, search])

    return (
        <div className="flex flex-col bg-gray-50/50">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <Image
                        src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
                        alt="Hero Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="relative z-20 px-4 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-2xl">
                        {t('heroTitle')}
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 mb-8 font-bold drop-shadow-lg">
                        {t('heroSubtitle')}
                    </p>
                    {!session && (
                        <Button size="lg" asChild className="bg-green-500 hover:bg-green-600 text-white shadow-2xl shadow-green-500/50 rounded-xl font-black px-8 py-6 text-lg">
                            <Link href="/register">{t('joinNow')}</Link>
                        </Button>
                    )}
                </div>
            </section>

            {/* Search Section */}
            <section className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isRtl ? 'right-3' : 'left-3'}`} />
                            <Input
                                placeholder={t('searchByName')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`h-12 border-2 border-gray-200 focus-visible:ring-green-500 font-semibold shadow-sm ${isRtl ? 'pr-10' : 'pl-10'}`}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Clubs Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-green-600" />
                        {isRtl ? 'الأندية المتاحة' : 'Available Clubs'}
                    </h2>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        {filteredClubs.length}
                    </Badge>
                </div>

                {filteredClubs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">{t('noFieldsFound')}</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClubs.map((club: any) => (
                            <ClubCard
                                key={club.id}
                                club={club}
                                isBooked={bookedClubIds.includes(club.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

function ClubCard({ club, isBooked }: any) {
    const { t, locale, isRtl } = useTranslation()
    const displayName = locale === 'ar' ? club.name : (club.nameEn || club.name)
    const displayAddress = locale === 'ar' ? club.address : (club.addressEn || club.address)

    return (
        <Link href={`/clubs/${club.id}`}>
            <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 hover:border-green-500 cursor-pointer h-full">
                {/* Club Logo */}
                <div className="relative w-full h-40 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                    {club.logoUrl ? (
                        <Image
                            src={club.logoUrl}
                            alt={displayName}
                            fill
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <Building2 className="h-20 w-20 text-green-300" />
                    )}

                    {isBooked && (
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white shadow-lg">
                            {t('youBookedThisBefore')}
                        </Badge>
                    )}
                </div>

                <CardContent className="p-6">
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                                {displayName}
                            </h3>
                            {displayAddress && (
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                    <span>📍</span>
                                    <span className="truncate">{displayAddress}</span>
                                </p>
                            )}
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-sm font-bold">
                                    {club._count.fields} {isRtl ? 'ملعب' : 'Fields'}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg"
                            >
                                {isRtl ? 'عرض الملاعب' : 'View Fields'} →
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
