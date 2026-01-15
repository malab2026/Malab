'use client'

import { Navbar } from "@/components/layout/navbar"
import Image from "next/image"
import { useState } from "react"
import { BookingForm } from "@/components/booking/booking-form"
import { useTranslation } from "@/components/providers/locale-context"

export function FieldDetailsClient({ field, initialBookings, serviceFee, userRole }: any) {
    const { t, isRtl } = useTranslation()
    const [selectedImage, setSelectedImage] = useState(0)

    const images = [
        field.imageUrl,
        field.imageUrl2,
        field.imageUrl3
    ].filter(Boolean)

    return (
        <main className="min-h-screen pb-10 bg-gray-50/30">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col gap-10 max-w-5xl mx-auto">
                    {/* Top: Image & Info */}
                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
                                <Image
                                    src={images[selectedImage]?.startsWith('data:') ? images[selectedImage] : `/api/field-image/${field.id}?index=${selectedImage}`}
                                    alt={field.name}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6 md:p-10">
                                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                                        {isRtl ? field.name : (field.nameEn || field.name)}
                                    </h1>
                                </div>
                            </div>

                            {/* Image Navigation Dots / Thumbnails */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`w-3 h-3 rounded-full transition-all ${idx === selectedImage ? 'bg-green-500 w-8' : 'bg-white/50 hover:bg-white'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails list */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative h-20 w-32 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${idx === selectedImage ? 'border-green-500 scale-95 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <Image
                                            src={img?.startsWith('data:') ? img : `/api/field-image/${field.id}?index=${idx}`}
                                            alt={`${field.name} ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <p className="text-3xl md:text-4xl font-black text-green-600">{field.pricePerHour} {t('egp')} <span className="text-sm font-medium text-gray-400">/ {t('hour')}</span></p>
                                    {field.address && (
                                        <p className="text-gray-500 mt-2 flex items-center gap-2 font-semibold">
                                            📍 {field.address}
                                        </p>
                                    )}
                                </div>
                                {field.locationUrl && (
                                    <a
                                        href={field.locationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full md:w-auto text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                    >
                                        {isRtl ? "خرائط Google 🗺️" : "Open Maps 🗺️"}
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                📖 {t('aboutField')}
                            </h3>
                            <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                                {isRtl ? field.description : (field.descriptionEn || field.description)}
                            </p>

                            <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl">
                                <h4 className="text-orange-900 font-bold mb-3 flex items-center gap-2 text-lg">
                                    🛡️ {t('cancellationPolicy')}
                                </h4>
                                <p className="text-orange-800/80 leading-relaxed whitespace-pre-line font-medium">
                                    {field.cancellationPolicy || t('noPolicy')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Booking Form */}
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="w-2 h-10 bg-green-500 rounded-full"></div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                {t('reserveSlot')}
                            </h2>
                        </div>
                        <BookingForm
                            field={field}
                            userRole={userRole}
                            initialBookings={initialBookings}
                            serviceFee={serviceFee}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
