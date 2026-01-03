import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET || "fc3637cfe6eb516c141655079a4de541",
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Empty array, we will add credentials in auth.ts
} satisfies NextAuthConfig
