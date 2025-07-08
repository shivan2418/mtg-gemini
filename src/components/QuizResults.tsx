'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import classNames from 'classnames';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

// Infer the output type of the entire router
type RouterOutput = inferRouterOutputs<AppRouter>;

// Infer the output type of the getQuizResults query
type QuizResultsOutput = RouterOutput['quiz']['getQuizResults'];

// Define the Answer type for individual answers
type Answer = QuizResultsOutput['quiz']['answers'][number];

interface QuizResultsProps {
  answers: Answer[];
}

interface QuizResultsCardProps {
  answer: Answer;
  show: boolean;
  shrink: boolean;
}

const QuizResultCard = ({ answer, show, shrink }: QuizResultsCardProps) => {
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

export function QuizResults({ answers }: QuizResultsProps) {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [cardStates, setCardStates] = useState<
    Record<string, { show: boolean; shrink: boolean }>
  >({});
  const router = useRouter();

  const TOTAL_ANIMATION_DURATION = 5000;
  const totalQuestions = answers.length;

  const handleScoreUpdate = useCallback(() => {
    setCurrentScore((prev) => prev + 1);
  }, []);

  // Handle all card timing logic
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    answers.forEach((answer, index) => {
      const delay = index * 1000;

      // Show card after delay
      const showTimer = setTimeout(() => {
        setCardStates((prev) => ({
          ...prev,
          [answer.id]: { show: true, shrink: false },
        }));
      }, delay);
      timers.push(showTimer);

      // Shrink card and update score after show animation completes
      const shrinkTimer = setTimeout(() => {
        setCardStates((prev) => ({
          ...prev,
          [answer.id]: { show: true, shrink: true },
        }));

        // Update score when card transitions to shrunk state
        if (answer.isCorrect) {
          handleScoreUpdate();
        }
      }, delay + 500); // Wait 500ms for the show animation to complete
      timers.push(shrinkTimer);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [answers, handleScoreUpdate]);

  // Show final score after all cards have been processed
  useEffect(() => {
    const finalScoreTimer = setTimeout(() => {
      setShowFinalScore(true);
    }, TOTAL_ANIMATION_DURATION + 1000); // Wait for all animations plus 1 second

    return () => clearTimeout(finalScoreTimer);
  }, []);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Quiz Results
        </h1>
        <p className="text-mtg-gray mt-2 text-lg">
          Current Score: {currentScore} out of {totalQuestions}
        </p>
        <div className="bg-mtg-dark mt-4 h-2 w-full rounded-full">
          <div
            className="from-mtg-gold to-mtg-gold-light h-2 rounded-full bg-gradient-to-r transition-all duration-500"
            style={{ width: `${(currentScore / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {answers.map((answer) => (
          <QuizResultCard
            key={answer.id}
            answer={answer}
            show={cardStates[answer.id]?.show ?? false}
            shrink={cardStates[answer.id]?.shrink ?? false}
          />
        ))}

        {showFinalScore && (
          <div className="bg-mtg-dark border-mtg-gold animate-fadeIn mt-8 rounded-lg border-2 p-8 text-center">
            <h2 className="from-mtg-gold via-mtg-white to-mtg-gold mb-4 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
              Quiz Complete!
            </h2>
            <div className="mb-4 text-6xl font-bold">
              <span className="text-mtg-gold">{currentScore}</span>
              <span className="text-mtg-gray"> / </span>
              <span className="text-mtg-white">{totalQuestions}</span>
            </div>
            <div className="text-mtg-gray mb-6 text-xl">
              {((currentScore / totalQuestions) * 100).toFixed(1)}% Accuracy
            </div>

            <Button
              onClick={handleGoHome}
              variant="primary"
              size="lg"
              className="px-8"
            >
              Take Another Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
