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
    const currentStartDate = searchParams.get('startDate') || ''
    const currentEndDate = searchParams.get('endDate') || ''

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all' || value === '') {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        router.push(`/admin/finance?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/admin/finance')
    }

    const hasFilters = currentFieldId !== 'all' || currentClubId !== 'all' || currentStartDate || currentEndDate

    return (
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-[1.5] grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            {locale === 'ar' ? 'من تاريخ' : 'Date From'}
                        </Label>
                        <input
                            type="date"
                            className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold shadow-sm cursor-pointer appearance-none"
                            value={currentStartDate}
                            onChange={(e) => updateFilter('startDate', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                            {locale === 'ar' ? 'إلى تاريخ' : 'Date To'}
                        </Label>
                        <input
                            type="date"
                            className="w-full h-12 bg-white border border-gray-200 rounded-2xl px-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-bold shadow-sm cursor-pointer appearance-none"
                            value={currentEndDate}
                            onChange={(e) => updateFilter('endDate', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-[1] space-y-2 w-full">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {locale === 'ar' ? 'تصنيف حسب النادي' : 'Club'}
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

                <div className="flex-[1] space-y-2 w-full">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        {locale === 'ar' ? 'تصنيف حسب الملعب' : 'Stadium'}
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
                        className="h-12 px-4 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-all shrink-0"
                    >
                        <X className="h-4 w-4 mr-2" />
                        {locale === 'ar' ? 'مسح' : 'Clear'}
                    </Button>
                )}
            </div>
        </div>
    )
}
