import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const quizRouter = createTRPCRouter({
  createQuiz: protectedProcedure
    .input(
      z
        .object({
          cardCount: z.number().min(1).max(50).default(20),
        })
        .optional()
        .default({}),
    )
    .mutation(async ({ ctx, input }) => {
      const cardCount = input?.cardCount ?? 20;

      // Get total number of cards to ensure we don't request more than available
      const totalCards = await ctx.db.card.count();

      if (totalCards === 0) {
        throw new Error('No cards available in the database');
      }

      const actualCardCount = Math.min(cardCount, totalCards);

      // Get random cards using Prisma's skip and take with random offset
      const randomOffset = Math.floor(
        Math.random() * Math.max(0, totalCards - actualCardCount),
      );

      const randomCards = await ctx.db.card.findMany({
        skip: randomOffset,
        take: actualCardCount,
        select: {
          id: true,
        },
      });

      // If we didn't get enough cards (edge case), get additional ones from the beginning
      if (randomCards.length < actualCardCount) {
        const additionalCards = await ctx.db.card.findMany({
          take: actualCardCount - randomCards.length,
          select: {
            id: true,
          },
          where: {
            id: {
              notIn: randomCards.map((card) => card.id),
            },
          },
        });
        randomCards.push(...additionalCards);
      }

      // Create a new quiz for the current user
      const quiz = await ctx.db.quiz.create({
        data: {
          userId: ctx.session.user.id,
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
              name: true,
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
});
