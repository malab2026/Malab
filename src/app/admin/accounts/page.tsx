import { Navbar } from "@/components/layout/navbar"
import { getFinancialReport } from "@/actions/admin-actions"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function AdminAccountsPage({
    searchParams
}: {
    searchParams: Promise<{ startDate?: string, endDate?: string, fieldId?: string }>
}) {
    const params = await searchParams
    const report = await getFinancialReport(params)
    const fields = await prisma.field.findMany({
        select: { id: true, name: true }
    })

    return (
        <main className="min-h-screen pb-10 bg-gray-50">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <Link href="/admin" className="text-sm text-blue-600 hover:underline mb-2 block">← Back to Admin</Link>
                        <h1 className="text-3xl font-bold">Financial Accounts</h1>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    defaultValue={params.startDate}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    defaultValue={params.endDate}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500">Field</label>
                                <select
                                    name="fieldId"
                                    defaultValue={params.fieldId}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                >
                                    <option value="">All Fields</option>
                                    {fields.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="submit">Apply Filters</Button>
                            <Button variant="outline" asChild>
                                <Link href="/admin/accounts">Clear</Link>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Gross Income</div>
                            <div className="text-2xl font-bold mt-1">{report.totalGross.toFixed(2)} EGP</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Refunds</div>
                            <div className="text-2xl font-bold mt-1">-{report.totalRefunds.toFixed(2)} EGP</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-green-600 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Net Income</div>
                            <div className="text-2xl font-bold text-green-600 mt-1">{report.totalNet.toFixed(2)} EGP</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Bookings</div>
                            <div className="text-2xl font-bold mt-1">{report.totalBookings}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Field Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                                    <tr>
                                        <th className="px-6 py-4">Field Name</th>
                                        <th className="px-6 py-4">Bookings</th>
                                        <th className="px-6 py-4">Total Hours</th>
                                        <th className="px-6 py-4">Gross Income</th>
                                        <th className="px-6 py-4">Refunds</th>
                                        <th className="px-6 py-4 text-right">Net Income</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {Object.values(report.fieldBreakdown).map((fb: any) => (
                                        <tr key={fb.name} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold">{fb.name}</td>
                                            <td className="px-6 py-4">{fb.bookings}</td>
                                            <td className="px-6 py-4">{fb.hours.toFixed(1)} hrs</td>
                                            <td className="px-6 py-4">{fb.gross.toFixed(2)} EGP</td>
                                            <td className="px-6 py-4 text-red-500">-{fb.refunds.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-700">{fb.net.toFixed(2)} EGP</td>
                                        </tr>
                                    ))}
                                    {Object.keys(report.fieldBreakdown).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                                                No financial data found for the selected filters.
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
