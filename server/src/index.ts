import { buildApp } from './app';
import { loadEnv } from './config/env';
import { logger } from './config/logger';

const env = loadEnv();
const app = buildApp();
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'API server listening');
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());


