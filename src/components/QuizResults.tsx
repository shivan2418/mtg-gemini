'use client';

import { api } from '@/trpc/react';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import classNames from 'classnames';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/server/api/root';

interface QuizResultsProps {
  quizId: string;
}

// Infer the output type of the entire router
type RouterOutput = inferRouterOutputs<AppRouter>;

// Infer the output type of the getQuizResults query
type QuizResultsOutput = RouterOutput['quiz']['getQuizResults'];

// Define the Answer type for individual answers
type Answer = QuizResultsOutput['quiz']['answers'][number];

interface QuizResultsCardProps {
  delay: number;
  answer: Answer;
}

const QuizResultCard = ({ delay, answer }: QuizResultsCardProps) => {
  const [show, setShow] = useState(false);
  const [shrink, setShrink] = useState(false);
  setTimeout(() => {
    setShow(true);
  }, delay);

  return (
    <div
      onTransitionEnd={() => setShrink(true)}
      className={classNames('opacity-0 transition-all duration-500', {
        'bg-red-500': shrink,
        'opacity-100': show,
      })}
    >
      {answer.id}
    </div>
  );
};

export function QuizResults({ quizId }: QuizResultsProps) {
  const [numVisibleCards, setNumVisibleCards] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const router = useRouter();

  const { data: results, isLoading } = api.quiz.getQuizResults.useQuery({
    quizId,
  });

  const totalCardsInQuiz = results?.quiz.answers.length ?? 0;

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
        {results.quiz.answers.map((answer, index) => (
          <QuizResultCard
            key={answer.id}
            delay={index * 1000}
            answer={answer}
          />
        ))}

        {results.quiz.answers.map((answer, index) => {
          return (
            <div
              key={answer.id}
              className="bg-mtg-dark border-mtg-gold translate-y-0 rounded-lg border-2 p-6 opacity-100 transition-all duration-500"
              onTransitionStart={(event) => {
                console.log(`Transition end of ${index}`);
                if (answer.isCorrect) {
                  setCurrentScore((prev) => prev + 1);
                }
              }}
              style={{
                transitionDelay: `${index * 1000}ms`,
              }}
            >
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                {/* Card Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={answer.card.artOnlyUri}
                    alt="Magic card artwork"
                    fill
                    className={classNames('object-cover', { hidden: true })}
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
                    <span className="text-mtg-gray text-sm">
                      Points Earned:
                    </span>
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
          );
        })}

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
