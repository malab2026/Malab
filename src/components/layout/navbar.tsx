'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslation } from "@/components/providers/locale-context"
import { Globe, MessageCircle } from "lucide-react"
import { NotificationBell } from "./notification-bell"
import { getWhatsAppChatLink } from "@/lib/whatsapp"
import { useEffect, useState } from "react"
import { getGlobalSettings } from "@/actions/admin-actions"

export function Navbar() {
    const { data: session, status } = useSession()
    const { locale, setLocale, t } = useTranslation()
    const [adminPhone, setAdminPhone] = useState("201009410112")

    useEffect(() => {
        getGlobalSettings().then(res => {
            if (res.success && res.settings?.adminPhone) {
                setAdminPhone(res.settings.adminPhone)
            }
        })
    }, [])

    const whatsappLink = getWhatsAppChatLink(adminPhone, locale === 'ar' ? 'مرحباً، أحتاج إلى مساعدة في تطبيق ملاعبنا.' : 'Hello, I need help with the Malaebna app.')

    const isLoading = status === 'loading'
    const buttonClass = "bg-white text-gray-900 border-0 hover:bg-gray-50 shadow-sm rounded-xl font-bold transition-all px-2 md:px-6 py-2 h-auto text-sm md:text-base flex items-center justify-center"

    const toggleLanguage = () => {
        setLocale(locale === 'ar' ? 'en' : 'ar')
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl transition-all pt-[var(--safe-area-inset-top)]">
                <div className="container flex h-16 items-center justify-between px-2 md:px-4">
                    <div className="flex items-center gap-1 md:gap-4 shrink-0">
                        <Link href="/" className="flex items-center font-black text-2xl text-white tracking-tight shrink-0">
                            <Image src="/logo.png" alt="MALA3EBNA" width={100} height={100} className="rounded-lg shadow-lg w-[60px] md:w-[120px]" />
                        </Link>
                        {session && (
                            <NotificationBell />
                        )}
                    </div>

                    <nav className="flex items-center gap-0.5 md:gap-3 justify-end min-w-0">
                        {/* WhatsApp Support Button */}
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-green-500/20 rounded-xl font-black gap-1 px-1.5 md:px-3 h-8 md:h-10 shrink-0 text-green-400"
                            asChild
                        >
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="h-4 w-4" />
                                <span className="hidden md:inline">Support</span>
                            </a>
                        </Button>

                        {/* Language Toggle */}
                        <Button
                            variant="ghost"
                            onClick={toggleLanguage}
                            className="text-white hover:bg-white/10 rounded-xl font-black gap-1 px-1.5 md:px-3 h-8 md:h-10 shrink-0"
                        >
                            <Globe className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">{t('languageToggle')}</span>
                            <span className="md:hidden uppercase text-[10px]">{locale === 'ar' ? 'EN' : 'AR'}</span>
                        </Button>

                        {isLoading ? (
                            <div className="w-16 h-8 bg-white/10 animate-pulse rounded-xl" />
                        ) : session ? (
                            <div className="flex items-center gap-0.5 md:gap-3 min-w-0">
                                {session.user?.role === 'admin' ? (
                                    <Button variant="secondary" className={buttonClass + " px-2 md:px-4 h-8 md:h-10"} asChild>
                                        <Link href="/admin">
                                            <span className="md:hidden">⚙️</span>
                                            <span className="hidden md:inline">{t('admin')}</span>
                                        </Link>
                                    </Button>
                                ) : session.user?.role === 'owner' ? (
                                    <Button variant="secondary" className={buttonClass + " px-2 md:px-4 h-8 md:h-10"} asChild>
                                        <Link href="/owner">
                                            <span className="md:hidden">🏟️</span>
                                            <span className="hidden md:inline">{t('owner')}</span>
                                        </Link>
                                    </Button>
                                ) : null}

                                <Button variant="secondary" className={buttonClass + " px-2 md:px-4 h-8 md:h-10"} asChild>
                                    <Link href="/dashboard">
                                        <span className="md:hidden text-[9px] whitespace-nowrap leading-none">{t('previousBooking')}</span>
                                        <span className="hidden md:inline">{t('bookingHistory')}</span>
                                    </Link>
                                </Button>

                                <Button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    variant="destructive"
                                    className="bg-red-500 text-white hover:bg-red-600 shadow-sm rounded-xl font-bold px-2 md:px-4 py-1 h-8 md:h-10 border-0 cursor-pointer text-[9px] md:text-sm shrink-0 flex items-center gap-0.5"
                                >
                                    <span className="md:hidden">🚪</span>
                                    <span className="leading-none">{t('signOut')}</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-0.5 md:gap-3">
                                <Button variant="secondary" className={buttonClass + " px-1.5 md:px-3 h-8 md:h-10 flex md:hidden"} asChild title={t('previousBooking')}>
                                    <Link href="/dashboard">
                                        <span className="text-[10px] whitespace-nowrap">{t('previousBooking')}</span>
                                    </Link>
                                </Button>
                                <Button variant="secondary" className={buttonClass + " px-2 md:px-6 h-8 md:h-10"} asChild>
                                    <Link href="/login" className="text-[10px] md:text-sm">{t('login')}</Link>
                                </Button>
                                <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-bold px-2 md:px-6 py-1 h-8 md:h-10 border-0 text-[10px] md:text-sm shrink-0" asChild>
                                    <Link href="/register">{t('signUp')}</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Floating WhatsApp Button */}
            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-24 right-6 z-[40] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all group flex items-center gap-2"
            >
                <MessageCircle className="h-6 w-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-bold text-sm">WhatsApp Admin</span>
            </a>
        </>
    )
}
