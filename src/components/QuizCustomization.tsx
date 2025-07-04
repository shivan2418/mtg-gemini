'use client';

import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { env } from '@/env';

interface QuizCustomizationProps {
  onBack: () => void;
}

export function QuizCustomization({ onBack }: QuizCustomizationProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const { data: quizFormats, isLoading: isLoadingFormats } =
    api.quiz.getAllQuizFormats.useQuery();
  const [selectedFormat, setSelectedFormat] = useState<string>('classic');

  const { data: cardCountData, isLoading: isLoadingCount } =
    api.quiz.getCardCountForFormat.useQuery(
      { formatId: selectedFormat },
      { enabled: !!selectedFormat },
    );

  const createQuizMutation = api.quiz.createQuiz.useMutation({
    onSuccess: (quiz) => {
      router.push(`/quiz/${quiz.id}`);
    },
    onError: (error) => {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleStartQuiz = (formatId: string) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    setIsLoading(true);
    createQuizMutation.mutate({
      cardCount: parseInt(env.NEXT_PUBLIC_QUIZ_CARD_COUNT),
      formatId: formatId,
    });
  };

  return (
    <div className="bg-mtg-black border-mtg-gold rounded-lg border-2 p-8 shadow-xl">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-mtg-gold hover:text-mtg-gold-light mb-4 flex items-center text-sm transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-mtg-gold mb-2 text-2xl font-bold">
          Choose Quiz Format
        </h2>
        <p className="text-mtg-gold-light text-sm">
          Select the type of quiz you want to play
        </p>
      </div>

      <div className="space-y-4">
        {isLoadingFormats ? (
          <div className="text-mtg-gold-light text-center">
            Loading formats...
          </div>
        ) : (
          quizFormats?.map((format) => (
            <div
              key={format.id}
              className={`bg-mtg-gold bg-opacity-10 hover:bg-opacity-20 border-mtg-gold cursor-pointer rounded-lg border p-6 transition-all duration-300 ${
                selectedFormat === format.id ? 'ring-mtg-gold ring-2' : ''
              } ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
              onClick={() => {
                if (!isLoading) {
                  setSelectedFormat(format.id);
                  handleStartQuiz(format.id);
                }
              }}
            >
              <div>
                <h3 className="text-mtg-gold text-xl font-bold">
                  {format.name}
                </h3>
                <p className="text-mtg-gold-light mt-1 text-sm">
                  {format.description}
                </p>
                <p className="text-mtg-gold-light mt-2 text-xs">
                  {selectedFormat === format.id && isLoadingCount
                    ? 'Loading card count...'
                    : selectedFormat === format.id && cardCountData
                      ? `${cardCountData.count.toLocaleString()} cards in pool`
                      : 'Click to start quiz'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
