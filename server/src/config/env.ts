import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(10).default('dev_jwt_secret_change_me'),
  JWT_REFRESH_SECRET: z.string().min(10).default('dev_refresh_secret_change_me'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  FILE_UPLOAD_DIR: z.string().default('storage/uploads')
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Do not crash if DATABASE_URL missing; only warn
    // eslint-disable-next-line no-console
    console.warn('Invalid env, using defaults where possible:', parsed.error.issues);
  }
  return { ...EnvSchema.parse({}), ...(parsed.success ? parsed.data : {}) } as Env;
}


