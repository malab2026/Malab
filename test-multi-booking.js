const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testMultiBooking() {
    const userId = "cmjvhc3j10000vaicbutus02u" // 'test' user id from debug-bookings
    const fieldId = "cmjvhd90d0002vaicr2ppf6kv" // 'test1' field id

    const slots = [
        { date: '2026-01-10', startTime: '10:00', duration: 1 },
        { date: '2026-01-11', startTime: '14:00', duration: 2 }
    ]

    console.log('Starting Test Transaction...')

    try {
        const bookingData = slots.map(slot => {
            const startDateTime = new Date(`${slot.date}T${slot.startTime}:00`)
            const endDateTime = new Date(startDateTime.getTime() + slot.duration * 60 * 60 * 1000)
            return {
                userId,
                fieldId,
                startTime: startDateTime,
                endTime: endDateTime,
                status: 'CONFIRMED',
                receiptUrl: null
            }
        })

        await prisma.$transaction(async (tx) => {
            for (const data of bookingData) {
                await tx.booking.create({ data })
            }
        })

        console.log('SUCCESS: Bookings created.')
    } catch (e) {
        console.error('FAILURE:', e)
    } finally {
        await prisma.$disconnect()
    }
}

testMultiBooking()
