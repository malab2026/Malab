import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET ?? "malaeb-secret-v3-rotated-for-phone-auth",
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                console.log("[AuthConfig] JWT Callback - User:", user.email, "Role:", (user as any).role);
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                console.log("[AuthConfig] Session Callback - Role Set:", session.user.role);
            }
            return session;
        },
    },
    providers: [], // Empty array, we will add credentials in auth.ts
} satisfies NextAuthConfig
