import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const session = await auth()
  const userId = session?.user?.id

  // Fetch all fields
  const allFields = await prisma.field.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      pricePerHour: true,
    },
  })

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
  const bookedFieldIds = new Set(userBookings.map(b => b.field.id))

  // Sort fields: Previously booked first, then by name
  const sortedFields = [...allFields].sort((a, b) => {
    const aBooked = bookedFieldIds.has(a.id)
    const bBooked = bookedFieldIds.has(b.id)

    if (aBooked && !bBooked) return -1
    if (!aBooked && bBooked) return 1
    return a.name.localeCompare(b.name)
  })

  return (
    <main className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />

      {/* Hero Section - More Compact */}
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop"
            alt="Football Field"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-20 space-y-4 max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            Malaeb <span className="text-green-500">Booking</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-medium">
            Find the best pitches and book your game in seconds.
          </p>
          {!session && (
            <div className="flex gap-4 justify-center pt-6">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8 py-6 bg-green-500 hover:bg-green-600 font-bold border-0 shadow-xl">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto -mt-20 relative z-30 px-4 space-y-12 pb-20">

        {/* My Bookings Section (Only if logged in) */}
        {session && userBookings.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="h-8 w-2 bg-green-500 rounded-full"></span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">الحجوزات المسبقة</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBookings.slice(0, 3).map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                  <div className="relative h-32 w-full">
                    <Image
                      src={`/api/field-image/${booking.field.id}`}
                      alt={booking.field.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                  <CardContent className="p-4 bg-white">
                    <h3 className="font-bold text-lg">{booking.field.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 bg-white">
                    <Button variant="ghost" className="w-full text-green-600 font-bold hover:text-green-700 hover:bg-green-50 p-0 h-auto" asChild>
                      <Link href="/dashboard">View All Bookings →</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Fields Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="h-8 w-2 bg-green-500 rounded-full"></span>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">الملاعب المتاحة</h2>
            </div>
            <Link href="/fields" className="text-sm font-bold text-green-600 hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedFields.map((field: any) => (
              <Card key={field.id} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl">
                <div className="relative h-64 w-full">
                  <Image
                    src={`/api/field-image/${field.id}`}
                    alt={field.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {bookedFieldIds.has(field.id) && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500/90 text-white border-0 font-bold backdrop-blur-md">
                        Booked Before
                      </Badge>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-black text-white">{field.name}</h3>
                    <p className="text-gray-300 text-sm font-medium line-clamp-1 mt-1">{field.address}</p>
                  </div>
                </div>
                <CardContent className="p-6 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-3xl font-black text-green-600">{field.pricePerHour} EGP</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Per Hour</p>
                    </div>
                    <Link href={`/fields/${field.id}`}>
                      <Button className="rounded-2xl px-6 py-6 bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-200 transition-all active:scale-95">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-yellow-500 text-white",
    CONFIRMED: "bg-green-600 text-white",
    REJECTED: "bg-red-500 text-white",
  }
  return (
    <Badge className={`${styles[status as keyof typeof styles] || ""} border-0 font-bold px-2 py-0.5 text-[10px]`}>
      {status}
    </Badge>
  )
}
