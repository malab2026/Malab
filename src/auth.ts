import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "force-logout-new-secret-v2-phone-auth-update"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                phone: { label: "Phone Number", type: "text" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ phone: z.string().min(10), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { phone, password } = parsedCredentials.data;
                    console.log(`[Auth] Login Attempt: ${phone}`);

                    const user = await prisma.user.findUnique({
                        where: { phone },
                    });

                    if (!user) {
                        console.log('[Auth] User found: false');
                        return null;
                    }
                    console.log('[Auth] User found: true');

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log(`[Auth] Password match: ${passwordsMatch}`);

                    if (passwordsMatch) return user;
                }

                console.log('[Auth] Invalid credentials format or password mismatch');
                return null;
            },
        }),
    ],
})
