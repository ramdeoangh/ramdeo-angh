import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';

const router = Router();

router.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: http://localhost:4000/sitemap.xml');
});

router.get('/sitemap.xml', async (_req, res) => {
  const posts = await prisma.post.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } });
  const urls = posts.map((p) => `<url><loc>http://localhost:5173/blog/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>http://localhost:5173/</loc></url>\n  <url><loc>http://localhost:5173/blog</loc></url>\n  <url><loc>http://localhost:5173/about</loc></url>${urls}\n</urlset>`;
  res.type('application/xml');
  res.send(xml);
});

export default router;


