'use client';

import { signOut } from 'next-auth/react';
import { Button } from './ui/Button';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      size="sm"
      className="border-mtg-gray hover:border-mtg-white border"
    >
      Sign Out
    </Button>
  );
}
