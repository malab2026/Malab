import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isLoginPage = req.nextUrl.pathname.startsWith('/login')

    if (isOnAdmin) {
        if (isLoggedIn && req.auth?.user?.role === 'admin') return null
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
