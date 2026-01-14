'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/components/providers/locale-context"

export function HomeClient({ session, sortedFields, bookedFieldIds }: any) {
    const { t, isRtl } = useTranslation()

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
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        {t('heroTitle')} <span className="text-green-400">Booking</span>
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

            <div className="container mx-auto -mt-20 relative z-30 px-4 space-y-16 pb-20">
                {/* Fields Section */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="h-10 w-2 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"></span>
                            <h2 className="text-4xl font-black text-white md:text-gray-900 tracking-tight drop-shadow-sm md:drop-shadow-none">
                                {t('availableFields')}
                            </h2>
                        </div>
                        <Link href="/fields" className="text-sm font-bold text-white md:text-green-600 hover:underline bg-green-600/20 md:bg-transparent px-3 py-1 rounded-full backdrop-blur-sm md:backdrop-none">
                            {t('viewAll')}
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {sortedFields.map((field: any) => (
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

                                        {bookedFieldIds.includes(field.id) && (
                                            <div className={`absolute top-6 ${isRtl ? 'right-6' : 'left-6'} animate-pulse`}>
                                                <Badge className="bg-green-500 text-white border-0 font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md">
                                                    {t('youBookedThisBefore')}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className={`absolute bottom-8 ${isRtl ? 'right-8' : 'left-8'} right-8`}>
                                            <h3 className="text-3xl font-black text-white tracking-tight">{field.name}</h3>
                                            <div className="flex items-center gap-2 text-gray-300 text-sm font-bold mt-2">
                                                {field.address && (
                                                    <span className="bg-white/10 px-2 py-0.5 rounded">📍 {field.address.split(',')[0]}</span>
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
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
