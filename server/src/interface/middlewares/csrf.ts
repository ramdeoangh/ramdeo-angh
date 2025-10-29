import { Request, Response, NextFunction } from 'express';

export function csrfProtect(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();
  const header = req.headers['x-csrf-token'];
  const cookie = req.cookies?.csrfToken;
  if (!cookie || !header || cookie !== header) {
    return res.status(403).json({ error: { message: 'Invalid CSRF token' } });
  }
  return next();
}


