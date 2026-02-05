const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const apiKey = 're_Vcv7e6xE_2ZT4iZ59u3PPV2kox5ZZDF9u';

    // Update the global settings
    const updated = await prisma.globalSettings.update({
        where: { id: 'global' },
        data: {
            emailApiKey: apiKey,
            emailEnabled: true,
            // Also setting From address to the test one since they likely don't have a domain verified
            emailFromAddress: 'onboarding@resend.dev'
        }
    });

    console.log('SUCCESS: Settings updated with new API key and test From address.');
    console.log('Updated Settings:', JSON.stringify(updated, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
