'use client';

import { api } from '@/trpc/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface QuizResultsProps {
  quizId: string;
}

export function QuizResults({ quizId }: QuizResultsProps) {
  const [visibleCards, setVisibleCards] = useState<number>(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const router = useRouter();

  const { data: results, isLoading } = api.quiz.getQuizResults.useQuery({
    quizId,
  });

  // Animate cards appearing one by one
  useEffect(() => {
    if (!results) return;

    const totalAnswers = results.quiz.answers.length;

    // Show cards one by one with a delay
    const timer = setInterval(() => {
      setVisibleCards((prev) => {
        const next = prev + 1;
        if (next > totalAnswers) {
          setShowFinalScore(true);
          clearInterval(timer);
          return prev;
        }
        return next;
      });
    }, 500); // 500ms delay between each card

    return () => clearInterval(timer);
  }, [results]);

  const handleGoHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Loading quiz results...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Quiz results not found</div>
      </div>
    );
  }

  const { quiz, score, totalQuestions } = results;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Quiz Results
        </h1>
        <p className="text-mtg-gray mt-2 text-lg">
          Final Score: {score} out of {totalQuestions}
        </p>
        <div className="bg-mtg-dark mt-4 h-2 w-full rounded-full">
          <div
            className="from-mtg-gold to-mtg-gold-light h-2 rounded-full bg-gradient-to-r transition-all duration-300"
            style={{ width: `${(score / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {quiz.answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`bg-mtg-dark border-mtg-gold rounded-lg border-2 p-6 transition-all duration-500 ${
              index < visibleCards
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
              {/* Card Image */}
              <div className="relative h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={answer.card.artOnlyUri}
                  alt="Magic card artwork"
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
                    className={`text-2xl font-bold ${
                      answer.isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
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
                      className={`font-medium ${
                        answer.isCorrect ? 'text-green-400' : 'text-red-400'
                      }`}
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
                    className={`text-lg font-bold ${
                      answer.isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {answer.isCorrect ? '1' : '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {showFinalScore && (
          <div className="bg-mtg-dark border-mtg-gold animate-fadeIn mt-8 rounded-lg border-2 p-8 text-center">
            <h2 className="from-mtg-gold via-mtg-white to-mtg-gold mb-4 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
              Final Score
            </h2>
            <div className="mb-4 text-6xl font-bold">
              <span className="text-mtg-gold">{score}</span>
              <span className="text-mtg-gray"> / </span>
              <span className="text-mtg-white">{totalQuestions}</span>
            </div>
            <div className="text-mtg-gray mb-6 text-xl">
              {((score / totalQuestions) * 100).toFixed(1)}% Accuracy
            </div>

            <button
              onClick={handleGoHome}
              className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold rounded-lg bg-gradient-to-r px-8 py-3 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              Take Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
