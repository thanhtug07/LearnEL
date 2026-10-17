import { describe, it, expect } from 'vitest';
import {
  classifyTestCategory,
  isTestValidAndAuthentic,
  computeCategoryInventories,
  PRACTICE_HUB_CATEGORIES
} from '../src/services/examPipelineService';
import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import {
  TEST_TOEIC_2SKILLS_100Q,
  TEST_TOEIC_4SKILLS_200Q,
  TEST_IELTS_CUSTOM_100Q
} from '../src/data/blueprints';

describe('Task 5: Exam Practice Hub Rebuild & Category Inventory Suite', () => {
  it('defines the 10 distinct test categories matching blueprint specifications', () => {
    expect(PRACTICE_HUB_CATEGORIES.length).toBe(10);
    expect(PRACTICE_HUB_CATEGORIES).toEqual([
      'toeic_2skills',
      'toeic_4skills',
      'ielts_academic',
      'ielts_general',
      'cefr_a1',
      'cefr_a2',
      'cefr_b1',
      'cefr_b2',
      'cefr_c1',
      'cefr_c2'
    ]);
  });

  it('correctly classifies standard blueprint exams into target categories', () => {
    expect(classifyTestCategory(TEST_TOEIC_2SKILLS_100Q)).toBe('toeic_2skills');
    expect(classifyTestCategory(TEST_TOEIC_4SKILLS_200Q)).toBe('toeic_4skills');
    expect(classifyTestCategory(TEST_IELTS_CUSTOM_100Q)).toBe('ielts_academic');
  });

  it('verifies authenticity and distinguishes genuine tests from synthetic placeholders', () => {
    // Standard blueprint tests must be strictly valid
    expect(isTestValidAndAuthentic(TEST_TOEIC_2SKILLS_100Q)).toBe(true);
    expect(isTestValidAndAuthentic(TEST_TOEIC_4SKILLS_200Q)).toBe(true);
    expect(isTestValidAndAuthentic(TEST_IELTS_CUSTOM_100Q)).toBe(true);

    // Synthetic test with repetitive dummy options should fail authenticity
    const dummyTest = {
      ...TEST_TOEIC_2SKILLS_100Q,
      id: 'dummy-placeholder-exam',
      questions: [
        {
          id: 'dummy-q1',
          questionNumber: 1,
          section: 'Reading',
          prompt: 'Select correct word',
          text: 'Select correct word',
          category: 'grammar',
          options: [
            'Option A: Valid accurate lexical item',
            'Option B: Distractor item',
            'Option C: Alternative item',
            'Option D: Secondary item'
          ],
          correctAnswerIndex: 0,
          explanationVi: 'Explanation',
          cefrLevel: 'B1' as const,
          skill: 'toeic_reading' as const
        }
      ]
    };
    expect(isTestValidAndAuthentic(dummyTest)).toBe(false);
  });

  it('computes transparent inventories without faking numbers or fabricating data', () => {
    const inventories = computeCategoryInventories(INITIAL_PRACTICE_TESTS);
    const categoryList = Object.values(inventories).filter((i) => i.key !== 'all');

    // Must have all 10 categories
    expect(categoryList.length).toBe(10);

    categoryList.forEach((inv) => {
      // Every category has a goal of 50 exams
      expect(inv.targetGoal).toBe(50);
      expect(inv.deficit).toBe(Math.max(0, 50 - inv.validCount));
      expect(inv.validCount + inv.deficit).toBeGreaterThanOrEqual(50);
    });

    // Specific check for IELTS General Training: honest 0 count and marked not ready
    const ieltsGeneral = inventories['ielts_general'];
    expect(ieltsGeneral).toBeDefined();
    expect(ieltsGeneral.validCount).toBe(0);
    expect(ieltsGeneral.deficit).toBe(50);
    expect(ieltsGeneral.isReady).toBe(false);
    expect(ieltsGeneral.statusTextVi).toContain('Chưa sẵn sàng');

    // Specific check for TOEIC 2 Skills & 4 Skills
    const toeic2 = inventories['toeic_2skills'];
    expect(toeic2).toBeDefined();
    expect(toeic2.validCount).toBeGreaterThanOrEqual(3);
    expect(toeic2.isReady).toBe(true);

    const toeic4 = inventories['toeic_4skills'];
    expect(toeic4).toBeDefined();
    expect(toeic4.validCount).toBeGreaterThanOrEqual(1);
    expect(toeic4.isReady).toBe(true);
  });

  it('ensures each practice test has valid exam parameters (duration, question count, CEFR)', () => {
    INITIAL_PRACTICE_TESTS.forEach((test) => {
      expect(test.id).toBeDefined();
      expect(test.id.length).toBeGreaterThan(0);
      expect(test.title).toBeDefined();
      expect(test.title.length).toBeGreaterThan(0);
      expect(test.durationMinutes).toBeGreaterThan(0);
      expect(test.totalQuestions).toBeGreaterThan(0);
      expect(test.questions.length).toBeGreaterThan(0);
      expect(test.targetLevel).toBeDefined();
    });
  });

  it('ensures no duplicate test IDs across INITIAL_PRACTICE_TESTS', () => {
    const seenIds = new Set<string>();
    INITIAL_PRACTICE_TESTS.forEach((test) => {
      expect(seenIds.has(test.id)).toBe(false);
      seenIds.add(test.id);
    });
  });
});
