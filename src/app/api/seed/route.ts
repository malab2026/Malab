import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const adminEmail = 'admin@malaeb.com';
        const adminPassword = await bcrypt.hash('admin123', 10);

        // Delete any existing admin with this email or phone to ensure clean state
        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: adminEmail },
                    { phone: '01000000000' }
                ]
            }
        });

        // Create Admin Fresh
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin User',
                password: adminPassword,
                role: 'admin',
                phone: '01000000000',
            },
        });

        // Seed initial fields if none exist
        const fieldsCount = await prisma.field.count();
        if (fieldsCount === 0) {
            const fields = [
                {
                    name: 'Old Trafford (5-a-side)',
                    pricePerHour: 200,
                    description: 'Professional grass turf, floodlights available.',
                    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop',
                },
                {
                    name: 'Camp Nou (7-a-side)',
                    pricePerHour: 300,
                    description: 'Wide pitch, excellent for larger teams.',
                    imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop',
                },
            ];

            for (const field of fields) {
                await prisma.field.create({ data: field });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Admin initialized (admin@malaeb.com / admin123) and fields checked."
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
