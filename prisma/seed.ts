import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@malaeb.com'
    const adminPassword = await bcrypt.hash('admin123', 10)

    // Create Admins
    const admins = [
        {
            email: 'admin@malaeb.com',
            name: 'Main Admin',
            password: adminPassword,
            role: 'admin',
            phone: '01020155988',
        },
        {
            email: 'useradmin@malaeb.com',
            name: 'User Admin',
            password: adminPassword,
            role: 'admin',
            phone: '01020155988',
        }
    ]

    for (const adminData of admins) {
        const admin = await prisma.user.upsert({
            where: { phone: adminData.phone },
            update: {
                email: adminData.email,
                name: adminData.name,
                password: adminData.password,
            },
            create: adminData,
        })
        console.log(`Created/Updated admin: ${admin.phone}`)
    }

    // Create Fields
    const fields = [
        {
            name: 'Old Trafford (5-a-side)',
            pricePerHour: 200,
            description: 'Professional grass turf, floodlights available.',
            imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format&fit=crop',
            area: 'Cairo',
            lat: 30.0444,
            lng: 31.2357,
            address: 'Cairo, Egypt'
        },
        {
            name: 'Camp Nou (7-a-side)',
            pricePerHour: 300,
            description: 'Wide pitch, excellent for larger teams.',
            imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop',
            area: 'Giza',
            lat: 30.0131,
            lng: 31.2089,
            address: 'Giza, Egypt'
        },
        {
            name: 'Anfield (5-a-side)',
            pricePerHour: 180,
            description: 'Cozy pitch, great atmosphere.',
            imageUrl: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?q=80&w=2076&auto=format&fit=crop',
            area: 'Cairo',
            lat: 30.0626,
            lng: 31.2497,
            address: 'Nasr City, Cairo'
        },
        {
            name: 'Benha Stadium',
            pricePerHour: 150,
            description: 'Very good pitch in the heart of Benha.',
            imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=2070&auto=format&fit=crop',
            area: 'Benha',
            lat: 30.4591,
            lng: 31.1856,
            address: 'Benha, Qalyubia'
        },
    ]

    for (const field of fields) {
        const createdField = await prisma.field.upsert({
            where: { name: field.name },
            update: {
                pricePerHour: field.pricePerHour,
                description: field.description,
                area: field.area,
                lat: field.lat,
                lng: field.lng,
                address: field.address,
            },
            create: field,
        } as any)
        console.log(`Synced field: ${createdField.name}`)
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
