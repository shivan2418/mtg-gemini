'use client';

import { api } from '@/trpc/react';
import { useState } from 'react';
import Image from 'next/image';

interface QuizGameProps {
  quizId: string;
}

export function QuizGame({ quizId }: QuizGameProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);

  const { data: quiz, isLoading } = api.quiz.getQuizById.useQuery({ quizId });

  const submitAnswerMutation = api.quiz.submitAnswer.useMutation({
    onSuccess: (result) => {
      setLastAnswer(result);
      setShowResult(true);
    },
  });

  const completeQuizMutation = api.quiz.completeQuiz.useMutation({
    onSuccess: () => {
      // Redirect to results or home page
      window.location.href = '/';
    },
  });

  const currentCard = quiz?.cards[currentCardIndex];
  const totalCards = quiz?.cards.length ?? 0;

  const handleSubmitAnswer = () => {
    if (!currentCard || !userAnswer.trim()) return;

    const startTime = Date.now();
    submitAnswerMutation.mutate({
      quizId: quiz.id,
      cardId: currentCard.id,
      userAnswer: userAnswer.trim(),
      timeSpent: Date.now() - startTime,
    });
  };

  const handleNextCard = () => {
    setShowResult(false);
    setUserAnswer('');
    setLastAnswer(null);

    if (currentCardIndex + 1 >= totalCards) {
      // Quiz completed
      completeQuizMutation.mutate({ quizId: quiz!.id });
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      handleSubmitAnswer();
    } else if (e.key === 'Enter' && showResult) {
      handleNextCard();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">Quiz not found</div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl">No more cards</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          MTG Quiz
        </h1>
        <p className="text-mtg-gray mt-2 text-lg">
          Card {currentCardIndex + 1} of {totalCards}
        </p>
        <div className="bg-mtg-dark mt-4 h-2 w-full rounded-full">
          <div
            className="from-mtg-gold to-mtg-gold-light h-2 rounded-full bg-gradient-to-r transition-all duration-300"
            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="bg-mtg-dark border-mtg-gold mb-8 rounded-lg border-2 p-6">
          <div className="relative mx-auto h-96 w-full overflow-hidden rounded-lg">
            <Image
              src={currentCard.artOnlyUri}
              alt="Magic card artwork"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="answer"
                className="text-mtg-white mb-2 block text-lg font-semibold"
              >
                What is the name of this card?
              </label>
              <input
                id="answer"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter card name..."
                className="text-mtg-white bg-mtg-dark border-mtg-gold placeholder-mtg-gray w-full rounded-lg border-2 px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || submitAnswerMutation.isPending}
              className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold w-full rounded-lg bg-gradient-to-r px-6 py-3 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitAnswerMutation.isPending
                ? 'Submitting...'
                : 'Submit Answer'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div
              className={`text-2xl font-bold ${
                lastAnswer?.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {lastAnswer?.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            {!lastAnswer?.isCorrect && (
              <div className="text-mtg-white text-lg">
                The correct answer is:{' '}
                <span className="font-bold">{lastAnswer?.correctAnswer}</span>
              </div>
            )}
            <div className="text-mtg-gray text-lg">
              Your answer: <span className="font-semibold">{userAnswer}</span>
            </div>
            <button
              onClick={handleNextCard}
              className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold rounded-lg bg-gradient-to-r px-6 py-3 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105"
            >
              {currentCardIndex + 1 >= totalCards ? 'Finish Quiz' : 'Next Card'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
