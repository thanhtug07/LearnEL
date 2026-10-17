import { describe, it, expect } from 'vitest';
import {
  generatePersonalizedPlan,
  calculateEstimatedStudyWeeks,
  CEFR_DETAILS
} from '../src/services/studyPlanService';
import {
  TEST_TOEIC_2SKILLS_100Q,
  TEST_TOEIC_2SKILLS_VOL2_100Q,
  TEST_TOEIC_4SKILLS_200Q,
  TEST_IELTS_CUSTOM_100Q
} from '../src/data/blueprints';
import {
  STANDARDIZED_CEFR_BENCHMARK_TESTS
} from '../src/data/cefr/cefrBenchmarkTests';
import {
  INITIAL_COURSES,
  INITIAL_VOCABULARY,
  INITIAL_GRAMMAR_TOPICS,
  INITIAL_WRITING_PROMPTS,
  INITIAL_SPEAKING_TOPICS
} from '../src/data/seedData';
import { DEFAULT_USER } from '../src/context/AppContext';
import { evaluateTestSubmission } from '../src/utils/examEngine';
import { UserProfile, TestAttempt } from '../src/types';

describe('LingoPeak Complete English Platform End-to-End Verification', () => {
  describe('1. Dynamic CEFR Personalized Learning Path', () => {
    it('creates customized roadmap for beginner learner (A1 to B1 Communication)', () => {
      const user: UserProfile = {
        ...DEFAULT_USER,
        level: 'A1',
        targetExam: 'COMMUNICATION',
        targetScore: 'B1 Fluency',
        dailyMinutesGoal: 30
      };

      const plan = generatePersonalizedPlan(
        user,
        INITIAL_COURSES,
        [],
        INITIAL_VOCABULARY,
        INITIAL_GRAMMAR_TOPICS
      );

      expect(plan.currentLevel).toBe('A1');
      expect(plan.targetExam).toBe('COMMUNICATION');
      expect(plan.milestones.length).toBeGreaterThanOrEqual(3);
      expect(plan.milestones[0].titleVi).toContain('Nền Tảng Phản Xạ');
      expect(plan.dailyTasks.length).toBeGreaterThanOrEqual(3);
      expect(plan.targetCompletionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('creates advanced roadmap for IELTS learner (B2 to Band 7.5+)', () => {
      const user: UserProfile = {
        ...DEFAULT_USER,
        level: 'B2',
        targetExam: 'IELTS',
        targetScore: 'Band 7.5',
        dailyMinutesGoal: 45
      };

      const plan = generatePersonalizedPlan(
        user,
        INITIAL_COURSES,
        [],
        INITIAL_VOCABULARY,
        INITIAL_GRAMMAR_TOPICS
      );

      expect(plan.targetExam).toBe('IELTS');
      expect(plan.milestones[1].titleVi).toContain('IELTS');
      expect(plan.dailyTasks.some((t) => t.category === 'exam' && t.actionTab === 'ielts')).toBe(true);
    });

    it('creates career-focused roadmap for TOEIC candidate (A2 to 850+)', () => {
      const user: UserProfile = {
        ...DEFAULT_USER,
        level: 'A2',
        targetExam: 'TOEIC',
        targetScore: '850+',
        dailyMinutesGoal: 60
      };

      const plan = generatePersonalizedPlan(
        user,
        INITIAL_COURSES,
        [],
        INITIAL_VOCABULARY,
        INITIAL_GRAMMAR_TOPICS
      );

      expect(plan.targetExam).toBe('TOEIC');
      expect(plan.milestones[1].titleVi).toContain('TOEIC');
      expect(plan.dailyTasks.some((t) => t.category === 'exam' && t.actionTab === 'toeic')).toBe(true);
    });
  });

  describe('2. Standardized IELTS and TOEIC Blueprint Tests', () => {
    it('verifies TOEIC 2 Skills 100Q blueprint integrity (50 LC + 50 RC, 120 mins)', () => {
      expect(TEST_TOEIC_2SKILLS_100Q.totalQuestions).toBe(100);
      expect(TEST_TOEIC_2SKILLS_100Q.questions.length).toBe(100);
      expect(TEST_TOEIC_2SKILLS_100Q.durationMinutes).toBe(120);
      expect(TEST_TOEIC_2SKILLS_100Q.blueprint?.blueprintId).toBe('toeic_2skills');
    });

    it('verifies TOEIC 4 Skills 200Q blueprint integrity (50 LC + 50 RC + 50 Spk + 50 Wri)', () => {
      expect(TEST_TOEIC_4SKILLS_200Q.totalQuestions).toBe(200);
      expect(TEST_TOEIC_4SKILLS_200Q.questions.length).toBe(200);
      expect(TEST_TOEIC_4SKILLS_200Q.durationMinutes).toBe(200);
      expect(TEST_TOEIC_4SKILLS_200Q.blueprint?.blueprintId).toBe('toeic_4skills');
    });

    it('verifies IELTS Custom Simulation 100Q blueprint (25 LC + 25 RC + 25 Wri + 25 Spk)', () => {
      expect(TEST_IELTS_CUSTOM_100Q.totalQuestions).toBe(100);
      expect(TEST_IELTS_CUSTOM_100Q.questions.length).toBe(100);
      expect(TEST_IELTS_CUSTOM_100Q.durationMinutes).toBe(150);
      expect(TEST_IELTS_CUSTOM_100Q.blueprint?.blueprintId).toBe('ielts_custom_mock');
      expect(TEST_IELTS_CUSTOM_100Q.blueprint?.officialDisclaimer).toBeDefined();
    });

    it('correctly executes full exam submission and computes accurate scores', () => {
      // Simulate answer key for first 5 questions of TOEIC test
      const test = TEST_TOEIC_2SKILLS_100Q;
      const userAnswers: Record<string, number> = {};
      test.questions.slice(0, 5).forEach((q) => {
        userAnswers[q.id] = q.correctAnswerIndex ?? 0;
      });

      const submission = evaluateTestSubmission(
        test,
        userAnswers,
        1800, // 30 minutes
        []
      );

      expect(submission.totalQuestions).toBe(test.questions.length);
      expect(submission.score).toBe(5);
      expect(submission.accuracy).toBe(5);
      expect(submission.timeSpentSeconds).toBeGreaterThan(0);
    });
  });

  describe('3. Standardized CEFR A1-C2 Benchmark Suite', () => {
    it('contains all 6 CEFR benchmark tests (A1, A2, B1, B2, C1, C2)', () => {
      expect(STANDARDIZED_CEFR_BENCHMARK_TESTS.length).toBe(6);
      const levels = STANDARDIZED_CEFR_BENCHMARK_TESTS.map((t) => t.targetLevel);
      expect(levels).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
    });

    it('ensures each CEFR benchmark question has valid options and Vietnamese explanation', () => {
      STANDARDIZED_CEFR_BENCHMARK_TESTS.forEach((test) => {
        expect(test.questions.length).toBeGreaterThanOrEqual(10);
        test.questions.forEach((q) => {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(typeof q.correctAnswerIndex).toBe('number');
          expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
          expect(q.explanationVi || q.explanation).toBeTruthy();
        });
      });
    });
  });

  describe('4. Writing and Speaking Multi-Skill Coverage', () => {
    it('includes varied writing prompts across IELTS Task 1, Task 2 and TOEIC', () => {
      expect(INITIAL_WRITING_PROMPTS.length).toBeGreaterThanOrEqual(4);
      expect(INITIAL_WRITING_PROMPTS.some((p) => p.category === 'IELTS_TASK_1')).toBe(true);
      expect(INITIAL_WRITING_PROMPTS.some((p) => p.category === 'IELTS_TASK_2')).toBe(true);
      expect(INITIAL_WRITING_PROMPTS.some((p) => p.category === 'TOEIC_EMAIL')).toBe(true);
      expect(INITIAL_WRITING_PROMPTS.some((p) => p.category === 'TOEIC_ESSAY')).toBe(true);
    });

    it('includes speaking topics across IELTS Part 1, Part 2, TOEIC, and Workplace roleplay', () => {
      expect(INITIAL_SPEAKING_TOPICS.length).toBeGreaterThanOrEqual(4);
      expect(INITIAL_SPEAKING_TOPICS.some((t) => t.part === 'ielts_part1')).toBe(true);
      expect(INITIAL_SPEAKING_TOPICS.some((t) => t.part === 'ielts_part2')).toBe(true);
      expect(INITIAL_SPEAKING_TOPICS.some((t) => t.part === 'toeic_part5')).toBe(true);
      expect(INITIAL_SPEAKING_TOPICS.some((t) => t.part === 'daily_roleplay')).toBe(true);
    });
  });
});
