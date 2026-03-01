import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Updating GlobalSettings Phone Number...')
    const settings = await prisma.globalSettings.upsert({
        where: { id: 'global' },
        update: {
            adminPhone: '01020155988'
        },
        create: {
            id: 'global',
            adminPhone: '01020155988',
            serviceFee: 10.0,
            whatsappEnabled: true
        }
    })
    console.log('GlobalSettings updated:', settings)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
