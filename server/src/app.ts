import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import path from 'path';
import fs from 'fs';
import { loadEnv } from './config/env';
import { logger } from './config/logger';
import authRoutes from './interface/routes/auth';
import blogRoutes from './interface/routes/blog';
import cvRoutes from './interface/routes/cv';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi/openapi.json' assert { type: 'json' };
import { csrfProtect } from './interface/middlewares/csrf';
import seoRoutes from './interface/routes/seo';

const env = loadEnv();

export function buildApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()), credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));

  // Ensure upload dir exists
  const uploadDir = path.resolve(process.cwd(), env.FILE_UPLOAD_DIR);
  fs.mkdirSync(uploadDir, { recursive: true });

  // Health
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/blog', csrfProtect, blogRoutes);
  app.use('/api/cv', csrfProtect, cvRoutes);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.use('/', seoRoutes);

  return app;
}


