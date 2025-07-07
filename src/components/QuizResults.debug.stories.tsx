import type { Meta, StoryObj } from '@storybook/nextjs';
import { QuizResultsDebug } from './QuizResults.debug';

const meta: Meta<typeof QuizResultsDebug> = {
  title: 'Debug/QuizResults Router Test',
  component: QuizResultsDebug,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Debug component to isolate and test the router hook issue in QuizResults.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    quizId: {
      control: 'text',
      description: 'The ID of the quiz for testing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RouterHookTest: Story = {
  args: {
    quizId: 'debug-test-id',
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests if the useRouter hook can be called without error in Storybook.',
      },
    },
  },
};