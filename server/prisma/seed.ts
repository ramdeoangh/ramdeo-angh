import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping seed in production');
    return;
  }

  const passwordHash = await argon2.hash('Admin@12345');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash, role: 'admin' }
  });

  const personal = await prisma.category.upsert({
    where: { slug: 'personal' },
    update: {},
    create: { name: 'Personal', slug: 'personal' }
  });
  const tutorial = await prisma.category.upsert({
    where: { slug: 'tutorial' },
    update: {},
    create: { name: 'Tutorial', slug: 'tutorial' }
  });

  const reactTag = await prisma.tag.upsert({ where: { slug: 'react' }, update: {}, create: { name: 'React', slug: 'react' } });
  const nodeTag = await prisma.tag.upsert({ where: { slug: 'node' }, update: {}, create: { name: 'Node', slug: 'node' } });
  const mysqlTag = await prisma.tag.upsert({ where: { slug: 'mysql' }, update: {}, create: { name: 'MySQL', slug: 'mysql' } });

  const published = await prisma.post.upsert({
    where: { slug: 'welcome' },
    update: {},
    create: {
      title: 'Welcome',
      slug: 'welcome',
      excerpt: 'Welcome to my blog',
      contentMarkdown: '# Hello World',
      status: 'published',
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: personal.id
    }
  });

  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: published.id, tagId: reactTag.id } },
    update: {},
    create: { postId: published.id, tagId: reactTag.id }
  });

  await prisma.post.upsert({
    where: { slug: 'draft-sample' },
    update: {},
    create: {
      title: 'Draft Sample',
      slug: 'draft-sample',
      excerpt: 'Work in progress',
      contentMarkdown: 'Draft content',
      status: 'draft',
      authorId: admin.id,
      categoryId: tutorial.id
    }
  });

  console.log('Seed complete');
}

main().finally(async () => {
  await prisma.$disconnect();
});


