import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed initial user
  const hashedPassword = await bcrypt.hash('defaultpassword123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'defaultuser@example.com' },
    update: {},
    create: {
      email: 'defaultuser@example.com',
      name: 'Default User',
      password: hashedPassword,
    },
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
