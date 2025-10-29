import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../config/jwt';

export type AuthUser = { id: number; role: 'admin' | 'user'; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: { message: 'Unauthorized' } });
    const payload = verifyAccessToken(token) as any;
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: { message: 'Unauthorized' } });
  if (req.user.role !== 'admin') return res.status(403).json({ error: { message: 'Forbidden' } });
  next();
}


