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
                // Fresh login - set role and id from DB user object
                console.log("[AuthConfig] JWT Callback - User:", user.email, "Role:", (user as any).role);
                token.role = (user as any).role;
                token.id = user.id;
                token.roleRefreshedAt = Date.now();
            } else if (token.id) {
                // Refresh role from DB every 5 minutes to pick up role changes
                const lastRefresh = (token.roleRefreshedAt as number) || 0;
                const fiveMinutes = 5 * 60 * 1000;
                if (Date.now() - lastRefresh > fiveMinutes) {
                    try {
                        const { default: prisma } = await import("@/lib/prisma");
                        const dbUser = await prisma.user.findUnique({
                            where: { id: token.id as string },
                            select: { role: true }
                        });
                        if (dbUser) {
                            token.role = dbUser.role;
                            token.roleRefreshedAt = Date.now();
                            console.log("[AuthConfig] JWT Role Refreshed:", token.role);
                        }
                    } catch (e) {
                        console.error("[AuthConfig] Role refresh error:", e);
                    }
                }
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

