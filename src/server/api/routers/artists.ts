import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const artistsRouter = createTRPCRouter({
  getArtists: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;

      // Get unique artists with their card counts and oldest card dates
      const offset = cursor ?? 0;

      // First get all artists with their data
      const artistsWithData = await ctx.db.card.groupBy({
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

      let nextCursor: typeof cursor | undefined = undefined;
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

      return {
        artists: filteredArtists,
        nextCursor,
      };
    }),

  getArtistCards: protectedProcedure
    .input(
      z.object({
        artistName: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { artistName, limit, cursor } = input;

      const cards = await ctx.db.card.findMany({
        where: {
          artist: artistName,
        },
        orderBy: {
          releasedAt: 'asc',
        },
        take: limit + 1,
        skip: cursor ?? 0,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (cards.length > limit) {
        cards.pop();
        nextCursor = (cursor ?? 0) + limit;
      }

      return {
        cards,
        nextCursor,
      };
    }),
});
