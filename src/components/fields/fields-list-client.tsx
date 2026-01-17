'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslation } from "@/components/providers/locale-context"

export function FieldsListClient({ fields }: { fields: any[] }) {
    const { t, isRtl } = useTranslation()

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field: any) => (
                <Card key={field.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                    <div className="relative h-48 w-full bg-gray-200">
                        <Image
                            src={`/api/field-image/${field.id}`}
                            alt={field.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle>
                            {isRtl ? field.name : (field.nameEn || field.name)}
                        </CardTitle>
                        <CardDescription>
                            {isRtl ? field.description : (field.descriptionEn || field.description)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="font-semibold text-lg text-green-600">
                            {field.pricePerHour} {t('egp')} <span className="text-sm font-normal text-gray-400">/ {t('hour')}</span>
                        </p>
                        {(field.address || field.addressEn) && (
                            <p className="text-sm text-gray-500 mt-2">
                                📍 {isRtl ? field.address : (field.addressEn || field.address)}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Link href={`/fields/${field.id}`} className="w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700 font-bold">
                                {t('bookNow')}
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            ))}

            {fields.length === 0 && (
                <p className="text-gray-500">{t('noFieldsFound')}</p>
            )}
        </div>
    )
}
