'use client';

import { api } from '@/trpc/react';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import debouncePromise from 'debounce-promise';
import type { RouterOutputs } from '@/trpc/react';

interface CardOption {
  value: string;
  label: string;
}

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
  const [suggestions, setSuggestions] = useState<CardOption[]>([]);
  const [showResult, setShowResult] = useState(false);
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

  const utils = api.useUtils();

  // Create a debounced search function using debounce-promise
  const searchCards = useCallback(
    debouncePromise(async (query: string): Promise<CardOption[]> => {
      if (query.length < 2) {
        setSuggestions([]);
        setSuggestion('');
        return [];
      }

      try {
        const result = await utils.quiz.searchCards.fetch({
          query,
          limit: 5,
        });
        setSuggestions(result);
        // Set the first suggestion as the inline suggestion
        if (result.length > 0 && result[0]) {
          setSuggestion(result[0].label);
        } else {
          setSuggestion('');
        }
        return result;
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
        setSuggestion('');
        return [];
      }
    }, 200),
    [utils],
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

  const handleNextCard = () => {
    setShowResult(false);
    setInputValue('');
    setSuggestion('');
    setSuggestions([]);
    setLastAnswer(null);

    if (currentCardIndex + 1 >= totalCards) {
      // Quiz completed
      completeQuizMutation.mutate({ quizId: quiz!.id });
    } else {
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
    } else if (event.key === 'Tab' && suggestion && suggestion.toLowerCase().startsWith(inputValue.toLowerCase())) {
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
                        <button
                          onClick={handleSubmitAnswer}
                          disabled={
                            !inputValue.trim() ||
                            submitAnswerMutation.isPending
                          }
                          className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold w-full rounded-lg bg-gradient-to-r px-6 py-3 text-lg font-bold shadow-lg transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {submitAnswerMutation.isPending
                            ? 'Submitting...'
                            : 'Submit Answer'}
                        </button>
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
                  className="w-full min-h-[50px] px-4 py-3 text-base text-white bg-[#1a1a1a] border-2 border-[#d4af37] rounded-lg focus:border-[#f7d794] focus:outline-none focus:ring-3 focus:ring-[rgba(247,215,148,0.1)] hover:border-[#f7d794] transition-colors"
                />
                {/* Ghost text for suggestion */}
                {suggestion && suggestion.toLowerCase().startsWith(inputValue.toLowerCase()) && inputValue.length >= 2 && (
                  <div className="absolute left-4 top-3 text-base text-gray-400 pointer-events-none z-10">
                    <span className="invisible">{inputValue}</span>
                    <span>{suggestion.slice(inputValue.length)}</span>
                  </div>
                )}
                {/* Hint text */}
                {suggestion && suggestion.toLowerCase().startsWith(inputValue.toLowerCase()) && inputValue.length >= 2 && (
                  <div className="absolute right-4 top-3 text-sm text-gray-500 pointer-events-none">
                    Press Tab to accept
                  </div>
                )}
              </div>
            </div>

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
              <span className="font-semibold">
                {inputValue || 'No answer'}
              </span>
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
