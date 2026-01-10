import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { handleSignOut } from "@/actions/auth-actions"

export async function Navbar() {
    const session = await auth()

    const buttonClass = "bg-white text-gray-900 border-0 hover:bg-gray-50 shadow-sm rounded-xl font-bold transition-all px-6 py-2 h-auto"

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl transition-all pt-[var(--safe-area-inset-top)]">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 font-black text-2xl text-white tracking-tight">
                    <span className="bg-green-500 p-1.5 rounded-lg shadow-lg shadow-green-500/20">⚽</span>
                    <span>Malaeb</span>
                </Link>

                <nav className="flex items-center gap-3">
                    {session ? (
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <Button variant="secondary" className={buttonClass}>Dashboard</Button>
                            </Link>

                            {session.user?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="secondary" className={buttonClass}>Admin</Button>
                                </Link>
                            )}

                            {session.user?.role === 'owner' && (
                                <Link href="/owner">
                                    <Button variant="secondary" className={buttonClass}>Owner</Button>
                                </Link>
                            )}

                            <form action={handleSignOut}>
                                <Button type="submit" variant="destructive" className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm rounded-xl font-bold px-4 py-2 h-auto border-0">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link href="/login">
                                <Button variant="secondary" className={buttonClass}>Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 rounded-xl font-bold px-6 py-2 h-auto border-0">
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
