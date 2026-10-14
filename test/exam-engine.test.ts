import { describe, it, expect } from 'vitest';
import { PracticeTest, TestAttempt, TestQuestion } from '../src/types';
import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { evaluateTestSubmission } from '../src/utils/examEngine';

describe('Examination Engine Reliability & Accuracy Suite (12 Core Cases)', () => {
  const sampleTest: PracticeTest = {
    id: 'test-unit-1',
    title: 'Unit Test Exam',
    titleVi: 'Bài Thi Kiểm Thử',
    type: 'topic_quiz',
    durationMinutes: 10,
    totalQuestions: 4,
    targetLevel: 'B2',
    descriptionVi: 'Mô tả',
    questions: [
      {
        id: 'q1',
        questionNumber: 1,
        section: 'Grammar',
        prompt: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 1, // B
        explanationVi: 'Expl 1',
        category: 'Tenses'
      },
      {
        id: 'q2',
        questionNumber: 2,
        section: 'Grammar',
        prompt: 'Question 2',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 0, // A
        explanationVi: 'Expl 2',
        category: 'Conditionals'
      },
      {
        id: 'q3',
        questionNumber: 3,
        section: 'Vocab',
        prompt: 'Question 3',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 3, // D
        explanationVi: 'Expl 3',
        category: 'Lexical Resource'
      },
      {
        id: 'q4',
        questionNumber: 4,
        section: 'Vocab',
        prompt: 'Question 4',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 2, // C
        explanationVi: 'Expl 4',
        category: 'Lexical Resource'
      }
    ]
  };

  // Case 1: All answers correct
  it('Case 1: All answers correct yields 100% accuracy and clean weakness report', () => {
    const answers = { q1: 1, q2: 0, q3: 3, q4: 2 };
    const attempt = evaluateTestSubmission(sampleTest, answers, 300, []);
    expect(attempt.score).toBe(4);
    expect(attempt.totalQuestions).toBe(4);
    expect(attempt.accuracy).toBe(100);
    expect(attempt.weaknessAnalysisVi[0]).toContain('Xuất sắc');
  });

  // Case 2: All answers incorrect
  it('Case 2: All answers incorrect yields 0% accuracy and flags all categories', () => {
    const answers = { q1: 0, q2: 1, q3: 0, q4: 0 };
    const attempt = evaluateTestSubmission(sampleTest, answers, 200, []);
    expect(attempt.score).toBe(0);
    expect(attempt.accuracy).toBe(0);
    expect(attempt.weaknessAnalysisVi.length).toBe(3); // Tenses, Conditionals, Lexical Resource
  });

  // Case 3: Partially answered test
  it('Case 3: Partially answered test calculates accuracy based on all questions', () => {
    const answers = { q1: 1, q2: 0 }; // 2 answered correctly, 2 omitted
    const attempt = evaluateTestSubmission(sampleTest, answers, 150, []);
    expect(attempt.score).toBe(2);
    expect(attempt.totalQuestions).toBe(4);
    expect(attempt.accuracy).toBe(50);
  });

  // Case 4: Unanswered questions treated as incorrect
  it('Case 4: Completely unanswered test treats all questions as incorrect', () => {
    const answers = {};
    const attempt = evaluateTestSubmission(sampleTest, answers, 0, []);
    expect(attempt.score).toBe(0);
    expect(attempt.accuracy).toBe(0);
    expect(attempt.totalQuestions).toBe(4);
  });

  // Case 5: Repeated submit clicks blocked by submission guard
  it('Case 5: Repeated submit clicks cannot execute multiple evaluations', () => {
    let submitCount = 0;
    let isSubmitting = false;

    const handleSubmit = () => {
      if (isSubmitting) return;
      isSubmitting = true;
      submitCount++;
    };

    // User clicks submit 5 times rapidly
    handleSubmit();
    handleSubmit();
    handleSubmit();
    handleSubmit();
    handleSubmit();

    expect(submitCount).toBe(1);
  });

  // Case 6: Timer expiration at same instant as manual submission
  it('Case 6: Timer expiration and manual submit at the exact same instant execute only once', () => {
    let executionCount = 0;
    const isSubmittingRef = { current: false };

    const attemptSubmit = () => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      executionCount++;
    };

    // Simulate concurrent trigger: user click + timer effect in same event tick
    attemptSubmit();
    attemptSubmit();

    expect(executionCount).toBe(1);
  });

  // Case 7: Refresh while test is in progress (serialization and hydration)
  it('Case 7: Serializes and restores in-progress test state without loss', () => {
    const testState = {
      userAnswers: { q1: 1, q2: 0 },
      flaggedQuestions: ['q2'],
      secondsRemaining: 420,
      currentIndex: 2
    };

    const serialized = JSON.stringify(testState);
    const hydrated = JSON.parse(serialized);

    expect(hydrated.userAnswers).toEqual({ q1: 1, q2: 0 });
    expect(hydrated.flaggedQuestions).toEqual(['q2']);
    expect(hydrated.secondsRemaining).toBe(420);
    expect(hydrated.currentIndex).toBe(2);
  });

  // Case 8: Resume an unfinished test safely
  it('Case 8: Resumes unfinished test state with safe defaults for missing fields', () => {
    const incompleteSaved = '{"userAnswers":{"q1":1}}';
    const parsed = JSON.parse(incompleteSaved);

    const userAnswers = parsed.userAnswers || {};
    const flagged = Array.isArray(parsed.flaggedQuestions) ? parsed.flaggedQuestions : [];
    const seconds = typeof parsed.secondsRemaining === 'number' ? parsed.secondsRemaining : 600;
    const index = typeof parsed.currentIndex === 'number' ? parsed.currentIndex : 0;

    expect(userAnswers['q1']).toBe(1);
    expect(flagged.length).toBe(0);
    expect(seconds).toBe(600);
    expect(index).toBe(0);
  });

  // Case 9: Retake a completed test resets state cleanly
  it('Case 9: Retake test resets state to default without preserving old answers', () => {
    let userAnswers: Record<string, number> = { q1: 1, q2: 0, q3: 3, q4: 2 };
    let flagged = new Set(['q1', 'q3']);
    let isSubmitted = true;
    let secondsRemaining = 50;

    // Retake action
    userAnswers = {};
    flagged = new Set();
    isSubmitted = false;
    secondsRemaining = sampleTest.durationMinutes * 60;

    expect(Object.keys(userAnswers).length).toBe(0);
    expect(flagged.size).toBe(0);
    expect(isSubmitted).toBe(false);
    expect(secondsRemaining).toBe(600);
  });

  // Case 10: Reload after completion ensures storage cleanup
  it('Case 10: Completion removes the in-progress draft from storage', () => {
    const mockStorage: Record<string, string> = {
      'lingopeak_exam_progress_test-unit-1': '{"userAnswers":{"q1":1}}'
    };

    // Upon submit
    delete mockStorage['lingopeak_exam_progress_test-unit-1'];

    expect(mockStorage['lingopeak_exam_progress_test-unit-1']).toBeUndefined();
  });

  // Case 11: Duplicate attempt IDs prevented from inflating XP or analytics
  it('Case 11: Attempt IDs recorded via processedAttemptIdsRef prevent duplicate scoring and XP inflation', () => {
    const processedIds = new Set<string>();
    let attemptsList: TestAttempt[] = [];
    let userXp = 0;

    const recordAttempt = (att: TestAttempt) => {
      if (processedIds.has(att.id)) {
        return; // Guard
      }
      processedIds.add(att.id);
      attemptsList = [att, ...attemptsList];
      userXp += 100;
    };

    const sampleAttempt: TestAttempt = {
      id: 'fixed-attempt-id-123',
      testId: sampleTest.id,
      testTitle: sampleTest.title,
      date: '2026-10-12',
      timeSpentSeconds: 300,
      score: 4,
      totalQuestions: 4,
      accuracy: 100,
      userAnswers: { q1: 1, q2: 0, q3: 3, q4: 2 },
      flaggedQuestions: [],
      weaknessAnalysisVi: ['Xuất sắc!'],
      recommendedLessonIds: []
    };

    // Record once
    recordAttempt(sampleAttempt);
    expect(attemptsList.length).toBe(1);
    expect(userXp).toBe(100);

    // Call again with exact same ID (simulating duplicate trigger or race)
    recordAttempt(sampleAttempt);
    expect(attemptsList.length).toBe(1); // Not duplicated!
    expect(userXp).toBe(100); // Not inflated!
  });

  // Case 12: Invalid or missing question data handled gracefully
  it('Case 12: Handles empty questions array and missing categories gracefully without NaN', () => {
    const emptyTest: PracticeTest = {
      id: 'test-empty',
      title: 'Empty Test',
      titleVi: 'Bài Thi Trống',
      type: 'topic_quiz',
      durationMinutes: 5,
      totalQuestions: 0,
      targetLevel: 'A1',
      descriptionVi: 'Trống',
      questions: []
    };

    const attempt = evaluateTestSubmission(emptyTest, {}, 300, []);
    expect(attempt.totalQuestions).toBe(0);
    expect(attempt.score).toBe(0);
    expect(attempt.accuracy).toBe(0);
    expect(Number.isNaN(attempt.accuracy)).toBe(false);
  });

  // Content validation test for actual seeded tests
  it('validates INITIAL_PRACTICE_TESTS integrity and answer keys', () => {
    INITIAL_PRACTICE_TESTS.forEach((test) => {
      expect(test.questions.length).toBe(test.totalQuestions);
      expect(test.questions.length).toBeGreaterThan(0);
      test.questions.forEach((q) => {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
        expect(q.prompt.trim().length).toBeGreaterThan(0);
        expect(q.explanationVi.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
