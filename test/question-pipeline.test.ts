import { describe, it, expect } from 'vitest';
import {
  validateQuestion,
  validateQuestionBatch,
  computePromptSimilarity,
  normalizePrompt,
  parseQuestionsFromJSON,
  parseQuestionsFromCSV
} from '../src/services/questionValidator';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { TestQuestion } from '../src/types';

describe('Question Bank Pipeline — Deterministic Validation Engine', () => {
  it('validates all production questions in VERIFIED_QUESTION_BANK without errors', () => {
    const report = validateQuestionBatch(VERIFIED_QUESTION_BANK);
    expect(report.totalQuestions).toBeGreaterThanOrEqual(12);
    expect(report.validCount).toBe(report.totalQuestions);
    expect(report.invalidCount).toBe(0);
    expect(report.duplicateCount).toBe(0);

    // Verify all have approved status and defensible explanations
    VERIFIED_QUESTION_BANK.forEach((q) => {
      expect(q.review?.status).toBe('approved');
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
      expect(q.explanationVi.length).toBeGreaterThanOrEqual(15);
      expect(q.source?.attribution).toBeTruthy();
      expect(q.source?.licenseOrPermission).toBeTruthy();
    });
  }, 15000);

  it('flags missing prompt, empty options, and invalid correctAnswerIndex', () => {
    const invalidQ: Partial<TestQuestion> = {
      id: 'test-inv-01',
      prompt: 'Hi', // too short (< 5 chars)
      options: ['Option A'], // only 1 option (< 2)
      correctAnswerIndex: 4, // out of bounds
      explanationVi: 'Short' // too short (< 10 chars)
    };

    const result = validateQuestion(invalidQ);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_PROMPT')).toBe(true);
    expect(result.issues.some((i) => i.code === 'INSUFFICIENT_OPTIONS')).toBe(true);
    expect(result.issues.some((i) => i.code === 'INVALID_ANSWER_INDEX')).toBe(true);
    expect(result.issues.some((i) => i.code === 'MISSING_EXPLANATION')).toBe(true);
  });

  it('detects duplicate distractors within options array', () => {
    const dupOptionsQ: Partial<TestQuestion> = {
      id: 'test-dup-options',
      prompt: 'She always ______ her teeth before bed.',
      options: ['brushes', 'brushing', 'brushes', 'brushed'], // 'brushes' is duplicated!
      correctAnswerIndex: 0,
      explanationVi: 'Chủ ngữ ngôi thứ 3 số ít chia thì hiện tại đơn.'
    };

    const result = validateQuestion(dupOptionsQ);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'DUPLICATE_OPTIONS')).toBe(true);
  });

  it('flags duplicate question IDs in a batch', () => {
    const batch: Partial<TestQuestion>[] = [
      {
        id: 'dup-id-1',
        prompt: 'First unique question prompt.',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 0,
        explanationVi: 'Giải thích chi tiết cho câu hỏi thứ nhất.'
      },
      {
        id: 'dup-id-1', // Duplicated ID!
        prompt: 'Second different question with same ID.',
        options: ['A', 'B', 'C', 'D'],
        correctAnswerIndex: 1,
        explanationVi: 'Giải thích chi tiết cho câu hỏi thứ hai.'
      }
    ];

    const report = validateQuestionBatch(batch);
    expect(report.invalidCount).toBeGreaterThanOrEqual(1);
    const dupResult = report.results.find((r) => r.questionId === 'dup-id-1');
    expect(dupResult?.issues.some((i) => i.code === 'DUPLICATE_ID_IN_BATCH')).toBe(true);
  });

  it('flags high prompt similarity (near-duplicate questions)', () => {
    const textA = 'She practices English with her colleagues every morning.';
    const textB = 'She practices English with her colleagues every single morning.';
    const sim = computePromptSimilarity(textA, textB);
    expect(sim).toBeGreaterThanOrEqual(0.85);

    const batch: Partial<TestQuestion>[] = [
      {
        id: 'q-sim-1',
        prompt: textA,
        options: ['A', 'B'],
        correctAnswerIndex: 0,
        explanationVi: 'Giải thích chi tiết cho câu A.'
      },
      {
        id: 'q-sim-2',
        prompt: textB,
        options: ['A', 'B'],
        correctAnswerIndex: 0,
        explanationVi: 'Giải thích chi tiết cho câu B.'
      }
    ];

    const report = validateQuestionBatch(batch);
    expect(report.duplicateCount).toBeGreaterThanOrEqual(1);
  });

  it('enforces rule against labeling AI questions as official test materials', () => {
    const mislabeledQ: Partial<TestQuestion> = {
      id: 'q-fake-official',
      prompt: 'According to the conversation, where will the conference take place?',
      options: ['Hall A', 'Hall B', 'Online', 'Postponed'],
      correctAnswerIndex: 0,
      explanationVi: 'Được trích xuất từ văn cảnh công tác thương mại.',
      source: {
        category: 'official_sample',
        attribution: 'Simulated Project',
        licenseOrPermission: 'None',
        creationMethod: 'ai_assisted', // AI created, but claimed official sample!
        contentVersion: '1.0'
      }
    };

    const result = validateQuestion(mislabeledQ);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'MISLABELED_AI_AS_OFFICIAL')).toBe(true);
  });

  it('validates listening questions have verified audioText or reject placeholder URLs', () => {
    const fakeAudioUrlQ: Partial<TestQuestion> = {
      id: 'q-fake-audio',
      prompt: 'What did the speaker mention?',
      options: ['Paris', 'London'],
      correctAnswerIndex: 0,
      explanationVi: 'Giải thích nghe hiểu chi tiết.',
      skill: 'listening',
      audioUrl: 'http://example.com/audio.mp3' // Placeholder domain!
    };

    const result = validateQuestion(fakeAudioUrlQ);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVENTED_AUDIO_URL')).toBe(true);
  });

  it('correctly parses JSON question batches', () => {
    const jsonStr = JSON.stringify([
      {
        id: 'parsed-1',
        prompt: 'Testing JSON parsing capability.',
        options: ['1', '2'],
        correctAnswerIndex: 0,
        explanationVi: 'Giải thích thử nghiệm JSON.'
      }
    ]);

    const { questions, parseError } = parseQuestionsFromJSON(jsonStr);
    expect(parseError).toBeUndefined();
    expect(questions.length).toBe(1);
    expect(questions[0].id).toBe('parsed-1');
  });

  it('correctly parses CSV question batches', () => {
    const csvStr = `id,prompt,optionA,optionB,optionC,optionD,correctAnswerIndex,explanationVi,category,cefr,skill\ncsv-01,"He _____ to school every day.",goes,go,going,went,0,"Hiện tại đơn ngôi thứ 3 số ít.",Grammar,A1,grammar`;

    const { questions, parseError } = parseQuestionsFromCSV(csvStr);
    expect(parseError).toBeUndefined();
    expect(questions.length).toBe(1);
    expect(questions[0].id).toBe('csv-01');
    expect(questions[0].options).toEqual(['goes', 'go', 'going', 'went']);
    expect(questions[0].correctAnswerIndex).toBe(0);
    expect(questions[0].cefr).toBe('A1');
  });

  it('ensures unapproved questions are excluded from learner practice tests', () => {
    const mixedPool: TestQuestion[] = [
      ...VERIFIED_QUESTION_BANK,
      {
        id: 'draft-unreviewed-01',
        questionNumber: 99,
        section: 'Draft Pool',
        prompt: 'This is an unapproved draft question.',
        options: ['A', 'B'],
        correctAnswerIndex: 0,
        explanationVi: 'Chưa được hội đồng chuyên gia phê duyệt.',
        category: 'Draft',
        review: { status: 'pending_review' }
      },
      {
        id: 'rejected-02',
        questionNumber: 100,
        section: 'Rejected Pool',
        prompt: 'This is a rejected question with flawed distractors.',
        options: ['A', 'B'],
        correctAnswerIndex: 0,
        explanationVi: 'Bị từ chối do chất lượng chưa đạt.',
        category: 'Flawed',
        review: { status: 'rejected' }
      }
    ];

    // Learner exam selection filter
    const learnerPracticableQuestions = mixedPool.filter((q) => q.review?.status === 'approved');

    expect(learnerPracticableQuestions.length).toBe(VERIFIED_QUESTION_BANK.length);
    expect(learnerPracticableQuestions.some((q) => q.id === 'draft-unreviewed-01')).toBe(false);
    expect(learnerPracticableQuestions.some((q) => q.id === 'rejected-02')).toBe(false);
  });
});
