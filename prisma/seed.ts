import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@malaeb.com'
    const adminPassword = await bcrypt.hash('admin123', 10)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            phone: '01000000000',
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
            phone: '01000000000',
        },
    })

    console.log({ admin })

    // Create Fields
    const fields = [
        {
            name: 'Old Trafford (5-a-side)',
            pricePerHour: 200,
            description: 'Professional grass turf, floodlights available.',
            imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop',
        },
        {
            name: 'Camp Nou (7-a-side)',
            pricePerHour: 300,
            description: 'Wide pitch, excellent for larger teams.',
            imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop',
        },
        {
            name: 'Anfield (5-a-side)',
            pricePerHour: 180,
            description: 'Cozy pitch, great atmosphere.',
            imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=2076&auto=format&fit=crop',
        },
    ]

    for (const field of fields) {
        const createdField = await prisma.field.create({
            data: field,
        })
        console.log(`Created field with id: ${createdField.id}`)
    }
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
