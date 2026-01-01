import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { SearchBar } from "@/components/fields/search-bar"

export const dynamic = 'force-dynamic'

export default async function FieldsPage({
    searchParams,
}: {
    searchParams?: {
        q?: string
    }
}) {
    const query = searchParams?.q || ""
    const fields = await prisma.field.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { address: { contains: query } }
            ]
        },
        orderBy: { createdAt: "desc" }
    })

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-8">Available Fields</h1>

                <SearchBar />

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {fields.map((field: any) => (
                        <Card key={field.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="relative h-48 w-full">
                                <Image
                                    src={field.imageUrl || '/placeholder.jpg'}
                                    alt={field.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <CardHeader>
                                <CardTitle>{field.name}</CardTitle>
                                <CardDescription>{field.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="font-semibold text-lg text-green-600">
                                    {field.pricePerHour} EGP <span className="text-sm font-normal text-gray-500">/ hour</span>
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Link href={`/fields/${field.id}`} className="w-full">
                                    <Button className="w-full">Book Now</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-gray-500">No fields available at the moment.</p>
                    )}
                </div>
            </div>
        </main>
    )
}
