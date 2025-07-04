import { StartQuizButton } from '@/components/StartQuizButton';
import { SignOutButton } from '@/components/SignOutButton';
import { auth } from '@/server/auth';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();

  return (
    <main className="from-mtg-black via-mtg-dark to-mtg-black text-mtg-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-br">
      <div className="relative container flex flex-col items-center justify-center gap-8 px-4 py-16">
        {session && (
          <div className="absolute top-4 right-4">
            <SignOutButton />
          </div>
        )}

        <h1 className="from-mtg-gold via-mtg-white to-mtg-gold bg-gradient-to-r bg-clip-text text-center text-6xl font-extrabold tracking-tight text-transparent sm:text-[8rem]">
          MTG Quiz
        </h1>
        <p className="text-mtg-gray max-w-2xl text-center text-xl">
          Test your knowledge of Magic: The Gathering cards
        </p>

        {session ? (
          <>
            <p className="text-mtg-gray text-sm">
              Welcome, {session.user?.email ?? session.user?.name ?? 'Player'}!
            </p>
            <StartQuizButton />
          </>
        ) : (
          <>
            <p className="text-mtg-gray mb-4 text-sm">
              Please sign in to start a quiz
            </p>
            <Link
              href="/auth/signin"
              className="text-mtg-black from-mtg-gold to-mtg-gold-light hover:from-mtg-gold-light hover:to-mtg-gold border-mtg-gold-dark rounded-lg border-2 bg-gradient-to-r px-8 py-4 text-xl font-bold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Sign In
            </Link>
          </>
        )}

        <p className="text-mtg-gray mt-4 text-sm">
          Default quiz has 20 random cards
        </p>
      </div>
    </main>
  );
}
