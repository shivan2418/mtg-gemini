import { QuizGame } from '@/components/QuizGame';

interface QuizPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;

  return (
    <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white min-h-screen bg-gradient-to-br">
      <QuizGame quizId={id} />
    </main>
  );
}
