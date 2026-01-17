'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useRouter, usePathname } from 'next/navigation'

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handleBackButton = async () => {
            await App.addListener('backButton', ({ canGoBack }) => {
                if (canGoBack) {
                    window.history.back()
                } else if (pathname !== '/') {
                    router.push('/')
                } else {
                    App.exitApp()
                }
            })
        }

        // Only run on Capacitor (Native)
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
            handleBackButton()
        }

        return () => {
            App.removeAllListeners()
        }
    }, [router, pathname])

    return <>{children}</>
}
