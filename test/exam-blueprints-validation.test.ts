import { describe, it, expect } from 'vitest';
import {
  TEST_TOEIC_2SKILLS_100Q,
  TEST_TOEIC_4SKILLS_200Q,
  TEST_IELTS_CUSTOM_100Q
} from '../src/data/blueprints';

describe('Standardized Exam Blueprints Validation Suite (TOEIC & IELTS)', () => {
  it('Validates TOEIC 2 Skills Blueprint (100 Questions: 50 Listening, 50 Reading)', () => {
    const exam = TEST_TOEIC_2SKILLS_100Q;
    expect(exam.totalQuestions).toBe(100);
    expect(exam.questions.length).toBe(100);

    const listeningItems = exam.questions.filter((q) => q.skill === 'toeic_listening');
    const readingItems = exam.questions.filter((q) => q.skill === 'toeic_reading');

    expect(listeningItems.length).toBe(50);
    expect(readingItems.length).toBe(50);

    // Audio text & explanation checks
    listeningItems.forEach((q) => {
      expect(q.audioText).toBeDefined();
      expect(q.audioText!.trim().length).toBeGreaterThan(10);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.explanationVi.trim().length).toBeGreaterThan(0);
    });

    readingItems.forEach((q) => {
      expect(q.options.length).toBe(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctAnswerIndex).toBeLessThan(4);
      expect(q.explanationVi.trim().length).toBeGreaterThan(0);
    });

    // Check unique IDs
    const idSet = new Set(exam.questions.map((q) => q.id));
    expect(idSet.size).toBe(100);
  });

  it('Validates TOEIC 4 Skills Blueprint (200 Items: 50 L, 50 R, 50 S, 50 W)', () => {
    const exam = TEST_TOEIC_4SKILLS_200Q;
    expect(exam.totalQuestions).toBe(200);
    expect(exam.questions.length).toBe(200);

    const listening = exam.questions.filter((q) => q.skill === 'toeic_listening');
    const reading = exam.questions.filter((q) => q.skill === 'toeic_reading');
    const speaking = exam.questions.filter((q) => q.skill === 'speaking');
    const writing = exam.questions.filter((q) => q.skill === 'writing');

    expect(listening.length).toBe(50);
    expect(reading.length).toBe(50);
    expect(speaking.length).toBe(50);
    expect(writing.length).toBe(50);

    // Speaking tasks quality
    speaking.forEach((task) => {
      expect(task.itemType).toBe('speaking_recording');
      expect(task.speakingPrepSeconds).toBeGreaterThan(0);
      expect(task.speakingRecordSeconds).toBeGreaterThan(0);
      expect(task.rubric).toBeDefined();
      expect(task.rubric!.criteria.length).toBeGreaterThanOrEqual(2);
      expect(task.rubric!.totalPoints).toBeGreaterThanOrEqual(6);
      expect(task.explanationVi.trim().length).toBeGreaterThan(0);
    });

    // Writing tasks quality
    writing.forEach((task) => {
      expect(task.itemType).toBe('essay');
      expect(task.targetWordCount).toBeDefined();
      expect(task.targetWordCount!.min).toBeGreaterThan(0);
      expect(task.rubric).toBeDefined();
      expect(task.rubric!.criteria.length).toBeGreaterThanOrEqual(2);
      expect(task.rubric!.totalPoints).toBeGreaterThanOrEqual(6);
      expect(task.explanationVi.trim().length).toBeGreaterThan(0);
    });

    // Unique IDs check
    const idSet = new Set(exam.questions.map((q) => q.id));
    expect(idSet.size).toBe(200);
  });

  it('Validates IELTS Custom Practice Blueprint (100 Items: 25 L, 25 R, 25 W, 25 S)', () => {
    const exam = TEST_IELTS_CUSTOM_100Q;
    expect(exam.totalQuestions).toBe(100);
    expect(exam.questions.length).toBe(100);

    // Check mandatory official disclaimer
    expect(exam.blueprint?.officialDisclaimer).toBeDefined();
    expect(exam.blueprint!.officialDisclaimer).toContain('LingoPeak');

    const listening = exam.questions.filter((q) => q.skill === 'ielts_listening');
    const reading = exam.questions.filter((q) => q.skill === 'ielts_reading');
    const writing = exam.questions.filter((q) => q.skill === 'ielts_writing');
    const speaking = exam.questions.filter((q) => q.skill === 'ielts_speaking');

    expect(listening.length).toBe(25);
    expect(reading.length).toBe(25);
    expect(writing.length).toBe(25);
    expect(speaking.length).toBe(25);

    // Listening items have audioText
    listening.forEach((q) => {
      expect(q.audioText).toBeDefined();
      expect(q.audioText!.trim().length).toBeGreaterThan(20);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.explanationVi.trim().length).toBeGreaterThan(0);
    });

    // Reading passages
    reading.forEach((q) => {
      expect(q.contextPassage).toBeDefined();
      expect(q.contextPassage!.trim().length).toBeGreaterThan(50);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(q.explanationVi.trim().length).toBeGreaterThan(0);
    });

    // Writing rubrics (IELTS 4 criteria)
    writing.forEach((task) => {
      expect(task.itemType).toBe('essay');
      expect(task.targetWordCount!.min).toBeGreaterThanOrEqual(150);
      expect(task.rubric).toBeDefined();
      expect(task.rubric!.criteria.length).toBe(4);
    });

    // Speaking rubrics (IELTS 4 criteria)
    speaking.forEach((task) => {
      expect(task.itemType).toBe('speaking_recording');
      expect(task.rubric).toBeDefined();
      expect(task.rubric!.criteria.length).toBe(4);
    });

    // Unique IDs check
    const idSet = new Set(exam.questions.map((q) => q.id));
    expect(idSet.size).toBe(100);
  });
});
