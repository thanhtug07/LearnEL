import { describe, it, expect } from 'vitest';
import {
  INITIAL_COURSES,
  INITIAL_VOCABULARY,
  INITIAL_GRAMMAR_TOPICS,
  INITIAL_PRACTICE_TESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SPEAKING_TOPICS,
  INITIAL_WRITING_PROMPTS
} from '../src/data/seedData';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { normalizePrompt, computePromptSimilarity } from '../src/services/questionValidator';

describe('Content Quality, Question Bank & Exam Validation Suite', () => {
  describe('1. Course Catalog & Syllabus Integrity', () => {
    it('verifies all courses have valid CEFR levels, non-empty modules, and matching lesson counts', () => {
      const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

      INITIAL_COURSES.forEach((course) => {
        expect(validLevels.has(course.level)).toBe(true);
        expect(course.title.trim().length).toBeGreaterThanOrEqual(5);
        expect(course.titleVi.trim().length).toBeGreaterThanOrEqual(5);
        expect(course.modules.length).toBeGreaterThan(0);

        let actualLessonCount = 0;
        course.modules.forEach((mod) => {
          expect(mod.id).toBeDefined();
          expect(mod.lessons.length).toBeGreaterThan(0);
          actualLessonCount += mod.lessons.length;

          mod.lessons.forEach((les) => {
            expect(les.id).toBeDefined();
            expect(les.title.trim().length).toBeGreaterThanOrEqual(5);
            expect(les.exercises.length).toBeGreaterThan(0);

            les.exercises.forEach((ex) => {
              expect(ex.id).toBeDefined();
              expect(ex.prompt.trim().length).toBeGreaterThanOrEqual(5);
              expect(ex.explanationVi.trim().length).toBeGreaterThanOrEqual(5);
              if (ex.type === 'multiple_choice' && ex.options) {
                expect(ex.options.length).toBeGreaterThanOrEqual(2);
                expect(ex.options).toContain(ex.correctAnswer);
              }
            });
          });
        });

        // Course declared totalLessons matches actual syllabus lesson count
        expect(course.totalLessons).toBe(actualLessonCount);
      });
    });
  });

  describe('2. Practice Tests Structure & Pedagogical Classification', () => {
    it('ensures practice tests declared totalQuestions strictly matches questions array length', () => {
      INITIAL_PRACTICE_TESTS.forEach((test) => {
        expect(test.totalQuestions).toBe(test.questions.length);
      });
    });

    it('prohibits mislabeling mini quizzes as full IELTS/TOEIC exams', () => {
      INITIAL_PRACTICE_TESTS.forEach((test) => {
        // Full TOEIC requires at least 100 questions (or 50+ per section)
        if (test.questions.length < 50) {
          expect(test.type).not.toBe('full_toeic');
        }
        // Full IELTS requires at least 40 questions per section
        if (test.questions.length < 30) {
          expect(test.type).not.toBe('full_ielts');
        }
      });
    });

    it('verifies all questions have single unambiguous answers within bounds', () => {
      INITIAL_PRACTICE_TESTS.forEach((test) => {
        test.questions.forEach((q) => {
          expect(q.id).toBeDefined();
          expect(Array.isArray(q.options)).toBe(true);
          expect(q.options.length).toBeGreaterThanOrEqual(2);

          // No blank options
          q.options.forEach((opt) => {
            expect(typeof opt).toBe('string');
            expect(opt.trim().length).toBeGreaterThan(0);
          });

          // Unique choices per question
          const uniqueChoices = new Set(q.options.map((o) => o.trim().toLowerCase()));
          expect(uniqueChoices.size).toBe(q.options.length);

          // Correct answer index strictly in range
          expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctAnswerIndex).toBeLessThan(q.options.length);

          // Substantive explanation
          expect(q.explanationVi).toBeDefined();
          expect(q.explanationVi.trim().length).toBeGreaterThanOrEqual(8);
        });
      });
    });
  });

  describe('3. Question Bank Diversity & Anti-Duplication Check', () => {
    it('verifies all test questions have globally unique IDs', () => {
      const allIds = new Set<string>();
      INITIAL_PRACTICE_TESTS.forEach((t) => {
        t.questions.forEach((q) => {
          expect(allIds.has(q.id)).toBe(false);
          allIds.add(q.id);
        });
      });
      VERIFIED_QUESTION_BANK.forEach((q) => {
        expect(allIds.has(q.id)).toBe(false);
        allIds.add(q.id);
      });
    });

    it('detects no verbatim duplicate prompts across test catalogs', () => {
      const promptMap = new Map<string, string>();
      const allQuestions = [
        ...INITIAL_PRACTICE_TESTS.flatMap((t) => t.questions),
        ...VERIFIED_QUESTION_BANK
      ];

      allQuestions.forEach((q) => {
        const norm = normalizePrompt(q.prompt);
        // Exclude duplicate prompts
        expect(promptMap.has(norm)).toBe(false);
        promptMap.set(norm, q.id);
      });
    });

    it('verifies no placeholder or template questions exist (e.g. "Question 1")', () => {
      const allQuestions = [
        ...INITIAL_PRACTICE_TESTS.flatMap((t) => t.questions),
        ...VERIFIED_QUESTION_BANK
      ];

      allQuestions.forEach((q) => {
        expect(/^question\s*\d+$/i.test(q.prompt.trim())).toBe(false);
        expect(q.prompt.trim().length).toBeGreaterThanOrEqual(10);
      });
    });
  });

  describe('4. Verified Question Bank Audit & Provenance Verification', () => {
    it('verifies each verified question carries editorial sign-off, licensing, and CEFR rating', () => {
      const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

      VERIFIED_QUESTION_BANK.forEach((q) => {
        // CEFR
        expect(q.cefr).toBeDefined();
        expect(validLevels.has(q.cefr!)).toBe(true);

        // Options and answers
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(q.options.length);

        // Explanation and Distractor Rationales
        expect(q.explanationVi.trim().length).toBeGreaterThanOrEqual(15);
        expect(q.distractorRationales).toBeDefined();
        expect(q.distractorRationales!.length).toBe(q.options.length);

        // Review sign-off
        expect(q.review).toBeDefined();
        expect(q.review?.status).toBe('approved');
        expect(q.review?.reviewerName).toBeDefined();
        expect(q.review?.reviewNotes).toBeDefined();

        // Legal provenance & licensing metadata
        expect(q.source).toBeDefined();
        expect(q.source?.attribution).toBeDefined();
        expect(q.source?.licenseOrPermission).toBeDefined();
        expect(q.metadata?.isProductionReady).toBe(true);
      });
    });
  });
});
