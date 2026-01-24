import { Navbar } from "@/components/layout/navbar"
import { getFinancialReport } from "@/actions/admin-actions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SettlementManager } from "@/components/admin/settlement-manager"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function OwnerAccountsPage({
    searchParams
}: {
    searchParams: Promise<{ startDate?: string, endDate?: string, fieldId?: string }>
}) {
    const session = await auth()
    if (!session || session.user.role !== 'owner') {
        redirect("/login")
    }

    const params = await searchParams
    const report = await getFinancialReport(params)
    const fields = await prisma.field.findMany({
        where: { ownerId: session.user.id },
        select: { id: true, name: true }
    })

    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link href="/owner" className="text-sm text-blue-600 hover:underline mb-2 block bg-white/50 w-fit px-2 rounded font-bold">← Back to Dashboard</Link>
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-white/20 inline-block">
                            <h1 className="text-3xl font-bold text-gray-900">My Financial Report</h1>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-8 border-0 shadow-lg">
                    <CardHeader className="bg-white border-b rounded-t-xl">
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={params.startDate}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={params.endDate}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Field</label>
                                <select
                                    name="fieldId"
                                    defaultValue={params.fieldId}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background font-medium"
                                >
                                    <option value="">All My Fields</option>
                                    {fields.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 font-bold h-10 px-6">Apply Filters</Button>
                            <Button variant="outline" asChild className="bg-white h-10">
                                <Link href="/owner/accounts">Clear</Link>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="bg-white border-l-4 border-l-blue-500 shadow-xl border-0 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gross Revenue</div>
                            <div className="text-2xl font-black mt-1 text-gray-800">{report.totalGross.toFixed(2)} <span className="text-xs">EGP</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-red-500 shadow-xl border-0 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Refunds</div>
                            <div className="text-2xl font-black mt-1 text-red-600">-{report.totalRefunds.toFixed(2)} <span className="text-xs">EGP</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-green-600 shadow-xl border-0 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Profit</div>
                            <div className="text-2xl font-black text-green-600 mt-1">{report.totalNet.toFixed(2)} <span className="text-xs">EGP</span></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-purple-500 shadow-xl border-0 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bookings Count</div>
                            <div className="text-2xl font-black mt-1 text-gray-800">{report.totalBookings}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Individual Bookings Detail */}
                <div className="mb-10">
                    <SettlementManager bookings={report.bookings} isAdmin={false} />
                </div>

                {/* Table Breakdown */}
                <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl">
                    <CardHeader className="bg-white border-b">
                        <CardTitle className="font-bold text-gray-800">Performance Grouped by Field</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] font-black tracking-widest border-b">
                                    <tr>
                                        <th className="px-6 py-5">Field Name</th>
                                        <th className="px-6 py-5"># Bookings</th>
                                        <th className="px-6 py-5">Total Hours</th>
                                        <th className="px-6 py-5">Gross</th>
                                        <th className="px-6 py-5">Settled</th>
                                        <th className="px-6 py-5 text-right">Net Income</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {Object.values(report.fieldBreakdown).map((fb: any) => (
                                        <tr key={fb.name} className="bg-white hover:bg-green-50/30 transition-colors">
                                            <td className="px-6 py-5 font-bold text-gray-900">{fb.name}</td>
                                            <td className="px-6 py-5 font-medium text-gray-600">{fb.bookings}</td>
                                            <td className="px-6 py-5 font-medium text-gray-600">{fb.hours.toFixed(1)} hrs</td>
                                            <td className="px-6 py-5 font-medium text-gray-600">{fb.gross.toFixed(2)} EGP</td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-green-600 tracking-tighter uppercase whitespace-nowrap">Settled: {fb.settled.toFixed(2)} ج.م</span>
                                                    <span className="text-[10px] font-black text-gray-400 tracking-tighter uppercase whitespace-nowrap">Pending: {fb.pending.toFixed(2)} ج.م</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-green-700">{fb.net.toFixed(2)} EGP</td>
                                        </tr>
                                    ))}
                                    {Object.keys(report.fieldBreakdown).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-gray-400 italic">
                                                No financial activity recorded for the selected criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
