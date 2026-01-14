import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking/booking-form"
import { getFieldBookings } from "@/actions/booking-actions"
import { format, addDays } from "date-fns"

import { FieldDetailsClient } from "@/components/fields/field-details-client"

export default async function FieldDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    const { id } = await params;

    if (!session) {
        redirect(`/login?callbackUrl=/fields/${id}`)
    }
    const field = await prisma.field.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            pricePerHour: true,
            address: true,
            locationUrl: true,
            description: true,
            cancellationPolicy: true,
            ownerId: true,
        }
    })

    if (!field) {
        notFound()
    }

    // Fetch existing bookings for the next 7 days
    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 7), 'yyyy-MM-dd')
    const bookingsResult = await getFieldBookings(field.id, startDate, endDate)
    const initialBookings = bookingsResult.success ? bookingsResult.bookings : []

    // Fetch dynamic service fee
    const settings = await prisma.globalSettings.upsert({
        where: { id: 'global' },
        update: {},
        create: { id: 'global', serviceFee: 10.0 }
    })
    const serviceFee = settings.serviceFee

    return (
        <FieldDetailsClient
            field={field}
            initialBookings={initialBookings}
            serviceFee={serviceFee}
            userRole={session.user.role}
        />
    )
}
