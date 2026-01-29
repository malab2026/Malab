'use client'

import { Badge } from "@/components/ui/badge"
import { CheckSquare, CheckCircle2 } from "lucide-react"
import { AdminBookingCard } from "@/components/admin/admin-booking-card"
import { AdminHistoryManager } from "@/components/admin/admin-history-manager"
import { useTranslation } from "@/components/providers/locale-context"

interface ApprovalsClientProps {
    pendingBookings: any[]
    cancelRequests: any[]
    historyBookings: any[]
}

export function ApprovalsClient({ pendingBookings, cancelRequests, historyBookings }: ApprovalsClientProps) {
    const { t } = useTranslation()

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gray-900 p-2 rounded-lg">
                        <CheckSquare className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{t('managementModule')}</h2>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('approvalsHistory')}</h1>
                <p className="text-gray-500 font-bold">{t('manageApprovalsDesc')}</p>
            </div>

            <div className="space-y-12">
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 w-1 rounded-full h-8" />
                            <h2 className="text-2xl font-black text-gray-900">{t('newBookingRequests')}</h2>
                        </div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-black border-blue-100">
                            {pendingBookings.length} {t('total')}
                        </Badge>
                    </div>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking: any) => (
                            <AdminBookingCard key={booking.id} booking={booking} isAdmin />
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500 w-1 rounded-full h-8" />
                            <h2 className="text-2xl font-black text-gray-900">{t('cancellationRequests')}</h2>
                        </div>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 font-black border-orange-100">
                            {cancelRequests.length} {t('total')}
                        </Badge>
                    </div>
                    <div className="grid gap-4">
                        {cancelRequests.map((booking: any) => (
                            <AdminBookingCard key={booking.id} booking={booking} isAdmin isCancelRequest />
                        ))}
                    </div>
                </section>

                {pendingBookings.length === 0 && cancelRequests.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">{t('inboxClear')}</h3>
                        <p className="text-gray-500 font-bold">{t('noPendingApprovals')}</p>
                    </div>
                )}

                <section className="mt-12 pt-12 border-t border-gray-200">
                    <AdminHistoryManager bookings={historyBookings} />
                </section>
            </div>
        </div>
    )
}
