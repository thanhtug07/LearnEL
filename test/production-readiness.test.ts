import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, resetRateLimits } from '../server';
import fs from 'fs';
import path from 'path';

describe('Production Readiness & Deployment Verification Suite', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalAiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalAiKey) {
      process.env.GEMINI_API_KEY = originalAiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('1. Health Check & Dependency Readiness (/api/health)', () => {
    it('returns honest degraded status when server is up but GEMINI_API_KEY is not configured', async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.health).toBe('degraded');
      expect(res.body.checks).toBeDefined();
      expect(res.body.checks.server.status).toBe('up');
      expect(res.body.checks.dependencies.geminiAi.status).toBe('offline_fallback');
      expect(typeof res.body.checks.server.uptimeSeconds).toBe('number');
      expect(res.body.checks.server.memory).toBeDefined();
    });

    it('returns healthy status when GEMINI_API_KEY is provided and static assets exist', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key-prod';

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.health).toBe('healthy');
      expect(res.body.status).toBe('ok');
      expect(res.body.checks.dependencies.geminiAi.status).toBe('connected');
    });

    it('returns 503 unhealthy in production mode if dist/index.html is missing', async () => {
      process.env.NODE_ENV = 'production';
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const res = await request(app).get('/api/health');

      expect(res.status).toBe(503);
      expect(res.body.health).toBe('unhealthy');
      expect(res.body.checks.staticAssets.status).toBe('missing_build');
    });
  });

  describe('2. Security & CORS Headers Enforcement', () => {
    it('sets hardened security headers on API responses', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });

    it('handles CORS OPTIONS preflight request with 204 No Content', async () => {
      const res = await request(app)
        .options('/api/ai/chat')
        .set('Origin', 'https://lingopeak.web.app')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBeDefined();
      expect(res.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('3. Sanitized Error Handling (No Stack Trace Leakage)', () => {
    it('handles invalid malformed payloads gracefully without exposing internal stack traces', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Content-Type', 'application/json')
        .send({ mode: 'invalid_mode_never_exists', message: 'Hello' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      // Ensure stack trace is not leaked in response body
      expect(res.body.stack).toBeUndefined();
      expect(res.body.trace).toBeUndefined();
    });
  });

  describe('4. Rate Limiting Protection', () => {
    it('throttles rapid abusive requests to prevent resource exhaustion', async () => {
      const ip = '198.51.100.42';

      // Send 35 requests to /api/ai/chat (limit is 30/minute)
      let throttled = false;
      for (let i = 0; i < 35; i++) {
        const res = await request(app)
          .post('/api/ai/chat')
          .set('x-forwarded-for', ip)
          .send({ mode: 'conversation', message: 'test rate limit' });

        if (res.status === 429) {
          throttled = true;
          expect(res.body.error).toContain('Quá nhiều yêu cầu');
          break;
        }
      }

      expect(throttled).toBe(true);
    });
  });

  describe('5. SPA Static Build & Template Integrity', () => {
    it('verifies SPA template or dist/ contains valid HTML root container', () => {
      const templateFile = path.resolve(__dirname, '../index.html');
      const distIndex = path.resolve(__dirname, '../dist/index.html');
      const targetFile = fs.existsSync(distIndex) ? distIndex : templateFile;

      expect(fs.existsSync(targetFile)).toBe(true);
      const htmlContent = fs.readFileSync(targetFile, 'utf-8');
      expect(htmlContent).toContain('<div id="root">');
      expect(htmlContent.toLowerCase()).toContain('<!doctype html>');
    });
  });
});
