import { describe, it, expect } from 'vitest';
import {
  generatePersonalizedPlan,
  calculateEstimatedStudyWeeks,
  CEFR_DETAILS,
  CEFR_ORDER
} from '../src/services/studyPlanService';
import { DEFAULT_USER } from '../src/context/AppContext';
import { INITIAL_COURSES, INITIAL_VOCABULARY, INITIAL_GRAMMAR_TOPICS } from '../src/data/seedData';
import { UserProfile, TestAttempt } from '../src/types';

describe('Study Plan & Personalized Roadmap Service', () => {
  it('correctly maps CEFR hierarchy order', () => {
    expect(CEFR_ORDER.A1).toBe(1);
    expect(CEFR_ORDER.A2).toBe(2);
    expect(CEFR_ORDER.B1).toBe(3);
    expect(CEFR_ORDER.B2).toBe(4);
    expect(CEFR_ORDER.C1).toBe(5);
    expect(CEFR_ORDER.C2).toBe(6);
  });

  it('provides CEFR descriptors and target vocabularies', () => {
    expect(CEFR_DETAILS.A1.targetVocab).toBe(600);
    expect(CEFR_DETAILS.B2.targetVocab).toBe(4000);
    expect(CEFR_DETAILS.C1.targetVocab).toBe(6500);
  });

  it('calculates realistic study weeks based on daily minutes and goals', () => {
    const calc = calculateEstimatedStudyWeeks('A2', 'IELTS', 30);
    expect(calc.totalHours).toBeGreaterThan(0);
    expect(calc.totalWeeks).toBeGreaterThanOrEqual(2);
    expect(calc.completionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('generates a full personalized plan for IELTS student', () => {
    const user: UserProfile = {
      ...DEFAULT_USER,
      level: 'B1',
      targetExam: 'IELTS',
      targetScore: 'Band 7.0',
      dailyMinutesGoal: 45
    };

    const plan = generatePersonalizedPlan(
      user,
      INITIAL_COURSES,
      [],
      INITIAL_VOCABULARY,
      INITIAL_GRAMMAR_TOPICS
    );

    expect(plan.currentLevel).toBe('B1');
    expect(plan.targetExam).toBe('IELTS');
    expect(plan.milestones.length).toBeGreaterThanOrEqual(3);
    expect(plan.dailyTasks.length).toBeGreaterThan(0);
    expect(plan.milestones[0].status).toBe('in_progress');
    expect(plan.milestones[1].status).toBe('upcoming');
    expect(plan.milestones[2].status).toBe('locked');
  });

  it('generates customized TOEIC plan with ETS practice focus', () => {
    const user: UserProfile = {
      ...DEFAULT_USER,
      level: 'A2',
      targetExam: 'TOEIC',
      targetScore: '800+',
      dailyMinutesGoal: 30
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

  it('dynamically computes milestone progress when lessons and tests are completed', () => {
    const user: UserProfile = { ...DEFAULT_USER };
    const coursesCopy = JSON.parse(JSON.stringify(INITIAL_COURSES));
    // Mark first lesson done
    coursesCopy[0].modules[0].lessons[0].isCompleted = true;

    const attempts: TestAttempt[] = [
      {
        id: 'att-1',
        testId: 'test-placement',
        testTitle: 'Placement Test',
        date: new Date().toISOString(),
        score: 85,
        totalQuestions: 20,
        timeSpentSeconds: 900,
        accuracy: 85,
        userAnswers: {},
        flaggedQuestions: [],
        weaknessAnalysisVi: [],
        recommendedLessonIds: []
      }
    ];

    const plan = generatePersonalizedPlan(
      user,
      coursesCopy,
      attempts,
      INITIAL_VOCABULARY,
      INITIAL_GRAMMAR_TOPICS
    );

    expect(plan.milestones[0].progressPercentage).toBeGreaterThan(0);
    expect(plan.overallProgressPercentage).toBeGreaterThan(0);
  });
});
