const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { id: true, email: true, name: true, role: true }
    });
    console.log('Admin Users Found:', JSON.stringify(admins, null, 2));

    const allRoles = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
    });
    console.log('Role Distribution:', JSON.stringify(allRoles, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
