'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { LocalNotifications } from '@capacitor/local-notifications'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

interface NotificationContextType {
    showSystemNotification: (title: string, message: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(Capacitor.isNativePlatform())

        if (Capacitor.isNativePlatform()) {
            requestPermissions()
        }
    }, [])

    const requestPermissions = async () => {
        try {
            const perm = await LocalNotifications.requestPermissions()
            if (perm.display !== 'granted') {
                console.warn('Notification permissions not granted')
            }

            // Also register for Push Notifications (standard scaffolding)
            const pushPerm = await PushNotifications.requestPermissions()
            if (pushPerm.receive === 'granted') {
                await PushNotifications.register()
            }
        } catch (e) {
            console.error('Error requesting notification permissions:', e)
        }
    }

    const showSystemNotification = async (title: string, message: string) => {
        if (!Capacitor.isNativePlatform()) {
            // Fallback for web if needed, but we rely on in-app UI for web
            return
        }

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body: message,
                        id: Math.floor(Math.random() * 1000000),
                        schedule: { at: new Date(Date.now() + 1000) }, // Show in 1 second
                        sound: 'default',
                        attachments: [],
                        actionTypeId: '',
                        extra: null
                    }
                ]
            })
        } catch (e) {
            console.error('Error scheduling local notification:', e)
        }
    }

    return (
        <NotificationContext.Provider value={{ showSystemNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}
