import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, resetRateLimits } from '../server';

describe('Gemini AI Integration, Endpoint Validation & Fallback Suite', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
    // Default to offline/demo mode for deterministic offline testing without external quota consumption
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalApiKey) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('1. Secret Exposure Prevention', () => {
    it('does not expose GEMINI_API_KEY to frontend code or client bundles', () => {
      const clientEnv = (import.meta as any).env || {};
      expect(clientEnv.GEMINI_API_KEY).toBeUndefined();
      expect(clientEnv.VITE_GEMINI_API_KEY).toBeUndefined();
    });
  });

  describe('2. AI Status Endpoint (/api/ai/status)', () => {
    it('returns missing_api_key when key is not configured', async () => {
      delete process.env.GEMINI_API_KEY;
      const res = await request(app).get('/api/ai/status');
      expect(res.status).toBe(200);
      expect(res.body.configured).toBe(false);
      expect(res.body.model).toBe('gemini-3.8-flash');
      expect(res.body.status).toBe('missing_api_key');
    });

    it('returns ready when key is configured', async () => {
      process.env.GEMINI_API_KEY = 'test-valid-key-format';
      const res = await request(app).get('/api/ai/status');
      expect(res.status).toBe(200);
      expect(res.body.configured).toBe(true);
      expect(res.body.status).toBe('ready');
    });
  });

  describe('3. Chat Endpoint Payload Validation (/api/ai/chat)', () => {
    it('rejects missing or non-array messages payload with 400', async () => {
      const res1 = await request(app).post('/api/ai/chat').send({});
      expect(res1.status).toBe(400);
      expect(res1.body.error).toContain('"messages" must be a non-empty array');
      expect(res1.body.isFallback).toBe(true);

      const res2 = await request(app).post('/api/ai/chat').send({ messages: 'not an array' });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toContain('"messages" must be a non-empty array');
    });

    it('rejects empty messages array with 400', async () => {
      const res = await request(app).post('/api/ai/chat').send({ messages: [] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('"messages" must be a non-empty array');
    });

    it('rejects oversized chat history exceeding 25 messages with 400', async () => {
      const oversizedMessages = Array.from({ length: 26 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'model',
        content: `Message ${i}`
      }));

      const res = await request(app).post('/api/ai/chat').send({ messages: oversizedMessages });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Exceeded maximum allowed message history');
    });
  });

  describe('4. AI Tutor Modes & Controlled Offline Fallbacks', () => {
    const modes = [
      'conversation',
      'grammar',
      'vocabulary',
      'writing',
      'speaking',
      'ielts',
      'toeic',
      'advisor'
    ] as const;

    for (const mode of modes) {
      it(`serves pedagogically grounded fallback for mode: ${mode} when offline`, async () => {
        delete process.env.GEMINI_API_KEY;
        const res = await request(app)
          .post('/api/ai/chat')
          .send({
            mode,
            messages: [{ role: 'user', content: 'Làm thế nào để cải thiện kỹ năng này?' }],
            userLevel: 'B2',
            targetExam: 'IELTS'
          });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('content');
        expect(res.body.content.length).toBeGreaterThan(20);
        expect(res.body.isFallback).toBe(true);
        expect(res.body.provider).toBe('offline-rule-based');
      });
    }

    it('strictly ensures fallback responses are never falsely marked as successful live AI', async () => {
      delete process.env.GEMINI_API_KEY;
      const res = await request(app)
        .post('/api/ai/chat')
        .send({
          mode: 'grammar',
          messages: [{ role: 'user', content: 'Giải thích câu đảo ngữ.' }]
        });

      expect(res.status).toBe(200);
      expect(res.body.isFallback).toBe(true);
      expect(res.body.provider).toBe('offline-rule-based');
    });
  });

  describe('5. Writing Feedback Endpoint Validation (/api/ai/writing-feedback)', () => {
    it('rejects missing or blank text payload with 400', async () => {
      const res1 = await request(app).post('/api/ai/writing-feedback').send({});
      expect(res1.status).toBe(400);
      expect(res1.body.error).toContain('"text" must be a non-empty string');

      const res2 = await request(app).post('/api/ai/writing-feedback').send({ text: '    ' });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toContain('"text" must be a non-empty string');
    });

    it('rejects submission exceeding 8000 characters limit with 400', async () => {
      const hugeText = 'a'.repeat(8500);
      const res = await request(app).post('/api/ai/writing-feedback').send({ text: hugeText });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Text length exceeds maximum allowed limit');
    });

    it('evaluates valid writing submission and returns structured feedback schema in offline mode', async () => {
      delete process.env.GEMINI_API_KEY;
      const essay =
        'In recent years, distance learning has become increasingly popular across the world. Although some critics argue that online education lacks face-to-face interaction, I believe that its flexibility and accessibility offer greater advantages for working students.';

      const res = await request(app)
        .post('/api/ai/writing-feedback')
        .send({
          text: essay,
          prompt: 'Discuss advantages and disadvantages of distance learning.',
          taskType: 'essay',
          targetBand: '7.5'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('estimatedScore');
      expect(res.body).toHaveProperty('wordCount');
      expect(res.body.wordCount).toBeGreaterThan(20);
      expect(res.body).toHaveProperty('summary');
      expect(Array.isArray(res.body.grammarFeedback)).toBe(true);
      expect(Array.isArray(res.body.vocabularyFeedback)).toBe(true);
      expect(res.body).toHaveProperty('coherenceFeedback');
      expect(res.body.isFallback).toBe(true);
    });
  });
});
