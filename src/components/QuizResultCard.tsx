'use client';

import Image from 'next/image';
import classNames from 'classnames';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

// Infer the output type of the entire router
type RouterOutput = inferRouterOutputs<AppRouter>;

// Infer the output type of the getQuizResults query
type QuizResultsOutput = RouterOutput['quiz']['getQuizResults'];

// Define the Answer type for individual answers
type Answer = QuizResultsOutput['quiz']['answers'][number];

interface QuizResultCardProps {
  answer: Answer;
  show: boolean;
  shrink: boolean;
}

export const QuizResultCard = ({
  answer,
  show,
  shrink,
}: QuizResultCardProps) => {
  if (!show) {
    return (
      <div className="translate-y-4 opacity-0 transition-all duration-500" />
    );
  }

  if (shrink) {
    return (
      <div className="bg-mtg-dark border-mtg-gold translate-y-0 rounded-lg border-2 p-3 opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between">
          <h3
            className={classNames('text-lg font-bold', {
              'text-green-400': answer.isCorrect,
              'text-red-400': !answer.isCorrect,
            })}
          >
            {answer.card.name}
          </h3>
          <div
            className={classNames('text-xl font-bold', {
              'text-green-400': answer.isCorrect,
              'text-red-400': !answer.isCorrect,
            })}
          >
            {answer.isCorrect ? '✓' : '✗'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mtg-dark border-mtg-gold translate-y-0 rounded-lg border-2 p-6 opacity-100 transition-all duration-500">
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
        {/* Card Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={answer.card.fullCardUri}
            alt="Magic card"
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Answer Comparison */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-mtg-white text-xl font-bold">
              {answer.card.name}
            </h3>
            <div
              className={classNames('text-2xl font-bold', {
                'text-green-400': answer.isCorrect,
                'text-red-400': !answer.isCorrect,
              })}
            >
              {answer.isCorrect ? '✓' : '✗'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span className="text-mtg-gray text-sm font-semibold">
                Your Answer:
              </span>
              <span
                className={classNames('font-medium', {
                  'text-green-400': answer.isCorrect,
                  'text-red-400': !answer.isCorrect,
                })}
              >
                {answer.userAnswer}
              </span>
            </div>

            {!answer.isCorrect && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <span className="text-mtg-gray text-sm font-semibold">
                  Correct Answer:
                </span>
                <span className="font-medium text-green-400">
                  {answer.card.name}
                </span>
              </div>
            )}
          </div>

          <div className="border-mtg-gray/30 flex items-center justify-between border-t pt-2">
            <span className="text-mtg-gray text-sm">Points Earned:</span>
            <span
              className={classNames('text-lg font-bold', {
                'text-green-400': answer.isCorrect,
                'text-red-400': !answer.isCorrect,
              })}
            >
              {answer.isCorrect ? '1' : '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
