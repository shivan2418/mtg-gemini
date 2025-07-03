import { PrismaClient } from '@prisma/client';

import { env } from '@/env';

const createPrismaClient = () => {
  const prisma = new PrismaClient({
    log:
      env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  // Log the database URL (partially masked for security)
  console.log(
    'Database URL (partial):',
    env.DATABASE_URL.substring(0, 30) + '...',
  );
  // Log a test query to confirm connection
  prisma.$queryRaw`SELECT 1`
    .then(() => {
      console.log('Database connection test successful');
    })
    .catch((err) => {
      console.error('Database connection test failed:', err);
    });
  return prisma;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
