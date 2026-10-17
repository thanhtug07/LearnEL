import { describe, it, expect } from 'vitest';
import {
  STANDARDIZED_CEFR_BENCHMARK_TESTS,
  CEFR_A1_QUESTIONS,
  CEFR_A2_QUESTIONS,
  CEFR_B1_QUESTIONS,
  CEFR_B2_QUESTIONS,
  CEFR_C1_QUESTIONS,
  CEFR_C2_QUESTIONS,
  ALL_CEFR_BENCHMARK_QUESTIONS
} from '../src/data/cefr/cefrBenchmarkTests';
import {
  generateCefrExam,
  isPlaceholderQuestion,
  normalizePrompt
} from '../src/utils/cefrExamGenerator';
import { loadExamSession, saveExamSession, clearExamSession, ExamSession } from '../src/utils/examEngine';

describe('TASK 3: CEFR-Aligned Exam Levels & Validation Suite', () => {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

  // 1. Level Classification & Benchmark Presence
  it('should have dedicated, distinct benchmark tests for all 6 CEFR levels (A1 to C2)', () => {
    expect(STANDARDIZED_CEFR_BENCHMARK_TESTS.length).toBe(6);

    levels.forEach((lvl) => {
      const test = STANDARDIZED_CEFR_BENCHMARK_TESTS.find((t) => t.targetLevel === lvl);
      expect(test).toBeDefined();
      expect(test?.totalQuestions).toBe(10);
      expect(test?.questions.length).toBe(10);

      // Verify no mixing of CEFR levels in the test
      test?.questions.forEach((q) => {
        const qLevel = q.cefrLevel || q.cefr;
        expect(qLevel).toBe(lvl);
      });
    });
  });

  // 2. Strict Metadata & Resource Alignment
  it('should verify every question has complete, non-generic metadata matching CEFR requirements', () => {
    ALL_CEFR_BENCHMARK_QUESTIONS.forEach((q) => {
      // Must not be placeholder/synthetic content
      expect(isPlaceholderQuestion(q)).toBe(false);

      // Must have valid ID and prompt
      expect(q.id).toBeTruthy();
      expect(q.prompt).toBeTruthy();

      // CEFR Level & Exam Type
      expect(q.cefrLevel).toBeDefined();
      expect(q.cefr).toBe(q.cefrLevel);
      expect(q.examType).toBe('cefr_benchmark');
      expect(q.difficulty).toBeDefined();

      // Topic, Source & Explanation
      expect(q.topic).toBeTruthy();
      expect(q.sourceId).toBeTruthy();
      expect(q.explanationVi).toBeTruthy();

      // Options & Answer Key
      expect(q.options.length).toBeGreaterThanOrEqual(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(q.options.length);

      // Resource-dependent checks
      if (q.skill === 'listening') {
        expect(q.audioText || q.audioId).toBeTruthy();
      }
      if (q.skill === 'reading') {
        expect(q.contextPassage || q.passageId).toBeTruthy();
      }
    });
  });

  // 3. Question Uniqueness (distinguishing IDs vs Content)
  it('should have strictly unique IDs and distinct prompt contents with 0 duplicates', () => {
    const idSet = new Set<string>();
    const promptSet = new Map<string, string>();

    ALL_CEFR_BENCHMARK_QUESTIONS.forEach((q) => {
      // Check ID
      expect(idSet.has(q.id)).toBe(false);
      idSet.add(q.id);

      // Check Content
      const norm = normalizePrompt(q.prompt);
      expect(promptSet.has(norm)).toBe(false);
      promptSet.set(norm, q.id);
    });

    expect(idSet.size).toBe(60);
    expect(promptSet.size).toBe(60);
  });

  // 4. CEFR Exam Generation Engine Rules
  it('should strictly select matching CEFR questions and reject cross-level mixing', () => {
    const result = generateCefrExam({
      level: 'A1',
      targetCount: 5,
      questionBank: ALL_CEFR_BENCHMARK_QUESTIONS
    });

    expect(result.status).toBe('ready');
    expect(result.test).toBeDefined();
    expect(result.test?.questions.length).toBe(5);
    expect(result.targetLevel).toBe('A1');

    result.test?.questions.forEach((q) => {
      expect(q.cefrLevel).toBe('A1');
    });
  });

  // 5. Deficit Reporting (Honesty Requirement)
  it('should accurately report deficit when question bank is insufficient instead of fabricating fake data', () => {
    // Request 50 questions when only 10 authentic questions exist for C2
    const result = generateCefrExam({
      level: 'C2',
      targetCount: 50,
      questionBank: ALL_CEFR_BENCHMARK_QUESTIONS
    });

    expect(result.status).toBe('insufficient_questions');
    expect(result.requestedCount).toBe(50);
    expect(result.availableCount).toBe(10);
    expect(result.deficitCount).toBe(40);
    expect(result.deficitBySkill).toBeDefined();
    expect(result.messageVi).toContain('Ngân hàng câu hỏi hiện có 10 câu hợp lệ cho cấp độ C2');
    expect(result.messageVi).toContain('Không tự ý sinh dữ liệu giả lập');
  });

  // 6. Test-In-Progress Question Preservation
  it('should preserve the exact questions array across exam session lifecycle', () => {
    const dummyTest = STANDARDIZED_CEFR_BENCHMARK_TESTS[0];
    const sessionKey = dummyTest.id;

    clearExamSession(sessionKey);

    const sessionToSave: ExamSession = {
      testId: dummyTest.id,
      startedAt: Date.now(),
      durationMinutes: 20,
      targetEndTime: Date.now() + 20 * 60 * 1000,
      userAnswers: { 'cefr-a1-q01': 1 },
      flaggedQuestions: ['cefr-a1-q02'],
      currentIndex: 1,
      isSubmitted: false,
      questionIds: dummyTest.questions.map((q) => q.id),
      selectedQuestions: dummyTest.questions
    };

    saveExamSession(sessionToSave);

    const reloaded = loadExamSession(sessionKey);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.questionIds).toEqual(dummyTest.questions.map((q) => q.id));
    expect(reloaded?.selectedQuestions?.length).toBe(dummyTest.questions.length);
    expect(reloaded?.selectedQuestions?.[0].id).toBe(dummyTest.questions[0].id);

    clearExamSession(sessionKey);
  });
});
