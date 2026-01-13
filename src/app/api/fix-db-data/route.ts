import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Fix NULL/Duplicate empty phone numbers in User table
        const users = await prisma.user.findMany({
            where: {
                OR: [{ phone: null }, { phone: "" }]
            }
        });

        let fixedUsers = 0;
        for (const user of users) {
            const dummyPhone = "FIXED_" + user.id.slice(-6) + "_" + Math.floor(Math.random() * 1000);
            await prisma.user.update({
                where: { id: user.id },
                data: { phone: dummyPhone }
            });
            fixedUsers++;
        }

        // 2. Initialize totalPrice for existing bookings if missing
        // We'll calculate it based on field pricePerHour if available
        const bookings = await prisma.booking.findMany({
            where: {
                OR: [{ totalPrice: null }, { totalPrice: 0 }]
            },
            include: { field: true }
        });

        let fixedBookings = 0;
        for (const booking of bookings) {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            const price = booking.field.pricePerHour * duration;
            const fee = booking.serviceFee || 10.0;

            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    serviceFee: fee,
                    totalPrice: price + fee
                }
            });
            fixedBookings++;
        }

        return NextResponse.json({
            success: true,
            results: {
                fixedUsers,
                fixedBookings
            }
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
