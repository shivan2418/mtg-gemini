import { QuizResults } from '@/components/QuizResults';

interface QuizResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizResultsPage({
  params,
}: QuizResultsPageProps) {
  const { id } = await params;

  return (
    <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white min-h-screen bg-gradient-to-br">
      <QuizResults quizId={id} />
    </main>
  );
}
