import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { SearchBar } from "@/components/fields/search-bar"

export const dynamic = 'force-dynamic'

import { FieldsListClient } from "@/components/fields/fields-list-client"

export default async function FieldsPage({
    searchParams,
}: {
    searchParams?: {
        q?: string
    }
}) {
    const query = searchParams?.q || ""
    const fields = await (prisma.field.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { address: { contains: query } }
            ]
        },
        select: {
            id: true,
            name: true,
            nameEn: true,
            description: true,
            descriptionEn: true,
            address: true,
            addressEn: true,
            pricePerHour: true,
        },
        orderBy: { createdAt: "desc" }
    }) as any)

    return (
        <main className="min-h-screen pb-10 flex flex-col">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-black mb-8">Available Fields</h1>

                <div className="mb-8">
                    <SearchBar />
                </div>

                <FieldsListClient fields={fields} />
            </div>
        </main>
    )
}
