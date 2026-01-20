import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Navbar } from "@/components/layout/navbar"
import { HomeClient } from "@/components/home/home-client"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  const userId = session?.user?.id

  // Fetch all clubs with their fields count
  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
      nameEn: true,
      logoUrl: true,
      address: true,
      addressEn: true,
      description: true,
      descriptionEn: true,
      _count: {
        select: { fields: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch user's bookings to determine sorting
  const userBookings = userId ? await prisma.booking.findMany({
    where: { userId },
    include: {
      field: {
        select: { id: true, clubId: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }) : []

  // Get unique club IDs user has booked before
  const bookedClubIds = Array.from(new Set(
    userBookings
      .filter(b => b.field.clubId)
      .map(b => b.field.clubId as string)
  ))

  // Sort clubs: Previously booked first, then by name
  const sortedClubs = [...clubs].sort((a, b) => {
    const aBooked = bookedClubIds.includes(a.id)
    const bBooked = bookedClubIds.includes(b.id)

    if (aBooked && !bBooked) return -1
    if (!aBooked && bBooked) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />
      <HomeClient
        session={session}
        clubs={sortedClubs}
        bookedClubIds={bookedClubIds}
      />
    </main>
  )
}
