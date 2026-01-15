import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { HomeClient } from "@/components/home/home-client"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  const userId = session?.user?.id

  // Fetch all fields
  const allFields = await prisma.field.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      description: true,
      descriptionEn: true,
      address: true,
      area: true,
      lat: true,
      lng: true,
      pricePerHour: true,
    },
  } as any)

  // Fetch user's bookings to determine sorting and previous bookings
  const userBookings = userId ? await prisma.booking.findMany({
    where: { userId },
    include: {
      field: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }) : []

  // Get unique field IDs user has booked before
  const bookedFieldIds = Array.from(new Set(userBookings.map(b => b.field.id)))

  // Sort fields: Previously booked first, then by name
  const sortedFields = [...allFields].sort((a, b) => {
    const aBooked = bookedFieldIds.includes(a.id)
    const bBooked = bookedFieldIds.includes(b.id)

    if (aBooked && !bBooked) return -1
    if (!aBooked && bBooked) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />
      <HomeClient
        session={session}
        sortedFields={sortedFields}
        bookedFieldIds={bookedFieldIds}
      />
    </main>
  )
}
