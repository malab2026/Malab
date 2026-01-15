import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { phone: '01000000000' }
    })

    if (!user) {
        console.log('User not found')
        return
    }

    console.log('User found. Hashed password:', user.password)

    const match = await bcrypt.compare('admin123', user.password)
    console.log('Match result for "admin123":', match)
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
