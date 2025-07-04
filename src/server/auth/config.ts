import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { db } from '@/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('AUTHORIZE - Starting with credentials:', {
          email: credentials?.email,
          password: !!credentials?.password,
        });

        if (!credentials?.email || !credentials.password) {
          console.log('AUTHORIZE - Missing credentials');
          return null;
        }

        console.log(
          'AUTHORIZE - Attempting to find user with email:',
          credentials.email,
        );
        const user = await db.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });
        console.log(
          'AUTHORIZE - User query result:',
          user ? { id: user.id, email: user.email, name: user.name } : null,
        );

        if (!user?.password) {
          console.log('AUTHORIZE - No user found or no password');
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );
        console.log('AUTHORIZE - Password validation result:', isValid);

        if (isValid) {
          const userResult = {
            id: user.id,
            email: user.email,
            name: user.name,
          };
          console.log('AUTHORIZE - Returning user:', userResult);
          console.log('AUTHORIZE - User ID type:', typeof user.id);
          console.log('AUTHORIZE - User ID value:', user.id);
          return userResult;
        }

        console.log('AUTHORIZE - Invalid credentials, returning null');
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ user, token }) => {
      console.log('JWT callback - user:', user, 'token:', token);

      if (user) {
        // User object is available during sign in
        token.id = user.id;
        token.email = user.email;
        console.log('JWT callback - Set token.id from user.id:', user.id);
      } else if (token.email) {
        // On subsequent requests, look up the user by email to get the correct ID
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { id: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          console.log('JWT callback - Fetched user ID from DB:', dbUser.id);
        }
      }

      console.log('JWT callback - token.id after:', token.id);
      return token;
    },
    session: ({ session, token }) => {
      console.log('Session callback - session:', session, 'token:', token);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
        },
      };
    },
  },
} satisfies NextAuthConfig;
