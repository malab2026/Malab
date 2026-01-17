'use client'

import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useRouter, usePathname } from 'next/navigation'

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        let backListener: any = null;

        const setupListener = async () => {
            backListener = await App.addListener('backButton', () => {
                if (pathname === '/') {
                    // On home page, exit app
                    App.exitApp()
                } else {
                    // On other pages, go back
                    window.history.back()
                }
            })
        }

        // Only run on Capacitor (Native)
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
            setupListener()
        }

        return () => {
            if (backListener) {
                backListener.remove()
            }
        }
    }, [pathname])

    return <>{children}</>
}
