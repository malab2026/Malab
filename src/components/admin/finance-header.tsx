'use client'

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "@/components/providers/locale-context"

export function FinanceHeader() {
    const { t } = useTranslation()

    return (
        <div className="mb-12">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors font-bold uppercase tracking-widest">
                <ArrowLeft className="h-4 w-4" /> {t('backToAdmin')}
            </Link>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">{t('financeTitle')}</h1>
            <p className="text-gray-400 font-bold text-lg">{t('financeSubtitle')}</p>
        </div>
    )
}
