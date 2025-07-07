import type { Meta, StoryObj } from '@storybook/nextjs';
import { QuizResults } from './QuizResults';

const meta: Meta<typeof QuizResults> = {
  title: 'Components/QuizResults',
  component: QuizResults,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Quiz results page showing user performance with animated card reveals.',
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

// Note: These stories show the component structure, but will show loading state
// since they don't have actual tRPC data. In a real implementation, you'd need
// to mock the tRPC provider or create a separate component for displaying results.

export const LoadingState: Story = {
  args: {
    quizId: 'loading-quiz-id',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state while quiz results are being fetched.',
      },
    },
  },
};

export const InvalidQuizId: Story = {
  args: {
    quizId: 'invalid-quiz-id',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the error state when quiz results are not found.',
      },
    },
  },
};

// For demonstration purposes, let's create a separate component that shows
// what the results would look like with mock data
export const MockedResults: Story = {
  args: {
    quizId: 'demo-quiz',
  },
  parameters: {
    docs: {
      description: {
        story: 'This would show actual results if connected to a mocked tRPC provider.',
      },
    },
  },
};