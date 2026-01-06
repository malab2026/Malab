import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const session = await auth();
        return NextResponse.json({
            status: "success",
            session
        });
    } catch (e: any) {
        return NextResponse.json({ status: "error", error: e.message });
    }
}
