import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app';

describe('health', () => {
  const app = buildApp();
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});


