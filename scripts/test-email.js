const { PrismaClient } = require('@prisma/client');
const { Resend } = require('resend');
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } });
    if (!settings || !settings.emailEnabled) {
        console.log('Emails not enabled in settings');
        return;
    }

    console.log('Using Settings:', {
        from: settings.emailFromAddress,
        apiKey: settings.emailApiKey?.substring(0, 3) + '...',
        fromDomain: settings.emailFromAddress?.split('@')[1]
    });

    const resend = new Resend(settings.emailApiKey);

    // Attempting a test send to an admin
    const testAdmin = 'ahmedkhaled175159@gmail.com';
    console.log(`Attempting test send to ${testAdmin}...`);

    const { data, error } = await resend.emails.send({
        from: settings.emailFromAddress,
        to: [testAdmin],
        subject: 'TEST EMAIL FROM SYSTEM',
        html: '<p>Testing system email connectivity.</p>'
    });

    if (error) {
        console.error('RESEND ERROR:', error);
    } else {
        console.log('RESEND SUCCESS:', data);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
