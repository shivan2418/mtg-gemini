'use client';

import { api } from '@/trpc/react';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import debouncePromise from 'debounce-promise';
import type { SingleValue } from 'react-select';
import type { RouterOutputs } from '@/trpc/react';

// Dynamically import AsyncSelect to avoid SSR hydration issues
const AsyncSelect = dynamic(() => import('react-select/async'), {
  ssr: false,
  loading: () => (
    <div className="h-[50px] animate-pulse rounded-lg bg-gray-600" />
  ),
}) as any;

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
  const [selectedCard, setSelectedCard] =
    useState<SingleValue<CardOption>>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        return [];
      }

      try {
        const result = await utils.quiz.searchCards.fetch({
          query,
          limit: 5,
        });
        return result;
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    }, 200),
    [utils],
  );

  const loadCards = (inputValue: string): Promise<CardOption[]> => {
    return searchCards(inputValue);
  };

  const handleSubmitAnswer = () => {
    if (!currentCard || !selectedCard?.value || !quiz) return;

    const startTime = Date.now();
    submitAnswerMutation.mutate({
      quizId: quiz.id,
      cardId: currentCard.id,
      userAnswer: selectedCard.value,
      timeSpent: Date.now() - startTime,
    });
  };

  const handleNextCard = () => {
    setShowResult(false);
    setSelectedCard(null);
    setLastAnswer(null);

    if (currentCardIndex + 1 >= totalCards) {
      // Quiz completed
      completeQuizMutation.mutate({ quizId: quiz!.id });
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handleCardSelect = (option: SingleValue<CardOption>) => {
    setSelectedCard(option);
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
                htmlFor="card-search"
                className="text-mtg-white mb-2 block text-lg font-semibold"
              >
                What is the name of this card?
              </label>
              {isMounted && (
                <AsyncSelect<CardOption>
                  id="card-search"
                  cacheOptions
                  loadOptions={loadCards}
                  defaultOptions={false}
                  value={selectedCard}
                  onChange={handleCardSelect}
                  placeholder="Type at least 2 characters to search..."
                  noOptionsMessage={({ inputValue }: { inputValue: string }) =>
                    inputValue.length < 2
                      ? 'Type at least 2 characters to search'
                      : 'No cards found'
                  }
                  loadingMessage={() => 'Searching cards...'}
                  styles={{
                    control: (provided: any) => ({
                      ...provided,
                      minHeight: '50px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: '2px solid #d4af37',
                      backgroundColor: '#1a1a1a',
                      '&:hover': {
                        border: '2px solid #f7d794',
                      },
                      '&:focus-within': {
                        border: '2px solid #f7d794',
                        boxShadow: '0 0 0 3px rgba(247, 215, 148, 0.1)',
                      },
                    }),
                    placeholder: (provided: any) => ({
                      ...provided,
                      color: '#9ca3af',
                    }),
                    singleValue: (provided: any) => ({
                      ...provided,
                      color: '#ffffff',
                    }),
                    input: (provided: any) => ({
                      ...provided,
                      color: '#ffffff',
                    }),
                    menu: (provided: any) => ({
                      ...provided,
                      borderRadius: '8px',
                      marginTop: '4px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #d4af37',
                    }),
                    option: (provided: any, state: any) => ({
                      ...provided,
                      backgroundColor: state.isSelected
                        ? '#d4af37'
                        : state.isFocused
                          ? '#2a2a2a'
                          : '#1a1a1a',
                      color: state.isSelected ? '#000000' : '#ffffff',
                      padding: '12px 16px',
                      cursor: 'pointer',
                    }),
                  }}
                />
              )}
            </div>
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedCard?.value || submitAnswerMutation.isPending}
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
              Your answer:{' '}
              <span className="font-semibold">
                {selectedCard?.label ?? 'No answer'}
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
