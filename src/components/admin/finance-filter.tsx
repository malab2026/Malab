'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/providers/locale-context"

interface FinanceFilterProps {
    clubs: any[]
    fields: any[]
}

export function FinanceFilter({ clubs, fields }: FinanceFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t, locale } = useTranslation()

    const currentFieldId = searchParams.get('fieldId') || 'all'
    const currentClubId = searchParams.get('clubId') || 'all'

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/admin/finance?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/admin/finance')
    }

    const hasFilters = currentFieldId !== 'all' || currentClubId !== 'all'

    return (
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col md:flex-row items-end gap-6">
                <div className="flex-1 space-y-2 w-full">
                    <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {locale === 'ar' ? 'تصنيف حسب النادي' : 'Filter by Club'}
                    </Label>
                    <select
                        className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold shadow-sm cursor-pointer appearance-none"
                        value={currentClubId}
                        onChange={(e) => updateFilter('clubId', e.target.value)}
                    >
                        <option value="all">{locale === 'ar' ? 'كل الأندية' : 'All Clubs'}</option>
                        {clubs.map((club) => (
                            <option key={club.id} value={club.id}>
                                {locale === 'ar' ? (club.name || club.nameEn) : (club.nameEn || club.name)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 space-y-2 w-full">
                    <Label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {locale === 'ar' ? 'تصنيف حسب الملعب' : 'Filter by Stadium'}
                    </Label>
                    <select
                        className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold shadow-sm cursor-pointer appearance-none"
                        value={currentFieldId}
                        onChange={(e) => updateFilter('fieldId', e.target.value)}
                    >
                        <option value="all">{locale === 'ar' ? 'كل الملاعب' : 'All Stadiums'}</option>
                        {fields.map((field) => (
                            <option key={field.id} value={field.id}>
                                {locale === 'ar' ? (field.name || field.nameEn) : (field.nameEn || field.name)}
                            </option>
                        ))}
                    </select>
                </div>

                {hasFilters && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-12 px-6 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <X className="h-4 w-4 mr-2" />
                        {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                    </Button>
                )}
            </div>
        </div>
    )
}
