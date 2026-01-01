const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const bookings = await prisma.booking.findMany({
        include: { field: true, user: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    })

    console.log('Recent 10 Bookings:')
    bookings.forEach(b => {
        console.log(`- ID: ${b.id}, User: ${b.user.name}, Field: ${b.field.name}, Start: ${b.startTime}, Status: ${b.status}, CreatedAt: ${b.createdAt}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
