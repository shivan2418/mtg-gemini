import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { Card } from '@prisma/client';

const db = new PrismaClient();

interface Artist {
  name: string;
  oldestCardDate: Date;
  cardCount: number;
}

interface ArtistWithCards extends Artist {
  cards: Card[];
}

async function getAllArtists(): Promise<Artist[]> {
  const allArtists: Artist[] = [];
  let cursor: number | undefined = undefined;
  const limit = 50; // Maximum allowed by the procedure

  console.log('Fetching all artists...');

  while (true) {
    console.log(`Fetching batch with cursor: ${cursor ?? 0}`);
    
    // Get unique artists with their card counts and oldest card dates
    const offset: number = cursor ?? 0;

    const artistsWithData = await db.card.groupBy({
      by: ['artist'],
      where: {
        artist: {
          not: '',
        },
      },
      _count: {
        artist: true,
      },
      _min: {
        releasedAt: true,
      },
      orderBy: {
        _min: {
          releasedAt: 'asc',
        },
      },
      take: limit + 1,
      skip: offset,
    });

    let nextCursor: number | undefined = undefined;
    if (artistsWithData.length > limit) {
      artistsWithData.pop();
      nextCursor = offset + limit;
    }

    const filteredArtists = artistsWithData
      .filter(
        (artist) =>
          artist.artist &&
          artist.artist.trim() !== '' &&
          artist._min.releasedAt,
      )
      .map((artist) => ({
        name: artist.artist.trim(),
        oldestCardDate: artist._min.releasedAt!,
        cardCount: artist._count.artist,
      }));

    allArtists.push(...filteredArtists);
    console.log(`Fetched ${filteredArtists.length} artists (total: ${allArtists.length})`);

    if (!nextCursor) {
      break;
    }

    cursor = nextCursor;
  }

  return allArtists;
}

async function getArtistCards(artistName: string) {
  const cards = await db.card.findMany({
    where: {
      artist: artistName,
    },
    orderBy: {
      releasedAt: 'asc',
    },
  });

  return cards;
}

async function exportArtistsWithCards() {
  try {
    console.log('Starting export...');
    
    // Get all artists
    const artists = await getAllArtists();
    console.log(`Found ${artists.length} unique artists`);

    // Get cards for each artist
    const artistsWithCards: ArtistWithCards[] = [];
    
    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      if (!artist) continue;
      
      console.log(`Fetching cards for artist ${i + 1}/${artists.length}: ${artist.name}`);
      
      const cards = await getArtistCards(artist.name);
      
      artistsWithCards.push({
        ...artist,
        cards,
      });
    }

    // Save to JSON file
    const outputPath = join(process.cwd(), 'data', 'artists-with-cards.json');
    const jsonData = JSON.stringify(artistsWithCards, null, 2);
    
    writeFileSync(outputPath, jsonData, 'utf8');
    
    console.log(`Export completed! Data saved to: ${outputPath}`);
    console.log(`Total artists: ${artistsWithCards.length}`);
    console.log(`Total cards: ${artistsWithCards.reduce((sum, artist) => sum + artist.cards.length, 0)}`);
    
  } catch (error) {
    console.error('Error during export:', error);
  } finally {
    await db.$disconnect();
  }
}

// Run the export
exportArtistsWithCards();