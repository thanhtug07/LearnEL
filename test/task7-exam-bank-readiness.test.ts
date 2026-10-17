import { describe, it, expect } from 'vitest';
import { validateAllExams, CATEGORY_BLUEPRINTS, EXAM_TARGET_GOAL } from '../scripts/validate-exam-bank-readiness';
import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { loadExamSession, saveExamSession, groupQuestionsBySection } from '../src/utils/examEngine';

describe('Task 7: Exam Bank Actual Counts & Blueprint Readiness Verification Suite', () => {
  it('1. Correctly audits all categories and produces transparent deficit metrics', () => {
    const { results, categorySummary, isAllPassed } = validateAllExams();

    expect(results.length).toBe(INITIAL_PRACTICE_TESTS.length);
    expect(isAllPassed).toBe(false); // Accurately reports that target 50 is not yet reached across all categories

    // Check TOEIC 2 Skills
    const toeic2Summary = categorySummary['toeic_2skills'];
    expect(toeic2Summary).toBeDefined();
    expect(toeic2Summary.targetExams).toBe(50);
    expect(toeic2Summary.compliantExamsCount).toBeGreaterThanOrEqual(1);
    expect(toeic2Summary.deficitCount).toBeLessThanOrEqual(49);

    // Check TOEIC 4 Skills
    const toeic4Summary = categorySummary['toeic_4skills'];
    expect(toeic4Summary).toBeDefined();
    expect(toeic4Summary.targetExams).toBe(50);
    expect(toeic4Summary.compliantExamsCount).toBeGreaterThanOrEqual(1);

    // Check IELTS Academic
    const ieltsSummary = categorySummary['ielts_academic'];
    expect(ieltsSummary).toBeDefined();
    expect(ieltsSummary.compliantExamsCount).toBeGreaterThanOrEqual(1);

    // Check IELTS General Training is BLOCKED / 0
    const ieltsGenSummary = categorySummary['ielts_general'];
    expect(ieltsGenSummary).toBeDefined();
    expect(ieltsGenSummary.compliantExamsCount).toBe(0);
    expect(ieltsGenSummary.status).toBe('BLOCKED');
  });

  it('2. Confirms compliant exams satisfy 100% blueprint requirements without placeholder questions', () => {
    const { results } = validateAllExams();
    const compliantExams = results.filter((r) => r.isFullyCompliant);

    expect(compliantExams.length).toBeGreaterThanOrEqual(3);

    compliantExams.forEach((exam) => {
      expect(exam.placeholderQuestionsCount).toBe(0);
      expect(exam.hasAudioWhenRequired).toBe(true);
      expect(exam.allAnswersValid).toBe(true);
      expect(exam.hasRubricWhenRequired).toBe(true);
      expect(exam.hasNoInternalDuplicates).toBe(true);
      expect(exam.failureReasons.length).toBe(0);
    });
  });

  it('3. Verifies full-length exams load completely into ExamEngine without question truncation', () => {
    // Test TOEIC 2 Skills (100 Questions)
    const toeic2Exam = INITIAL_PRACTICE_TESTS.find((t) => t.id === 'test-toeic-2skills-standard-100');
    expect(toeic2Exam).toBeDefined();
    expect(toeic2Exam!.questions.length).toBe(100);

    const sections2 = groupQuestionsBySection(toeic2Exam!.questions);
    expect(sections2.length).toBeGreaterThanOrEqual(2);
    const totalGroupedQuestions = sections2.reduce((acc, s) => acc + s.questions.length, 0);
    expect(totalGroupedQuestions).toBe(100);

    // Test TOEIC 4 Skills (200 Questions)
    const toeic4Exam = INITIAL_PRACTICE_TESTS.find((t) => t.id === 'test-toeic-4skills-complete-200');
    expect(toeic4Exam).toBeDefined();
    expect(toeic4Exam!.questions.length).toBe(200);

    const sections4 = groupQuestionsBySection(toeic4Exam!.questions);
    expect(sections4.length).toBeGreaterThanOrEqual(4);
    expect(sections4.reduce((acc, s) => acc + s.questions.length, 0)).toBe(200);

    // Test IELTS Custom (100 Items)
    const ieltsExam = INITIAL_PRACTICE_TESTS.find((t) => t.id === 'test-ielts-custom-mock-100');
    expect(ieltsExam).toBeDefined();
    expect(ieltsExam!.questions.length).toBe(100);
  });

  it('4. Rejects synthetic placeholder questions from counting as valid blueprint exams', () => {
    const { results } = validateAllExams();
    const expandedTests = results.filter((r) => r.testId.startsWith('test-expanded-'));

    // All expanded template tests must be flagged as non-compliant due to placeholder content or insufficient length
    expandedTests.forEach((t) => {
      expect(t.isFullyCompliant).toBe(false);
      expect(t.placeholderQuestionsCount).toBeGreaterThan(0);
    });
  });
});
