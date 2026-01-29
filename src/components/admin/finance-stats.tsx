'use client'

import { Card } from "@/components/ui/card"
import { TrendingUp, DollarSign, Wallet, History } from "lucide-react"
import { useTranslation } from "@/components/providers/locale-context"

interface FinanceStatsProps {
    totalRevenue: number
    totalFees: number
    totalPayouts: number
    settledCount: number
    unsettledCount: number
}

export function FinanceStats({
    totalRevenue,
    totalFees,
    totalPayouts,
    settledCount,
    unsettledCount
}: FinanceStatsProps) {
    const { t, locale } = useTranslation()
    const isRtl = locale === 'ar'

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" dir={isRtl ? 'rtl' : 'ltr'}>
            <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <TrendingUp className="h-4 w-4 opacity-70" />
                        <span className="font-black text-[10px] uppercase tracking-widest opacity-80">{t('grossRevenue')}</span>
                    </div>
                    <div className={`text-3xl font-black mb-1 ${isRtl ? 'text-right' : ''}`}>
                        {totalRevenue.toLocaleString()} <span className="text-sm">{t('egp')}</span>
                    </div>
                    <p className={`text-[10px] font-bold opacity-50 uppercase tracking-widest ${isRtl ? 'text-right' : ''}`}>{t('totalCollected')}</p>
                </div>
            </Card>

            <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <div className={`flex items-center gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <DollarSign className="h-4 w-4 opacity-70" />
                        <span className="font-black text-[10px] uppercase tracking-widest opacity-80">{t('platformFees')}</span>
                    </div>
                    <div className={`text-3xl font-black mb-1 ${isRtl ? 'text-right' : ''}`}>
                        {totalFees.toLocaleString()} <span className="text-sm">{t('egp')}</span>
                    </div>
                    <p className={`text-[10px] font-bold opacity-50 uppercase tracking-widest ${isRtl ? 'text-right' : ''}`}>{t('platformNetProfit')}</p>
                </div>
            </Card>

            <Card className="p-6 rounded-[2rem] border-0 shadow-xl bg-white border-blue-50 relative overflow-hidden group ring-2 ring-blue-500/10">
                <div className="relative z-10">
                    <div className={`flex items-center gap-2 mb-4 text-blue-600 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <Wallet className="h-4 w-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest mt-0.5">{t('targetPayouts')}</span>
                    </div>
                    <div className={`text-3xl font-black mb-1 text-gray-900 ${isRtl ? 'text-right' : ''}`}>
                        {totalPayouts.toLocaleString()} <span className="text-sm text-gray-400">{t('egp')}</span>
                    </div>
                    <p className={`text-[10px] font-bold text-blue-500 uppercase tracking-widest ${isRtl ? 'text-right' : ''}`}>{t('ownerNetShare')}</p>
                </div>
            </Card>

            <Card className="p-6 rounded-[2rem] border-0 shadow-lg bg-gray-50 flex flex-col justify-center relative overflow-hidden group">
                <div className="relative z-10">
                    <div className={`flex items-center gap-2 mb-4 text-gray-400 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <History className="h-4 w-4" />
                        <span className="font-black text-[10px] uppercase tracking-widest mt-0.5">{t('settlementProcess')}</span>
                    </div>
                    <div className={`text-2xl font-black text-gray-900 mb-1 ${isRtl ? 'text-right' : ''}`}>
                        {settledCount} <span className="text-xs text-gray-400 uppercase tracking-widest">{t('settledCount')}</span>
                    </div>
                    <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${isRtl ? 'text-right' : ''}`}>{unsettledCount} {t('pendingCount')}</p>
                </div>
            </Card>
        </div>
    )
}
