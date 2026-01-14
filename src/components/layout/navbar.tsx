'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslation } from "@/components/providers/locale-context"
import { Globe } from "lucide-react"

export function Navbar() {
    const { data: session } = useSession()
    const { locale, setLocale, t } = useTranslation()

    const buttonClass = "bg-white text-gray-900 border-0 hover:bg-gray-50 shadow-sm rounded-xl font-bold transition-all px-4 md:px-6 py-2 h-auto text-sm md:text-base"

    const toggleLanguage = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl transition-all pt-[var(--safe-area-inset-top)]">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 font-black text-2xl text-white tracking-tight">
                    <Image src="/logo.png" alt="MALA3EBNA" width={120} height={120} className="rounded-lg shadow-lg" />
                </Link>

                <nav className="flex items-center gap-2 md:gap-3">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        onClick={toggleLanguage}
                        className="text-white hover:bg-white/10 rounded-xl font-black gap-2 px-3"
                    >
                        <Globe className="h-4 w-4" />
                        <span className="hidden md:inline">{t('languageToggle')}</span>
                        <span className="md:hidden uppercase">{locale === 'ar' ? 'EN' : 'AR'}</span>
                    </Button>

                    {session ? (
                        <div className="flex items-center gap-2 md:gap-3">
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/dashboard">{t('dashboard')}</Link>
                            </Button>

                            {session.user?.role === 'admin' && (
                                <Button variant="secondary" className={buttonClass} asChild>
                                    <Link href="/admin">{t('admin')}</Link>
                                </Button>
                            )}

                            {session.user?.role === 'owner' && (
                                <Button variant="secondary" className={buttonClass} asChild>
                                    <Link href="/owner">{t('owner')}</Link>
                                </Button>
                            )}

                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/dashboard">📅 {t('bookingHistory')}</Link>
                            </Button>

                            <Button
                                onClick={() => signOut()}
                                variant="destructive"
                                className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm rounded-xl font-bold px-3 md:px-4 py-2 h-auto border-0 cursor-pointer text-sm md:text-base"
                            >
                                {t('signOut')}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2 md:gap-3">
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/dashboard">📅 {t('bookingHistory')}</Link>
                            </Button>
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/login">{t('login')}</Link>
                            </Button>
                            <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-bold px-4 md:px-6 py-2 h-auto border-0 text-sm md:text-base" asChild>
                                <Link href="/register">{t('signUp')}</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
