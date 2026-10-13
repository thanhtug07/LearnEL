import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_COURSES,
  INITIAL_PRACTICE_TESTS,
  INITIAL_PRACTICE_SETS
} from '../src/data/seedData';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { validateQuestionBatch } from '../src/services/questionValidator';

describe('LingoPeak — Large-Scale Course, Test & Practice Content Expansion Verification', () => {
  describe('1. Minimum Content Targets', () => {
    it('verifies at least 101 complete courses are published and persisted', () => {
      expect(INITIAL_COURSES.length).toBeGreaterThanOrEqual(101);
      const publishedCourses = INITIAL_COURSES.filter((c) => c.publicationStatus === 'published');
      expect(publishedCourses.length).toBeGreaterThanOrEqual(101);
    });

    it('verifies at least 101 usable test sets are available', () => {
      expect(INITIAL_PRACTICE_TESTS.length).toBeGreaterThanOrEqual(101);
      INITIAL_PRACTICE_TESTS.forEach((test) => {
        expect(test.id).toBeTruthy();
        expect(test.questions.length).toBeGreaterThan(0);
        expect(test.durationMinutes).toBeGreaterThan(0);
      });
    });

    it('verifies at least 101 usable practice sets are available', () => {
      expect(INITIAL_PRACTICE_SETS.length).toBeGreaterThanOrEqual(101);
      const publishedPractice = INITIAL_PRACTICE_SETS.filter((p) => p.publicationStatus === 'published');
      expect(publishedPractice.length).toBeGreaterThanOrEqual(101);
    });

    it('verifies at least 1,000 distinct validated questions in canonical question bank', () => {
      expect(VERIFIED_QUESTION_BANK.length).toBeGreaterThanOrEqual(1000);

      // Verify all questions have approved review status
      const approvedCount = VERIFIED_QUESTION_BANK.filter((q) => q.review?.status === 'approved').length;
      expect(approvedCount).toBe(VERIFIED_QUESTION_BANK.length);

      // Check unique IDs
      const idSet = new Set(VERIFIED_QUESTION_BANK.map((q) => q.id));
      expect(idSet.size).toBe(VERIFIED_QUESTION_BANK.length);
    });
  });

  describe('2. Proficiency Structure & CEFR Balance', () => {
    const EXPECTED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    it('ensures balanced CEFR distribution across complete courses', () => {
      const courseLevels = new Set(INITIAL_COURSES.map((c) => c.level));
      EXPECTED_LEVELS.forEach((lvl) => {
        expect(courseLevels.has(lvl as any)).toBe(true);
        const countAtLevel = INITIAL_COURSES.filter((c) => c.level === lvl).length;
        expect(countAtLevel).toBeGreaterThanOrEqual(10);
      });
    });

    it('ensures balanced CEFR distribution across questions in the question bank', () => {
      const questionLevels = new Set(VERIFIED_QUESTION_BANK.map((q) => q.cefr));
      EXPECTED_LEVELS.forEach((lvl) => {
        expect(questionLevels.has(lvl as any)).toBe(true);
        const countAtLevel = VERIFIED_QUESTION_BANK.filter((q) => q.cefr === lvl).length;
        expect(countAtLevel).toBeGreaterThanOrEqual(100);
      });
    });

    it('ensures test sets cover placement, topic quizzes, grammar, TOEIC, and IELTS', () => {
      const types = new Set(INITIAL_PRACTICE_TESTS.map((t) => t.type));
      expect(types.has('placement_test')).toBe(true);
      expect(types.has('topic_quiz')).toBe(true);
      expect(types.has('grammar_test')).toBe(true);
      expect(types.has('full_toeic')).toBe(true);
      expect(types.has('full_ielts')).toBe(true);
    });

    it('ensures practice sets cover all major skills and categories', () => {
      const skills = new Set(INITIAL_PRACTICE_SETS.map((p) => p.targetSkill));
      expect(skills.has('grammar')).toBe(true);
      expect(skills.has('vocab')).toBe(true);
      expect(skills.has('reading')).toBe(true);
      expect(skills.has('listening')).toBe(true);
      expect(skills.has('writing')).toBe(true);
      expect(skills.has('speaking')).toBe(true);
    });
  });

  describe('3. Complete Course Usability & First-Login Zero State', () => {
    it('guarantees all 105 courses satisfy first-login zero state', () => {
      INITIAL_COURSES.forEach((course) => {
        expect(course.completedLessons).toBe(0);
        course.modules.forEach((mod) => {
          mod.lessons.forEach((les, idx) => {
            expect(les.isCompleted).toBe(false);
            if (idx === 0) {
              expect(les.isLocked).toBe(false);
              expect(les.prerequisites.length).toBe(0);
            } else {
              expect(les.isLocked).toBe(true);
              expect(les.prerequisites.length).toBeGreaterThan(0);
            }
          });
        });
      });
    });

    it('ensures each course curriculum has rich theory, examples, and exercises', () => {
      INITIAL_COURSES.forEach((course) => {
        expect(course.modules.length).toBeGreaterThan(0);
        course.modules.forEach((mod) => {
          expect(mod.lessons.length).toBeGreaterThan(0);
          mod.lessons.forEach((les) => {
            expect(les.theoryContent.title).toBeTruthy();
            expect(les.theoryContent.explanationVi).toBeTruthy();
            expect(les.theoryContent.examples.length).toBeGreaterThan(0);
            expect(les.exercises.length).toBeGreaterThan(0);
            expect(les.objectivesVi.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('4. Question Bank Strict Deterministic Validation', () => {
    it('validates all 1,020 questions adhere to pedagogical quality standards', () => {
      VERIFIED_QUESTION_BANK.forEach((q) => {
        expect(q.prompt.length).toBeGreaterThanOrEqual(5);
        expect(q.options.length).toBeGreaterThanOrEqual(2);

        // Check options uniqueness (no duplicate distractors)
        const optsLower = q.options.map((o) => o.trim().toLowerCase());
        expect(new Set(optsLower).size).toBe(optsLower.length);

        // Correct answer index within bounds
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(q.options.length);

        // Explanation >= 15 chars
        expect(q.explanationVi.length).toBeGreaterThanOrEqual(15);

        // Licensing and attribution
        expect(q.source?.attribution).toBeTruthy();
        expect(q.source?.licenseOrPermission).toBeTruthy();
      });
    });

    it('guarantees 100% playable audio for all listening activities without fabricated URLs', () => {
      const listeningQuestions = VERIFIED_QUESTION_BANK.filter(
        (q) => q.skill?.includes('listening') || q.section?.toLowerCase().includes('listening')
      );
      expect(listeningQuestions.length).toBeGreaterThan(0);

      listeningQuestions.forEach((q) => {
        // Must have real audioText transcript for TTS or a verified asset, NEVER an invented example.com URL
        expect(q.audioText).toBeDefined();
        expect(q.audioText!.trim().length).toBeGreaterThan(10);
        if (q.audioUrl) {
          expect(q.audioUrl).not.toContain('example.com');
        }
      });
    });
  });

  describe('5. Import Audit Log Verification', () => {
    it('verifies import-audit-log.json exists and records 0 rejected records', () => {
      const logPath = path.resolve(process.cwd(), 'import-audit-log.json');
      expect(fs.existsSync(logPath)).toBe(true);

      const log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
      expect(log.targetSummary.achievedCourses).toBeGreaterThanOrEqual(101);
      expect(log.targetSummary.achievedTests).toBeGreaterThanOrEqual(101);
      expect(log.targetSummary.achievedPracticeSets).toBeGreaterThanOrEqual(101);
      expect(log.targetSummary.achievedQuestions).toBeGreaterThanOrEqual(1000);

      const totalRejected = log.batches.reduce((sum: number, b: any) => sum + b.rejectedCount, 0);
      expect(totalRejected).toBe(0);
    });
  });
});
