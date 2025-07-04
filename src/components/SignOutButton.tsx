'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-mtg-gray hover:text-mtg-white border-mtg-gray hover:border-mtg-white rounded-lg border px-4 py-2 text-sm transition-all duration-200"
    >
      Sign Out
    </button>
  );
}
