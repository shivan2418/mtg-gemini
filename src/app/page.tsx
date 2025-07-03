import { StartQuizButton } from '@/components/StartQuizButton';

export default async function Home() {
  return (
    <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-center text-6xl font-extrabold tracking-tight text-transparent sm:text-[8rem]">
          MTG Quiz
        </h1>
        <p className="text-mtg-gray max-w-2xl text-center text-xl">
          Test your knowledge of Magic: The Gathering cards
        </p>
        <StartQuizButton />
        <p className="text-mtg-gray mt-4 text-sm">
          Default quiz has 20 random cards
        </p>
      </div>
    </main>
  );
}
