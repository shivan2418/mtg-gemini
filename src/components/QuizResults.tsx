'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { QuizResultCard } from './QuizResultCard';
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
