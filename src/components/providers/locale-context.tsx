'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Locale } from '@/lib/translations'

interface LocaleContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string, replacements?: Record<string, string | number>) => string
    isRtl: boolean
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('ar')

    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale
        if (saved && (saved === 'ar' || saved === 'en')) {
            setLocaleState(saved)
        }
    }, [])

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('locale', newLocale)
        document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', newLocale)
    }

    const t = (key: string, replacements?: Record<string, string | number>) => {
        const keys = key.split('.')
        let translation: any = translations[locale]

        for (const k of keys) {
            if (translation[k] === undefined) {
                console.warn(`Translation key not found: ${key}`)
                return key
            }
            translation = translation[k]
        }

        let text = translation as string
        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v))
            })
        }
        return text
    }

    const isRtl = locale === 'ar'

    useEffect(() => {
        document.documentElement.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
        document.documentElement.setAttribute('lang', locale)
    }, [locale])

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t, isRtl }}>
            {children}
        </LocaleContext.Provider>
    )
}

export function useTranslation() {
    const context = useContext(LocaleContext)
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LocaleProvider')
    }
    return context
}
