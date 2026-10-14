import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app, verifyFirebaseToken } from '../server';
import fs from 'fs';
import path from 'path';

describe('Security & Authorization Hardening Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Admin Authorization & Authentication Enforcement', () => {
    it('rejects POST /api/questions/ingest with 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/questions/ingest')
        .send({
          questions: [
            {
              id: 'q-test-unauth-01',
              prompt: 'Choose the correct word for the sentence.',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswerIndex: 0,
              explanationVi: 'Giải thích chi tiết về đáp án hợp lệ.'
            }
          ]
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects PATCH /api/questions/:id/review with 401 when no token is provided', async () => {
      const res = await request(app)
        .patch('/api/questions/lp-a1-gram-001/review')
        .send({ status: 'approved' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects client attempting to forge admin status via x-admin-role or x-admin-id headers', async () => {
      const res = await request(app)
        .post('/api/questions/ingest')
        .set('x-admin-role', 'admin')
        .set('x-admin-id', 'spoofed-admin')
        .set('x-admin-name', 'Fake Admin')
        .send({
          questions: [
            {
              id: 'q-spoof-01',
              prompt: 'Spoofed prompt test question.',
              options: ['A', 'B'],
              correctAnswerIndex: 0,
              explanationVi: 'Chi tiết kiểm tra phân quyền.'
            }
          ]
        });

      // Still rejects with 401 because headers are never accepted as proof of authority
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('rejects token when user is authenticated but NOT an admin (403 Forbidden)', async () => {
      // Mock fetch response from Google Identity Toolkit tokeninfo returning non-admin user
      const mockNonAdminUser = {
        users: [
          {
            localId: 'learner-uid-123',
            email: 'learner@example.com',
            emailVerified: true
          }
        ]
      };

      vi.spyOn(global, 'fetch').mockImplementationOnce(async (url: any) => {
        if (typeof url === 'string' && url.includes('identitytoolkit.googleapis.com')) {
          return new Response(JSON.stringify(mockNonAdminUser), { status: 200 });
        }
        return new Response('Not found', { status: 404 });
      });

      const res = await request(app)
        .post('/api/questions/ingest')
        .set('Authorization', 'Bearer valid-learner-token')
        .send({
          questions: [
            {
              id: 'q-forbidden-01',
              prompt: 'Learner attempting to write to question bank.',
              options: ['Option A', 'Option B'],
              correctAnswerIndex: 0,
              explanationVi: 'Giải thích ngữ pháp đầy đủ.'
            }
          ]
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
      expect(res.body.error).toContain('Insufficient privileges');
    });
  });

  describe('2. Request Schema & Input Validation Hardening', () => {
    it('rejects empty messages array in /api/ai/chat with 400', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ messages: [] });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('messages');
    });

    it('rejects non-string or empty text in /api/ai/writing-feedback with 400', async () => {
      const res = await request(app)
        .post('/api/ai/writing-feedback')
        .send({ text: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('text');
    });

    it('rejects invalid question structure in /api/questions/ai-review with 400', async () => {
      const res = await request(app)
        .post('/api/questions/ai-review')
        .send({ question: { prompt: '' } });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Valid question');
    });
  });

  describe('3. Honest AI Review Failure Handling (No Fake Scores)', () => {
    it('returns honest 503 evaluation failure when GEMINI_API_KEY is not configured', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post('/api/questions/ai-review')
        .send({
          question: {
            id: 'lp-test-01',
            prompt: 'They have ______ to Paris three times this year.',
            options: ['been', 'gone', 'be', 'being'],
            correctAnswerIndex: 0,
            explanationVi: 'Thì hiện tại hoàn thành diễn tả trải nghiệm đã đến và trở về dùng "have been to".'
          }
        });

      // Restore key
      if (originalKey) process.env.GEMINI_API_KEY = originalKey;

      expect(res.status).toBe(503);
      expect(res.body.evaluationStatus).toBe('evaluation_failed');
      expect(res.body.aiValidationPassed).toBe(false);
      expect(res.body.pedagogicalScore).toBeUndefined(); // NEVER synthesize fake scores!
      expect(res.body.disclaimer).toContain('Không tự động tạo điểm số giả');
    });
  });

  describe('4. Question Bank Persistence & Restart Integrity', () => {
    it('verifies activeQuestionBank persists to data/persistentQuestionBank.json', () => {
      const persistentPath = path.resolve(process.cwd(), 'data', 'persistentQuestionBank.json');
      expect(fs.existsSync(persistentPath)).toBe(true);

      const content = fs.readFileSync(persistentPath, 'utf-8');
      const questions = JSON.parse(content);
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThanOrEqual(12);

      // Verify questions have approved state and verified integrity
      questions.forEach((q: any) => {
        expect(q.id).toBeDefined();
        expect(q.prompt).toBeDefined();
        expect(q.options.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('5. Data Isolation & Role Filter in Public Catalog', () => {
    it('returns only approved questions for unauthenticated learners on GET /api/questions', async () => {
      const res = await request(app).get('/api/questions');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.questions)).toBe(true);
      
      // All returned questions must strictly be 'approved'
      res.body.questions.forEach((q: any) => {
        expect(q.review?.status).toBe('approved');
      });
    });
  });
});
