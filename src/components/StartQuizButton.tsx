'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { QuizCustomization } from './QuizCustomization';
import { Button } from './ui/Button';

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
    <Button
      onClick={handleStartQuiz}
      variant="primary"
      size="lg"
      className="mt-8 border-mtg-gold-dark border-2 px-8 py-4 text-xl hover:shadow-xl"
    >
      Start Quiz
    </Button>
  );
}
