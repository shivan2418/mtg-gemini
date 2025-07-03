import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { QuizGame } from '@/components/QuizGame';

interface QuizPageProps {
  params: {
    id: string;
  };
}

export default async function QuizPage({ params }: QuizPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white min-h-screen bg-gradient-to-br">
      <QuizGame quizId={params.id} />
    </main>
  );
}
