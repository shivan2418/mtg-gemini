import { QuizResults } from '@/components/QuizResults';
import { api } from '@/trpc/server';

interface QuizResultsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizResultsPage({
  params,
}: QuizResultsPageProps) {
  const { id: quizId } = await params;

  try {
    const results = await api.quiz.getQuizResults({ quizId });

    if (!results?.quiz?.answers) {
      return <div>Error loading quiz results</div>;
    }

    return (
      <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white min-h-screen bg-gradient-to-br">
        <QuizResults answers={results.quiz.answers} />
      </main>
    );
  } catch (error) {
    console.error('Error loading quiz results:', error);
    return <div>Error loading quiz results</div>;
  }
}
