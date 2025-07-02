//eslint-disable
/* eslint-disable */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import _ from 'lodash';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const filePath = join(
      __dirname,
      '../data/unique-artwork-20250628090446.json',
    );
    const rawData = readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);
    console.log('Data loaded successfully:', data.length, 'items');

    // Filter data based on promo and layout
    const filteredData = data.filter(
      (card: any) =>
        !card.promo && card.layout === 'normal' && !!card?.image_uris?.art_crop,
    );
    console.log(
      'Filtered data:',
      filteredData.length,
      'items after excluding promo and non-normal layout',
    );

    // Map data to Card model
    const mappedData = filteredData.map((card: any) => {
      // Validate required fields
      return {
        scryfallId: card.id,
        oracleId: card.oracle_id,
        name: card.name,
        releasedAt: new Date(card.released_at),
        uri: card.uri,
        scryfallUri: card.scryfall_uri,
        highresImage: card.highres_image || false,
        imageStatus: card.image_status,
        artOnlyUri: card.image_uris.art_crop,
        fullCardUri: card.image_uris.border_crop,
        colors: card.colors,
        setId: card.set_id || card.set,
        set: card.set,
        setName: card.set_name,
        setType: card.set_type,
        setUri: card.set_uri,
        setSearchUri: card.set_search_uri,
        artist: card.artist,
        artistIds: card.artist_ids,
        borderColor: card.border_color,
        frame: card.frame,
        fullArt: card.full_art || false,
      } as const;
    }) as any as Array<any>;

    console.log('Data mapped to Card model format');

    const chunks = _.chunk(mappedData, Math.round(mappedData.length / 10));

    // Seed data to database using createMany in chunks with progress bar
    console.log('Starting database seeding with createMany in chunks...');
    const totalChunks = chunks.length;
    let processedChunks = 0;
    const barLength = 50;

    const updateProgressBar = () => {
      processedChunks++;
      const percentage = Math.floor((processedChunks / totalChunks) * 100);
      const filled = Math.floor((barLength * processedChunks) / totalChunks);
      const empty = barLength - filled;
      process.stdout.write(
        `\rProgress: [${'#'.repeat(filled)}${' '.repeat(empty)}] ${percentage}% (${processedChunks}/${totalChunks} chunks)`,
      );
    };

    for (const chunk of chunks) {
      await prisma.card.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      updateProgressBar();
    }
    process.stdout.write('\n'); // New line after progress bar completes
    console.log(
      'Database seeding completed successfully with createMany in chunks',
    );
  } catch (error) {
    console.error('Error loading or seeding data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
