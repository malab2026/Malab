'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslation } from "@/components/providers/locale-context"
import { Globe } from "lucide-react"

export function Navbar() {
    const { data: session, status } = useSession()
    const { locale, setLocale, t } = useTranslation()

    const isLoading = status === 'loading'
    const buttonClass = "bg-white text-gray-900 border-0 hover:bg-gray-50 shadow-sm rounded-xl font-bold transition-all px-4 md:px-6 py-2 h-auto text-sm md:text-base"

    const toggleLanguage = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar')
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl transition-all pt-[var(--safe-area-inset-top)]">
            <div className="container flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 font-black text-2xl text-white tracking-tight shrink-0">
                    <Image src="/logo.png" alt="MALA3EBNA" width={100} height={100} className="rounded-lg shadow-lg w-[80px] md:w-[120px]" />
                </Link>

                <nav className="flex items-center gap-1 md:gap-3 overflow-hidden justify-end">
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        onClick={toggleLanguage}
                        className="text-white hover:bg-white/10 rounded-xl font-black gap-2 px-2 md:px-3 h-9 md:h-10"
                    >
                        <Globe className="h-4 w-4" />
                        <span className="hidden md:inline">{t('languageToggle')}</span>
                        <span className="md:hidden uppercase text-xs">{locale === 'ar' ? 'EN' : 'AR'}</span>
                    </Button>

                    {isLoading ? (
                        <div className="w-20 h-9 bg-white/10 animate-pulse rounded-xl" />
                    ) : session ? (
                        <div className="flex items-center gap-1 md:gap-3">
                            {session.user?.role === 'admin' ? (
                                <Button variant="secondary" className={buttonClass + " px-2 md:px-4"} asChild>
                                    <Link href="/admin">
                                        <span className="md:hidden">⚙️</span>
                                        <span className="hidden md:inline">{t('admin')}</span>
                                    </Link>
                                </Button>
                            ) : session.user?.role === 'owner' ? (
                                <Button variant="secondary" className={buttonClass + " px-2 md:px-4"} asChild>
                                    <Link href="/owner">
                                        <span className="md:hidden">🏟️</span>
                                        <span className="hidden md:inline">{t('owner')}</span>
                                    </Link>
                                </Button>
                            ) : null}

                            <Button variant="secondary" className={buttonClass + " px-2 md:px-4"} asChild>
                                <Link href="/dashboard">
                                    <span className="md:hidden">📅</span>
                                    <span className="hidden md:inline">{t('bookingHistory')}</span>
                                </Link>
                            </Button>

                            <Button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                variant="destructive"
                                className="bg-red-500 text-white hover:bg-red-600 shadow-sm rounded-xl font-bold px-3 md:px-4 py-2 h-9 md:h-10 border-0 cursor-pointer text-[10px] md:text-sm shrink-0 flex items-center gap-1"
                            >
                                <span className="md:hidden">🚪</span>
                                <span>{t('signOut')}</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-1 md:gap-3">
                            <Button variant="secondary" className={buttonClass + " px-2 md:px-4 h-9 md:h-10 flex md:hidden"} asChild title={t('bookingHistory')}>
                                <Link href="/dashboard">
                                    <span>📅</span>
                                </Link>
                            </Button>
                            <Button variant="secondary" className={buttonClass + " px-3 md:px-6 h-9 md:h-10"} asChild>
                                <Link href="/login" className="text-[10px] md:text-sm">{t('login')}</Link>
                            </Button>
                            <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-bold px-3 md:px-6 py-2 h-9 md:h-10 border-0 text-[10px] md:text-sm shrink-0" asChild>
                                <Link href="/register">{t('signUp')}</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
