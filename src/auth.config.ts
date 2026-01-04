import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET ?? "7f8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z",
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
