import type { Meta, StoryObj } from '@storybook/nextjs';
import { QuizResultCard } from './QuizResultCard';

const meta: Meta<typeof QuizResultCard> = {
  title: 'Components/QuizResultCard',
  component: QuizResultCard,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a1a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    show: {
      control: { type: 'boolean' },
      description: 'Whether the card is visible',
    },
    shrink: {
      control: { type: 'boolean' },
      description: 'Whether the card is in shrunk state',
    },
    answer: {
      control: { type: 'object' },
      description: 'Quiz answer data',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock answer data for stories
const correctAnswer = {
  id: '1',
  createdAt: new Date(),
  quizId: 'quiz-1',
  cardId: 'card-1',
  userAnswer: 'Lightning Bolt',
  isCorrect: true,
  timeSpent: 3500,
  card: {
    id: 'card-1',
    name: 'Lightning Bolt',
    artOnlyUri:
      'https://cards.scryfall.io/art_crop/front/a/e/ae5f9fb1-5a55-4db3-98a1-2628e3598c18.jpg',
    fullCardUri:
      'https://cards.scryfall.io/normal/front/a/e/ae5f9fb1-5a55-4db3-98a1-2628e3598c18.jpg',
  },
};

const incorrectAnswer = {
  id: '2',
  createdAt: new Date(),
  quizId: 'quiz-1',
  cardId: 'card-2',
  userAnswer: 'Shock',
  isCorrect: false,
  timeSpent: 8200,
  card: {
    id: 'card-2',
    name: 'Lightning Bolt',
    artOnlyUri:
      'https://cards.scryfall.io/art_crop/front/a/e/ae5f9fb1-5a55-4db3-98a1-2628e3598c18.jpg',
    fullCardUri:
      'https://cards.scryfall.io/normal/front/a/e/ae5f9fb1-5a55-4db3-98a1-2628e3598c18.jpg',
  },
};

export const Hidden: Story = {
  args: {
    answer: correctAnswer,
    show: false,
    shrink: false,
  },
};

export const CorrectAnswerExpanded: Story = {
  args: {
    answer: correctAnswer,
    show: true,
    shrink: false,
  },
};

export const CorrectAnswerShrunk: Story = {
  args: {
    answer: correctAnswer,
    show: true,
    shrink: true,
  },
};

export const IncorrectAnswerExpanded: Story = {
  args: {
    answer: incorrectAnswer,
    show: true,
    shrink: false,
  },
};

export const IncorrectAnswerShrunk: Story = {
  args: {
    answer: incorrectAnswer,
    show: true,
    shrink: true,
  },
};

export const Interactive: Story = {
  args: {
    answer: correctAnswer,
    show: true,
    shrink: false,
  },
  argTypes: {
    answer: {
      control: false, // Disable control for the interactive story
    },
  },
};
