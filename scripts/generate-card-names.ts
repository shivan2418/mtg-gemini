import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function generateCardNames() {
  try {
    console.log('Fetching unique card names from database...');

    // Get all unique card names from the database
    const cards = await prisma.card.findMany({
      select: {
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });

    const cardNames = cards.map((card) => card.name);

    console.log(`Found ${cardNames.length} unique card names`);

    // Save to JSON file in public directory so it can be accessed by the client
    const outputPath = join(process.cwd(), 'public', 'card-names.json');
    writeFileSync(outputPath, JSON.stringify(cardNames, null, 2));

    console.log(`Card names saved to ${outputPath}`);
  } catch (error) {
    console.error('Error generating card names:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generateCardNames();
