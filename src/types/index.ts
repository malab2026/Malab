import { Booking as PrismaBooking, Field as PrismaField, User as PrismaUser } from "@prisma/client"

export type BookingWithDetails = PrismaBooking & {
    field: Pick<PrismaField, 'id' | 'name' | 'pricePerHour'>
    user: Pick<PrismaUser, 'id' | 'name' | 'email' | 'phone'>
}

export type FieldWithDetails = PrismaField & {
    owner?: PrismaUser | null
}
