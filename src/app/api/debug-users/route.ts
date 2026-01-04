import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                createdAt: true,
                // Do NOT select password
            }
        });

        const admin = users.find(u => u.email === 'admin@malaeb.com');

        return NextResponse.json({
            userCount: users.length,
            adminExists: !!admin,
            users: users,
            envCheck: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
