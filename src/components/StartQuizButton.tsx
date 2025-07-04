'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { env } from '@/env';

interface StartQuizButtonProps {
  cardCount?: number;
}

export function StartQuizButton({
  cardCount = parseInt(env.NEXT_PUBLIC_QUIZ_CARD_COUNT),
}: StartQuizButtonProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

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

  const handleStartQuiz = () => {
    if (!session) {
      // Redirect to signin if not authenticated
      router.push('/auth/signin');
      return;
    }
    setIsLoading(true);
    createQuizMutation.mutate({ cardCount });
  };

  return (
    <button
      onClick={handleStartQuiz}
      disabled={isLoading}
      className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold border-mtg-gold-dark mt-8 rounded-lg border-2 bg-gradient-to-r px-8 py-4 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      {isLoading ? 'Creating Quiz...' : 'Start Quiz'}
    </button>
  );
}
