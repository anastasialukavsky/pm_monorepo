import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function seedDatabase() {
  const user = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      password: 'jdpass123',
    },
  });

  const hash = await argon.hash(user.password);
  const anastasia = await prisma.user.upsert({
    where: {
      email: 'alukavsky@email.com',
    },
    update: {},
    create: {
      firstName: 'Anastasia',
      lastName: 'Luakvsky',
      email: 'alukavsky@email.com',
      password: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: {
        create: [
          {
            title: 'PMS project',
            description:
              'This PMS is designed to make your life easier, not harder',
            createdAt: new Date(),
            userId: user.id,
            tasks: {
              create: [
                {
                  title: 'Seed the database',
                  status: 'in progress',
                  dueDate: new Date('2023-11-11'),
                  priority: 'urgent',
                  notes: "I don't know how to do it but hell I'm trying",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log({ anastasia });
  console.log('Seed script executed successfully');

  await prisma.$disconnect();
}

seedDatabase().catch((error) => {
  console.error('Error executing seed script:', error);
  process.exit(1);
});
