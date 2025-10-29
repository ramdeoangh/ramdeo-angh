import { Router } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '../../infrastructure/prisma';
import { signAccessToken, signRefreshToken, verifyAccessToken } from '../../config/jwt';
import { loadEnv } from '../../config/env';

const env = loadEnv();
const router = Router();

const credsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

function setAuthCookies(res: any, user: { id: number; email: string; role: string }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });
  const common = { httpOnly: true, sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax' as const, secure: env.NODE_ENV === 'production' };
  res.cookie('accessToken', accessToken, { ...common, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...common, maxAge: 7 * 24 * 60 * 60 * 1000 });
  // CSRF double-submit cookie (not httpOnly)
  const csrfToken = Math.random().toString(36).slice(2);
  res.cookie('csrfToken', csrfToken, { httpOnly: false, sameSite: common.sameSite, secure: common.secure, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

router.post('/register', async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const { email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: { message: 'Email already registered' } });
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.create({ data: { email, passwordHash, role: 'user' } });
  setAuthCookies(res, user);
  return res.json({ user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt } });
});

router.post('/login', async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: { message: 'Invalid input', issues: parsed.error.issues } });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: { message: 'Invalid credentials' } });
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: { message: 'Invalid credentials' } });
  setAuthCookies(res, user);
  return res.json({ user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: { message: 'Unauthorized' } });
    const payload: any = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: { message: 'Unauthorized' } });
    return res.json({ user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt } });
  } catch {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }
});

export default router;


