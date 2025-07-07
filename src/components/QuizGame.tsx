'use client';

import { api } from '@/trpc/react';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { RouterOutputs } from '@/trpc/react';
import { useCardSearch } from '@/hooks/useCardSearch';
import { Button } from './ui/Button';

interface QuizGameProps {
  quizId: string;
}

// Type for the quiz data returned by getQuizById
type QuizData = RouterOutputs['quiz']['getQuizById'];
type QuizCard = NonNullable<QuizData>['cards'][number];
type QuizAnswer = NonNullable<QuizData>['answers'][number];

export function QuizGame({ quizId }: QuizGameProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);

  const { data: quiz, isLoading } = api.quiz.getQuizById.useQuery({ quizId });

  // Calculate the current card index based on answered cards
  useEffect(() => {
    if (quiz?.answers && quiz?.cards) {
      const answeredCardIds = new Set(
        quiz.answers.map((answer: QuizAnswer) => answer.cardId),
      );
      const firstUnansweredIndex = quiz.cards.findIndex(
        (card: QuizCard) => !answeredCardIds.has(card.id),
      );

      // If all cards are answered, keep the current index (quiz should be completed)
      // Otherwise, set to the first unanswered card
      if (firstUnansweredIndex >= 0) {
        setCurrentCardIndex(firstUnansweredIndex);
      }
    }
  }, [quiz?.answers, quiz?.cards]);

  const submitAnswerMutation = api.quiz.submitAnswer.useMutation({
    onSuccess: (result) => {
      setLastAnswer(result);
      setShowResult(true);
    },
  });

  const completeQuizMutation = api.quiz.completeQuiz.useMutation({
    onSuccess: () => {
      // Redirect to results page
      window.location.href = `/quiz/${quiz!.id}/results`;
    },
  });

  const currentCard = quiz?.cards[currentCardIndex];
  const totalCards = quiz?.cards.length ?? 0;

  // Use local card search instead of API
  const { searchCards: localSearchCards } = useCardSearch();

  // Create a search function that uses local search
  const searchCards = useCallback(
    (query: string) => {
      if (query.length < 2) {
        setSuggestion('');
        return;
      }

      try {
        const result = localSearchCards(query, 5);
        // Set the first suggestion as the inline suggestion
        if (result.length > 0 && result[0]) {
          setSuggestion(result[0].label);
        } else {
          setSuggestion('');
        }
      } catch (error) {
        console.error('Search error:', error);
        setSuggestion('');
      }
    },
    [localSearchCards],
  );

  const handleSubmitAnswer = () => {
    if (!currentCard || !quiz) return;

    const userAnswer = inputValue.trim();
    if (!userAnswer) return;

    const startTime = Date.now();
    submitAnswerMutation.mutate({
      quizId: quiz.id,
      cardId: currentCard.id,
      userAnswer,
      timeSpent: Date.now() - startTime,
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleNextCard = () => {
    setShowResult(false);
    setInputValue('');
    setSuggestion('');
    setLastAnswer(null);

    if (currentCardIndex + 1 >= totalCards) {
      // Quiz completed
      completeQuizMutation.mutate({ quizId: quiz!.id });
    } else {
      // Set loading state and update card index
      setImageLoading(true);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    searchCards(value);
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      setInputValue(suggestion);
      setSuggestion('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleSubmitAnswer();
    } else if (
      event.key === 'Tab' &&
      suggestion?.toLowerCase().startsWith(inputValue.toLowerCase())
    ) {
      event.preventDefault();
      acceptSuggestion();
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
            {imageLoading && (
              <div className="bg-mtg-dark absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-mtg-white text-lg">
                  Loading new card...
                </div>
              </div>
            )}
            <Image
              src={currentCard.artOnlyUri}
              alt="Magic card artwork"
              fill
              className="object-cover"
              unoptimized
              onLoad={handleImageLoad}
            />
          </div>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="relative">
              <label
                htmlFor="card-search"
                className="text-mtg-white mb-2 block text-lg font-semibold"
              >
                What is the name of this card?
              </label>
              <div className="relative">
                <input
                  id="card-search"
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type at least 2 characters to search..."
                  className="min-h-[50px] w-full rounded-lg border-2 border-[#d4af37] bg-[#1a1a1a] px-4 py-3 text-base text-white transition-colors hover:border-[#f7d794] focus:border-[#f7d794] focus:ring-3 focus:ring-[rgba(247,215,148,0.1)] focus:outline-none"
                />
                {/* Ghost text for suggestion */}
                {suggestion &&
                  suggestion
                    .toLowerCase()
                    .startsWith(inputValue.toLowerCase()) &&
                  inputValue.length >= 2 && (
                    <div className="pointer-events-none absolute top-3 left-4 z-10 text-base text-gray-400">
                      <span className="invisible">{inputValue}</span>
                      <span>{suggestion.slice(inputValue.length)}</span>
                    </div>
                  )}
                {/* Hint text */}
                {suggestion &&
                  suggestion
                    .toLowerCase()
                    .startsWith(inputValue.toLowerCase()) &&
                  inputValue.length >= 2 && (
                    <div className="pointer-events-none absolute top-3 right-4 text-sm text-gray-500">
                      Press Tab to accept
                    </div>
                  )}
              </div>
            </div>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!inputValue.trim() || submitAnswerMutation.isPending}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {submitAnswerMutation.isPending
                ? 'Submitting...'
                : 'Submit Answer'}
            </Button>
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
              Your answer:{' '}
              <span className="font-semibold">{inputValue || 'No answer'}</span>
            </div>
            <Button onClick={handleNextCard} variant="primary" size="lg">
              {currentCardIndex + 1 >= totalCards ? 'Finish Quiz' : 'Next Card'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
