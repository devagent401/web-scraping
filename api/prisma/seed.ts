import 'dotenv/config';
import { PrismaClient, CategorySource, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Start seeding ...');

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('User1234!', 12);

  let admin = await prisma.user.findFirst({
    where: { OR: [{ email: 'admin@example.com' }, { username: 'admin' }] },
  });
  if (admin) {
    admin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
  } else {
    admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      },
    });
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ email: 'user@example.com' }, { username: 'user1' }] },
  });
  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: 'user@example.com',
        username: 'user1',
        password: userPassword,
        role: UserRole.USER,
        isActive: true,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user1',
        password: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
      },
    });
  }

  const daraz = await prisma.shop.upsert({
    where: { name: 'Daraz' },
    update: { provider: 'daraz', url: 'https://www.daraz.com.bd', isActive: true },
    create: {
      name: 'Daraz',
      url: 'https://www.daraz.com.bd',
      provider: 'daraz',
      isActive: true,
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: 'mobile-phones' },
    update: {},
    create: {
      name: 'Mobile Phones',
      slug: 'mobile-phones',
      source: CategorySource.FROM_URL,
    },
  });

  let target = await prisma.shopScrapeTarget.findFirst({
    where: {
      shopId: daraz.id,
      categoryId: category.id,
    },
  });

  if (!target) {
    target = await prisma.shopScrapeTarget.create({
      data: {
        shopId: daraz.id,
        categoryId: category.id,
        url: 'https://www.daraz.com.bd/phones-tablets/',
        isActive: true,
      },
    });
  }

  console.log({
    admin: { id: admin.id, email: admin.email },
    user: { id: user.id, email: user.email },
    daraz: { id: daraz.id, name: daraz.name },
    category: { id: category.id, slug: category.slug },
    scrapeTarget: { id: target.id, url: target.url },
  });
  console.log('Seeding finished.');
  console.log('Admin login: admin@example.com / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
