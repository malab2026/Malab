'use client'

import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "@/components/providers/locale-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"

interface ClubDetailsClientProps {
    club: any
    bookedFieldIds: string[]
}

export function ClubDetailsClient({ club, bookedFieldIds }: ClubDetailsClientProps) {
    const { t, locale } = useTranslation()

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Club Header with Grass Background */}
            <div className="relative text-white py-16 overflow-hidden">
                {/* Grass Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/bg-grass.png"
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Darker Gradient Overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="mb-8">
                        <BackButton
                            variant="secondary"
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
                            fallbackUrl="/"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {club.logoUrl && (
                            <div className="relative w-48 h-48 rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white/20 shrink-0">
                                <Image
                                    src={club.logoUrl}
                                    alt={club.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 text-center md:text-right">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-lg">
                                {club.name}
                            </h1>
                            {club.address && (
                                <p className="text-xl text-green-50 flex items-center justify-center md:justify-start gap-2 font-medium">
                                    <span>📍</span> {club.address}
                                </p>
                            )}
                            {club.description && (
                                <p className="mt-6 text-green-100 max-w-3xl text-lg leading-relaxed drop-shadow-md">
                                    {club.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Fields List */}
            <div className="container mx-auto py-12 px-4">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-white bg-green-700/80 px-6 py-2 rounded-xl backdrop-blur-sm self-start inline-block shadow-lg">
                        {t('clubFields', { count: club.fields.length })}
                    </h2>
                </div>

                {club.fields.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
                        <p className="text-xl text-gray-400 font-medium">
                            {locale === 'ar' ? 'لا توجد ملاعب متاحة حالياً' : 'No fields available yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {club.fields.map((field: any) => (
                            <Link key={field.id} href={`/fields/${field.id}`}>
                                <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white rounded-3xl cursor-pointer h-full flex flex-col">
                                    <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
                                        <Image
                                            src={`/api/field-image/${field.id}`}
                                            alt={field.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {bookedFieldIds.includes(field.id) && (
                                            <Badge className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 shadow-xl border-2 border-white animate-pulse">
                                                {t('youBookedThis')}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-7 flex-1 flex flex-col">
                                        <h3 className="font-black text-2xl text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                                            {locale === 'en' && field.nameEn ? field.nameEn : field.name}
                                        </h3>
                                        {field.address && (
                                            <p className="text-base text-gray-500 mb-6 flex items-center gap-2">
                                                <span className="text-green-500">📍</span>
                                                <span className="truncate">{locale === 'en' && field.addressEn ? field.addressEn : field.address}</span>
                                            </p>
                                        )}
                                        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-3xl font-black text-green-600">
                                                    {field.pricePerHour}
                                                </span>
                                                <span className="text-sm font-bold text-gray-400 mr-2">
                                                    {t('egp')}
                                                </span>
                                            </div>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                                {t('ratePerHour')}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
