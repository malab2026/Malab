import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Fix NULL/Empty phone numbers using raw SQL
        const fixedUsers = await prisma.$executeRawUnsafe(`
            UPDATE "User"
            SET "phone" = 'FIXED_' || "id" || '_' || (random() * 1000)::int
            WHERE "phone" IS NULL OR "phone" = ''
        `);

        return NextResponse.json({
            success: true,
            fixedUsers
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
