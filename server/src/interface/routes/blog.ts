import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../middlewares/auth';
import { renderMarkdownToHtml } from '../../infrastructure/markdown';

const router = Router();

router.get('/posts', async (req, res) => {
  const querySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1)
  });
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid query', issues: parsed.error.issues } });
  const { search, category, tag, page } = parsed.data;

  const where: any = {
    AND: [
      search ? { OR: [{ title: { contains: search } }, { excerpt: { contains: search } }] } : {},
      category ? { category: { slug: category } } : {},
      tag ? { tags: { some: { tag: { slug: tag } } } } : {},
      { status: 'published' as const }
    ]
  };

  const take = 10;
  const skip = (page - 1) * take;
  const [items, total] = await Promise.all([
    prisma.post.findMany({ where, select: { slug: true, title: true, excerpt: true }, orderBy: { publishedAt: 'desc' }, skip, take }),
    prisma.post.count({ where })
  ]);
  return res.json({ items, page, totalPages: Math.max(1, Math.ceil(total / take)) });
});

router.get('/posts/:slug', async (req, res) => {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug }, include: { tags: { include: { tag: true } }, category: true } });
  if (!post || (post.status !== 'published' && process.env.NODE_ENV === 'production')) return res.status(404).json({ error: { message: 'Not found' } });
  const contentHtml = await renderMarkdownToHtml(post.contentMarkdown);
  return res.json({ title: post.title, contentHtml });
});

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] as string));
}

export default router;

// Admin CRUD
const postInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  contentMarkdown: z.string(),
  coverUrl: z.string().url().nullable().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  publishedAt: z.string().datetime().nullable().optional(),
  categoryId: z.number().int().nullable().optional(),
  tagIds: z.array(z.number().int()).optional()
});

router.post('/posts', requireAuth, requireAdmin, async (req, res) => {
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const data = parsed.data;
  const created = await prisma.post.create({ data: {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    contentMarkdown: data.contentMarkdown,
    coverUrl: data.coverUrl ?? undefined,
    status: data.status,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    authorId: (req.user as any).id,
    categoryId: data.categoryId ?? undefined,
    tags: { create: (data.tagIds || []).map((tagId) => ({ tagId })) }
  }});
  return res.status(201).json({ id: created.id });
});

router.put('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  const parsed = postInput.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const data = parsed.data;
  const id = Number(req.params.id);
  await prisma.post.update({ where: { id }, data: {
    ...data,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    tags: data.tagIds ? { deleteMany: {}, create: data.tagIds.map((tagId) => ({ tagId })) } : undefined
  }});
  return res.json({ ok: true });
});

router.delete('/posts/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.post.delete({ where: { id } });
  return res.json({ ok: true });
});

// Categories
router.get('/categories', async (_req, res) => {
  const items = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json({ items });
});
router.post('/categories', requireAuth, requireAdmin, async (req, res) => {
  const parsed = z.object({ name: z.string().min(1), slug: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const item = await prisma.category.create({ data: parsed.data });
  res.status(201).json(item);
});
router.delete('/categories/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// Tags
router.get('/tags', async (_req, res) => {
  const items = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  res.json({ items });
});
router.post('/tags', requireAuth, requireAdmin, async (req, res) => {
  const parsed = z.object({ name: z.string().min(1), slug: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const item = await prisma.tag.create({ data: parsed.data });
  res.status(201).json(item);
});
router.delete('/tags/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.tag.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// RSS
router.get('/rss.xml', async (_req, res) => {
  const posts = await prisma.post.findMany({ where: { status: 'published' }, orderBy: { publishedAt: 'desc' }, take: 20 });
  res.setHeader('Content-Type', 'application/rss+xml');
  const items = posts.map((p) => `\n    <item>\n      <title>${escapeXml(p.title)}</title>\n      <link>http://localhost:5173/blog/${escapeXml(p.slug)}</link>\n      <guid>http://localhost:5173/blog/${escapeXml(p.slug)}</guid>\n      <pubDate>${p.publishedAt?.toUTCString() || new Date().toUTCString()}</pubDate>\n      <description>${escapeXml(p.excerpt || '')}</description>\n    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Ramdeo Angh Blog</title>\n    <link>http://localhost:5173/blog</link>\n    <description>Latest posts</description>${items}\n  </channel>\n</rss>`;
  res.send(xml);
});

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] as string));
}


