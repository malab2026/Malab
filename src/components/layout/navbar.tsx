import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export async function Navbar() {
    const session = await auth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                    ⚽ Malaeb
                </Link>

                <nav className="flex gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            {session.user?.role === 'admin' && (
                                <Link href="/admin">
                                    <Button variant="ghost">Admin</Button>
                                </Link>
                            )}
                            {session.user?.role === 'owner' && (
                                <Link href="/owner">
                                    <Button variant="ghost">Owner Dashboard</Button>
                                </Link>
                            )}
                            <form action={async () => {
                                'use server';
                                await signOut({ redirectTo: '/' });
                            }}>
                                <Button type="submit" variant="outline">Sign Out</Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
