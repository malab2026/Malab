import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "malaeb-secret-v3-rotated-for-phone-auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    if (isOnAdmin) {
        console.log("[Middleware] Checking Admin Access. LoggedIn:", isLoggedIn, "Role:", req.auth?.user?.role);
        if (isLoggedIn && req.auth?.user?.role === 'admin') return null
        console.log("[Middleware] Access Denied. Redirecting to /");
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    if (isOnDashboard) {
        if (isLoggedIn) return null
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (isLoginPage) {
        if (isLoggedIn) return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
        return null
    }

    return null
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
