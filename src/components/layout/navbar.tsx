import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { handleSignOut } from "@/actions/auth-actions"
import Image from "next/image"

export async function Navbar() {
    const session = await auth()

    const buttonClass = "bg-white text-gray-900 border-0 hover:bg-gray-50 shadow-sm rounded-xl font-bold transition-all px-6 py-2 h-auto"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl transition-all pt-[var(--safe-area-inset-top)]">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 font-black text-2xl text-white tracking-tight">
                    <Image src="/logo.png" alt="MALA3EBNA" width={120} height={120} className="rounded-lg shadow-lg" />
                </Link>

                <nav className="flex items-center gap-3">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/">Dashboard</Link>
                            </Button>

                            {session.user?.role === 'admin' && (
                                <Button variant="secondary" className={buttonClass} asChild>
                                    <Link href="/admin">Admin</Link>
                                </Button>
                            )}

                            {session.user?.role === 'owner' && (
                                <Button variant="secondary" className={buttonClass} asChild>
                                    <Link href="/owner">Owner</Link>
                                </Button>
                            )}

                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/dashboard">📅 Booking History</Link>
                            </Button>

                            <form action={handleSignOut}>
                                <Button type="submit" variant="destructive" className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm rounded-xl font-bold px-4 py-2 h-auto border-0 cursor-pointer">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/download">📥 Download</Link>
                            </Button>
                            <Button variant="secondary" className={buttonClass} asChild>
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-bold px-6 py-2 h-auto border-0" asChild>
                                <Link href="/register">Sign Up</Link>
                            </Button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
