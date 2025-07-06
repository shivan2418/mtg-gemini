import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/api/trpc';
import { env } from '@/env';
import {
  getFormatById,
  getAllActiveFormats,
  buildFormatWhereClause,
  formatToSummary,
  validateFormat,
  type QuizFormat,
} from '@/lib/quiz-formats';
import { getRandomOffset } from '@/lib/seeded-random';
import { serverCache } from '@/lib/server-cache';

export const quizRouter = createTRPCRouter({
  createQuiz: protectedProcedure
    .input(
      z
        .object({
          cardCount: z
            .number()
            .min(1)
            .max(50)
            .default(parseInt(env.NEXT_PUBLIC_QUIZ_CARD_COUNT)),
          formatId: z.string().optional(),
        })
        .optional()
        .default({}),
    )
    .mutation(async ({ ctx, input }) => {
      console.log('CreateQuiz - User ID:', ctx.session.user.id);
      console.log('CreateQuiz - Full session:', ctx.session);

      const cardCount =
        input?.cardCount ?? parseInt(env.NEXT_PUBLIC_QUIZ_CARD_COUNT);
      const formatId = input?.formatId;

      // Build where clause based on format with validation
      let whereClause = {};
      let selectedFormat: QuizFormat | null = null;

      if (formatId) {
        selectedFormat = getFormatById(formatId);

        if (!validateFormat(selectedFormat)) {
          throw new Error(
            `Quiz format '${formatId}' is not properly configured`,
          );
        }

        whereClause = buildFormatWhereClause(selectedFormat);
      }

      // Get total number of cards in the filtered pool
      const totalCards = await ctx.db.card.count({
        where: whereClause,
      });

      if (totalCards === 0) {
        throw new Error('No cards available in the specified format');
      }

      const actualCardCount = Math.min(cardCount, totalCards);

      // Generate a random seed for reproducible card selection
      const seed = Math.floor(Math.random() * 1000000);

      // Get random cards using seeded random for reproducible selection
      const randomOffset = getRandomOffset(seed, totalCards, actualCardCount);

      const randomCards = await ctx.db.card.findMany({
        where: whereClause,
        skip: randomOffset,
        take: actualCardCount,
        select: {
          id: true,
        },
      });

      // If we didn't get enough cards (edge case), get additional ones from the beginning
      if (randomCards.length < actualCardCount) {
        const additionalCards = await ctx.db.card.findMany({
          where: {
            ...whereClause,
            id: {
              notIn: randomCards.map((card) => card.id),
            },
          },
          take: actualCardCount - randomCards.length,
          select: {
            id: true,
          },
        });
        randomCards.push(...additionalCards);
      }

      // Create a new quiz for the current user
      const quiz = await ctx.db.quiz.create({
        data: {
          userId: ctx.session.user.id,
          formatId: formatId,
          seed: seed,
          cards: {
            connect: randomCards.map((card) => ({ id: card.id })),
          },
        },
        include: {
          cards: {
            select: {
              id: true,
              name: true,
              artOnlyUri: true,
            },
          },
        },
      });

      return quiz;
    }),

  getQuizById: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.db.quiz.findUnique({
        where: {
          id: input.quizId,
          userId: ctx.session.user.id, // Ensure user can only access their own quizzes
        },
        include: {
          cards: {
            select: {
              id: true,
              artOnlyUri: true,
            },
          },
          answers: true,
        },
      });

      return quiz;
    }),

  getCurrentQuiz: protectedProcedure.query(async ({ ctx }) => {
    const quiz = await ctx.db.quiz.findFirst({
      where: {
        userId: ctx.session.user.id,
        completedAt: null,
      },
      include: {
        cards: {
          select: {
            id: true,
            name: true,
            artOnlyUri: true,
          },
        },
        answers: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return quiz;
  }),

  submitAnswer: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        cardId: z.string(),
        userAnswer: z.string(),
        timeSpent: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the correct card name
      const card = await ctx.db.card.findUnique({
        where: { id: input.cardId },
        select: { name: true },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      // Check if the answer is correct (case-insensitive)
      const isCorrect =
        card.name.toLowerCase() === input.userAnswer.toLowerCase();

      // Save the answer
      const answer = await ctx.db.quizAnswer.create({
        data: {
          quizId: input.quizId,
          cardId: input.cardId,
          userAnswer: input.userAnswer,
          isCorrect,
          timeSpent: input.timeSpent,
        },
      });

      return {
        isCorrect,
        correctAnswer: card.name,
        answer,
      };
    }),

  completeQuiz: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.db.quiz.update({
        where: { id: input.quizId },
        data: { completedAt: new Date() },
        include: {
          answers: true,
          cards: true,
        },
      });

      const score = quiz.answers.filter((answer) => answer.isCorrect).length;
      const totalQuestions = quiz.cards.length;

      return {
        quiz,
        score,
        totalQuestions,
      };
    }),

  getQuizResults: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.db.quiz.findUnique({
        where: {
          id: input.quizId,
          userId: ctx.session.user.id, // Ensure user can only access their own quizzes
          completedAt: { not: null }, // Only allow access to completed quizzes
        },
        include: {
          cards: {
            select: {
              id: true,
              name: true,
              artOnlyUri: true,
            },
          },
          answers: {
            include: {
              card: {
                select: {
                  id: true,
                  name: true,
                  artOnlyUri: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!quiz) {
        throw new Error('Quiz not found or not completed');
      }

      // Calculate the score
      const score = quiz.answers.filter((answer) => answer.isCorrect).length;
      const totalQuestions = quiz.cards.length;

      return {
        quiz,
        score,
        totalQuestions,
      };
    }),

  getCardCountForFormat: publicProcedure
    .input(
      z.object({
        formatId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cacheKey = `card-count-${input.formatId}`;

      // Try to get from cache first
      const cached = serverCache.get<{ count: number; format: unknown }>(
        cacheKey,
      );
      if (cached) {
        return cached;
      }

      const format = getFormatById(input.formatId);

      if (!validateFormat(format)) {
        throw new Error(
          `Quiz format '${input.formatId}' is not properly configured`,
        );
      }

      const whereClause = buildFormatWhereClause(format);

      const count = await ctx.db.card.count({
        where: whereClause,
      });

      const result = {
        count,
        format: formatToSummary(format),
      };

      // Cache for 5 minutes
      serverCache.set(cacheKey, result, 5 * 60 * 1000);

      return result;
    }),

  getAllQuizFormats: publicProcedure.query(() => {
    return getAllActiveFormats().map(formatToSummary);
  }),

  getAllQuizFormatsWithCounts: publicProcedure.query(async ({ ctx }) => {
    const cacheKey = 'all-quiz-formats-with-counts';

    // Try to get from cache first
    const cached = serverCache.get<
      Array<{
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        cardCount: number;
      }>
    >(cacheKey);
    if (cached) {
      return cached;
    }

    const formats = getAllActiveFormats();

    // Get card counts for all formats in parallel
    const formatsWithCounts = await Promise.all(
      formats.map(async (format) => {
        if (!validateFormat(format)) {
          return { ...formatToSummary(format), cardCount: 0 };
        }

        const whereClause = buildFormatWhereClause(format);
        const count = await ctx.db.card.count({ where: whereClause });

        return { ...formatToSummary(format), cardCount: count };
      }),
    );

    // Cache for 5 minutes
    serverCache.set(cacheKey, formatsWithCounts, 5 * 60 * 1000);

    return formatsWithCounts;
  }),

  searchCards: publicProcedure
    .input(
      z.object({
        query: z.string().min(2).max(100),
        limit: z.number().min(1).max(50).default(20),
        threshold: z.number().min(0).max(1).default(0.3),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Use dynamic threshold based on query length
      // Shorter queries need lower thresholds to return results
      const dynamicThreshold =
        input.query.length <= 2
          ? 0.1
          : input.query.length <= 3
            ? 0.2
            : input.threshold;

      // Use PostgreSQL's trigram similarity for fuzzy matching
      // This provides much better fuzzy search than simple contains
      const cards = await ctx.db.$queryRaw<
        Array<{ name: string; similarity: number }>
      >`
        SELECT name, MAX(similarity(name, ${input.query})) as similarity
        FROM "Card"
        WHERE similarity(name, ${input.query}) > ${dynamicThreshold}
        GROUP BY name
        ORDER BY MAX(similarity(name, ${input.query})) DESC, length(name) ASC
        LIMIT ${input.limit}
      `;

      return cards.map((card) => ({
        value: card.name,
        label: card.name,
      }));
    }),
});
