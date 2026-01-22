'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/actions/notification-actions'
import { useTranslation } from '@/components/providers/locale-context'
import { Button } from '@/components/ui/button'

export function NotificationBell() {
    const { t, isRtl } = useTranslation()
    const [notifications, setNotifications] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        const data = await getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.isRead).length)
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
                className="relative text-white hover:bg-white/10 rounded-xl h-10 w-10"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className={`absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-4 overflow-hidden z-[60] ${isRtl ? 'left-0' : 'right-0'}`}>
                    <div className="px-4 pb-3 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">{t('notifications')}</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                {unreadCount} NEW
                            </span>
                        )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-gray-400 text-sm font-medium">{t('noNotifications')}</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleMarkAsRead(n.id)}
                                    className={`px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className={`text-sm tracking-tight ${!n.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`}>
                                            {n.title}
                                        </h4>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
