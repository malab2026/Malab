import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check if GlobalSettings table exists
        const settingsCount = await prisma.globalSettings.count().catch(() => -1);

        // Check if Booking has the new fields by trying a simple query
        const bookingFields = await prisma.booking.findFirst({
            select: { serviceFee: true, totalPrice: true }
        }).catch((e) => ({ error: e.message }));

        return NextResponse.json({
            success: true,
            checks: {
                globalSettingsTable: settingsCount !== -1 ? 'OK' : 'MISSING',
                bookingNewFields: !(bookingFields as any).error ? 'OK' : 'MISSING/ERROR',
                errorDetail: (bookingFields as any).error || null
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
