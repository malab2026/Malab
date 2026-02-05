const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } });
    console.log('Global Settings:', JSON.stringify(settings, null, 2));

    const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, name: true }
    });
    console.log('Admin Emails:', JSON.stringify(admins, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
