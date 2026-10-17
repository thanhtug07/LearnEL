import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { isPlaceholderQuestion } from '../src/utils/cefrExamGenerator';
import { classifyTestCategory } from '../src/services/examPipelineService';
import {
  generateQuestionExactHash,
  computeJaccardSimilarity
} from '../src/services/multiSourcePipeline';
import { TestQuestion } from '../src/types';

interface ExamInspection {
  id: string;
  title: string;
  category: string;
  targetLevel: string;
  durationMinutes: number;
  declaredQuestionsCount: number;
  actualQuestionsCount: number;
  validQuestionsCount: number;
  placeholderQuestionsCount: number;
  blueprintRequiredCount: number;
  isBlueprintMet: boolean;
  listeningWithAudio: number;
  readingWithContent: number;
  speakingWithRubric: number;
  writingWithRubric: number;
  invalidAnswersCount: number;
  internalDuplicatesCount: number;
}

const CATEGORY_BLUEPRINTS: Record<string, { name: string; targetExams: number; questionsPerExam: number }> = {
  toeic_2skills: { name: 'TOEIC 2 Skills (LR)', targetExams: 50, questionsPerExam: 100 },
  toeic_4skills: { name: 'TOEIC 4 Skills (LRSW)', targetExams: 50, questionsPerExam: 200 },
  ielts_academic: { name: 'IELTS Academic', targetExams: 50, questionsPerExam: 100 },
  ielts_general: { name: 'IELTS General Training', targetExams: 50, questionsPerExam: 100 },
  cefr_a1: { name: 'CEFR A1', targetExams: 50, questionsPerExam: 30 },
  cefr_a2: { name: 'CEFR A2', targetExams: 50, questionsPerExam: 30 },
  cefr_b1: { name: 'CEFR B1', targetExams: 50, questionsPerExam: 30 },
  cefr_b2: { name: 'CEFR B2', targetExams: 50, questionsPerExam: 30 },
  cefr_c1: { name: 'CEFR C1', targetExams: 50, questionsPerExam: 30 },
  cefr_c2: { name: 'CEFR C2', targetExams: 50, questionsPerExam: 30 }
};

console.log('========================================================================================');
console.log('                      TASK 7: COMPREHENSIVE EXAM BANK INVENTORY AUDIT                   ');
console.log('========================================================================================\n');

const inspections: ExamInspection[] = [];
const categoryStats: Record<string, { declaredExams: number; fullyValidExams: number; examsMeetingBlueprint: number }> = {};

Object.keys(CATEGORY_BLUEPRINTS).forEach((k) => {
  categoryStats[k] = { declaredExams: 0, fullyValidExams: 0, examsMeetingBlueprint: 0 };
});

for (const test of INITIAL_PRACTICE_TESTS) {
  const cat = classifyTestCategory(test);
  if (!categoryStats[cat]) {
    categoryStats[cat] = { declaredExams: 0, fullyValidExams: 0, examsMeetingBlueprint: 0 };
  }
  categoryStats[cat].declaredExams++;

  const bp = CATEGORY_BLUEPRINTS[cat] || { targetExams: 50, questionsPerExam: test.totalQuestions || 30 };
  const questions: TestQuestion[] = test.questions || [];
  const actualCount = questions.length;

  let placeholderCount = 0;
  let listeningWithAudio = 0;
  let readingWithContent = 0;
  let speakingWithRubric = 0;
  let writingWithRubric = 0;
  let invalidAnswers = 0;

  const seenHashes = new Set<string>();
  let internalDups = 0;

  for (const q of questions) {
    if (isPlaceholderQuestion(q)) {
      placeholderCount++;
    }

    const hash = generateQuestionExactHash(q);
    if (seenHashes.has(hash)) {
      internalDups++;
    } else {
      seenHashes.add(hash);
    }

    // Skill checks
    const s = (q.skill || q.section || '').toLowerCase();
    if (s.includes('listen')) {
      if (q.audioText || q.audioUrl) listeningWithAudio++;
    } else if (s.includes('read') || s.includes('gram') || s.includes('voc')) {
      if (q.prompt || q.contextPassage) readingWithContent++;
    } else if (s.includes('speak')) {
      if (q.rubric || q.speakingPrepSeconds || q.speakingRecordSeconds) speakingWithRubric++;
    } else if (s.includes('writ')) {
      if (q.rubric || q.targetWordCount) writingWithRubric++;
    }

    // Answer checks
    if (q.options && q.options.length > 0) {
      if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.options.length) {
        invalidAnswers++;
      }
    }
  }

  const validQuestions = actualCount - placeholderCount;
  const isFullyValid = actualCount > 0 && placeholderCount === 0 && invalidAnswers === 0 && internalDups === 0;
  const isBlueprintMet = isFullyValid && actualCount >= bp.questionsPerExam;

  if (isFullyValid) categoryStats[cat].fullyValidExams++;
  if (isBlueprintMet) categoryStats[cat].examsMeetingBlueprint++;

  inspections.push({
    id: test.id,
    title: test.title,
    category: cat,
    targetLevel: test.targetLevel || '',
    durationMinutes: test.durationMinutes,
    declaredQuestionsCount: test.totalQuestions,
    actualQuestionsCount: actualCount,
    validQuestionsCount: validQuestions,
    placeholderQuestionsCount: placeholderCount,
    blueprintRequiredCount: bp.questionsPerExam,
    isBlueprintMet,
    listeningWithAudio,
    readingWithContent,
    speakingWithRubric,
    writingWithRubric,
    invalidAnswersCount: invalidAnswers,
    internalDuplicatesCount: internalDups
  });
}

console.log('SUMMARY TABLE BY CATEGORY:');
console.log('-------------------------------------------------------------------------------------------------------------------------');
console.log(
  'Category'.padEnd(25) +
    'Target'.padEnd(8) +
    'Declared'.padEnd(10) +
    'Blueprint Met'.padEnd(16) +
    'Valid Exams'.padEnd(14) +
    'Req Qs/Exam'.padEnd(14) +
    'Deficit'.padEnd(10) +
    'Status'
);
console.log('-------------------------------------------------------------------------------------------------------------------------');

let overallPass = true;

Object.entries(CATEGORY_BLUEPRINTS).forEach(([catKey, bp]) => {
  const stats = categoryStats[catKey] || { declaredExams: 0, fullyValidExams: 0, examsMeetingBlueprint: 0 };
  const deficit = Math.max(0, bp.targetExams - stats.examsMeetingBlueprint);
  const status = deficit === 0 ? 'PASS' : 'FAIL (Deficit ' + deficit + ')';
  if (deficit > 0) overallPass = false;

  console.log(
    bp.name.padEnd(25) +
      String(bp.targetExams).padEnd(8) +
      String(stats.declaredExams).padEnd(10) +
      String(stats.examsMeetingBlueprint).padEnd(16) +
      String(stats.fullyValidExams).padEnd(14) +
      String(bp.questionsPerExam).padEnd(14) +
      String(deficit).padEnd(10) +
      status
  );
});
console.log('-------------------------------------------------------------------------------------------------------------------------\n');

console.log('DETAILED BREAKDOWN OF CURRENT BLUEPRINT DEFICITS:');
inspections
  .filter((i) => i.isBlueprintMet)
  .forEach((i) => {
    console.log(`[PASS] ${i.category.toUpperCase()} | ID: ${i.id} | Total Qs: ${i.actualQuestionsCount} (100% Genuine, 0 placeholders)`);
  });

console.log('\nEXAMS NOT MEETING BLUEPRINTS:');
const failed = inspections.filter((i) => !i.isBlueprintMet);
console.log(`Total non-compliant / placeholder / incomplete exams: ${failed.length} / ${inspections.length}`);

console.log('\nOVERALL TASK 7 COMPLIANCE STATUS: ' + (overallPass ? 'PASS' : 'FAIL - ACTION REQUIRED'));
