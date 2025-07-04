'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { QuizCustomization } from './QuizCustomization';

export function StartQuizButton() {
  const router = useRouter();
  const [showCustomization, setShowCustomization] = useState(false);
  const { data: session } = useSession();

  const handleStartQuiz = () => {
    if (!session) {
      // Redirect to signin if not authenticated
      router.push('/auth/signin');
      return;
    }
    setShowCustomization(true);
  };

  const handleBack = () => {
    setShowCustomization(false);
  };

  if (showCustomization) {
    return <QuizCustomization onBack={handleBack} />;
  }

  return (
    <button
      onClick={handleStartQuiz}
      className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold border-mtg-gold-dark mt-8 rounded-lg border-2 bg-gradient-to-r px-8 py-4 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      Start Quiz
    </button>
  );
}
