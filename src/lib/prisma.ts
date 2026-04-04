import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    // For serverless (Vercel), use connection_limit=1 to avoid exhausting DB connections.
    // pgbouncer=true is required for Prisma Postgres (db.prisma.io) with PgBouncer.
    const baseUrl = process.env.DATABASE_URL
    const separator = baseUrl.includes('?') ? '&' : '?'
    const url = `${baseUrl}${separator}connection_limit=1&pool_timeout=20&pgbouncer=true`

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: { db: { url } }
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
