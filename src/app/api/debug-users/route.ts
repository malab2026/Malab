import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                createdAt: true,
                password: true,
            }
        });

        const admin = users.find(u => u.email === 'admin@malaeb.com');
        let adminPasswordCheck = "N/A";

        if (admin) {
            const isMatch = await bcrypt.compare('admin123', (admin as any).password);
            adminPasswordCheck = isMatch ? "MATCH (admin123)" : "MISMATCH";
        }

        return NextResponse.json({
            userCount: users.length,
            adminStatus: {
                exists: !!admin,
                passwordCheck: adminPasswordCheck
            },
            users: users.map(u => ({ ...u, password: '[REDACTED]' })),
            envCheck: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
