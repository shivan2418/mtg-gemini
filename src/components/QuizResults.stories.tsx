import type { Meta, StoryObj } from '@storybook/nextjs';
import { QuizResults } from './QuizResults';

// Create a simple mock component for Storybook that shows the structure
const QuizResultsMock = ({ quizId }: { quizId: string }) => {
  // Mock data that represents what the component would show
  const mockResults = {
    quiz: {
      answers: [
        {
          id: '1',
          userAnswer: 'Lightning Bolt',
          isCorrect: true,
          card: {
            id: '1',
            name: 'Lightning Bolt',
            artOnlyUri:
              'https://cards.scryfall.io/art_crop/front/f/2/f29ba16f-c8fb-42fe-aabf-87089cb214a7.jpg',
          },
        },
        {
          id: '2',
          userAnswer: 'Black Lotus',
          isCorrect: false,
          card: {
            id: '2',
            name: 'Blue Lotus',
            artOnlyUri:
              'https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
          },
        },
        {
          id: '3',
          userAnswer: 'Counterspell',
          isCorrect: true,
          card: {
            id: '3',
            name: 'Counterspell',
            artOnlyUri:
              'https://cards.scryfall.io/art_crop/front/1/9/1920dae4-fb92-4f19-ae4b-eb3276b8dac7.jpg',
          },
        },
      ],
    },
    totalQuestions: 3,
  };

  const currentScore = 2; // Mock current score

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
          Quiz Results
        </h1>
        <p className="text-mtg-gray mt-2 text-lg">
          Current Score: {currentScore} out of {mockResults.totalQuestions}
        </p>
        <div className="bg-mtg-dark mt-4 h-2 w-full rounded-full">
          <div
            className="from-mtg-gold to-mtg-gold-light h-2 rounded-full bg-gradient-to-r transition-all duration-500"
            style={{
              width: `${(currentScore / mockResults.totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {mockResults.quiz.answers.map((answer, index) => (
          <div
            key={answer.id}
            className="bg-mtg-dark border-mtg-gold translate-y-0 rounded-lg border-2 p-3 opacity-100 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-bold ${
                  answer.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {answer.card.name}
              </h3>
              <div
                className={`text-xl font-bold ${
                  answer.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {answer.isCorrect ? '✓' : '✗'}
              </div>
            </div>
          </div>
        ))}

        <div className="bg-mtg-dark border-mtg-gold mt-8 rounded-lg border-2 p-8 text-center">
          <h2 className="from-mtg-gold via-mtg-white to-mtg-gold mb-4 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            Quiz Complete!
          </h2>
          <div className="mb-4 text-6xl font-bold">
            <span className="text-mtg-gold">{currentScore}</span>
            <span className="text-mtg-gray"> / </span>
            <span className="text-mtg-white">{mockResults.totalQuestions}</span>
          </div>
          <div className="text-mtg-gray mb-6 text-xl">
            {((currentScore / mockResults.totalQuestions) * 100).toFixed(1)}%
            Accuracy
          </div>
          <button className="bg-mtg-gold hover:bg-mtg-gold-light text-mtg-dark rounded px-8 py-3 font-semibold transition-colors">
            Take Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

const meta: Meta<typeof QuizResultsMock> = {
  title: 'Components/QuizResults',
  component: QuizResultsMock,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Quiz results page showing user performance with animated card reveals. Note: This is a mock version for Storybook that shows the visual design without requiring tRPC or router context.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    quizId: {
      control: 'text',
      description: 'The ID of the quiz to display results for',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MockedResults: Story = {
  args: {
    quizId: 'demo-quiz',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows the quiz results layout with mocked data to demonstrate the visual design.',
      },
    },
  },
};

export const LoadingState: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-2xl">Loading quiz results...</div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while quiz results are being fetched.',
      },
    },
  },
};

export const NotFoundState: Story = {
  render: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-2xl">Quiz results not found</div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows the error state when quiz results are not found.',
      },
    },
  },
};
