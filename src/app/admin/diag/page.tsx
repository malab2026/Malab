import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export default async function DiagPage() {
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
        return <div>Unauthorized</div>
    }

    try {
        const columns: any = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Booking'
        `

        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold mb-4">Database Diagnosis</h1>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(columns, null, 2)}
                </pre>
            </div>
        )
    } catch (e: any) {
        return (
            <div className="p-10 text-red-600">
                <h1 className="text-2xl font-bold mb-4">Diagnosis Failed</h1>
                <pre>{e.message}</pre>
            </div>
        )
    }
}
