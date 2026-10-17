import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { isPlaceholderQuestion } from '../src/utils/cefrExamGenerator';
import { classifyTestCategory, ExamHubCategoryKey } from '../src/services/examPipelineService';
import {
  generateQuestionExactHash,
  computeJaccardSimilarity
} from '../src/services/multiSourcePipeline';
import { TestQuestion, PracticeTest } from '../src/types';

// Blueprint requirements
export const EXAM_TARGET_GOAL = 50;

export const CATEGORY_BLUEPRINTS: Record<
  string,
  {
    nameVi: string;
    targetExams: number;
    requiredQuestions: number;
    skillsBreakdown: Record<string, number>;
  }
> = {
  toeic_2skills: {
    nameVi: 'TOEIC 2 Skills (LR)',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 100,
    skillsBreakdown: { listening: 50, reading: 50 }
  },
  toeic_4skills: {
    nameVi: 'TOEIC 4 Skills (LRSW)',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 200,
    skillsBreakdown: { listening: 50, reading: 50, speaking: 50, writing: 50 }
  },
  ielts_academic: {
    nameVi: 'IELTS Academic',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 100,
    skillsBreakdown: { listening: 25, reading: 25, writing: 25, speaking: 25 }
  },
  ielts_general: {
    nameVi: 'IELTS General Training',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 100,
    skillsBreakdown: { listening: 25, reading: 25, writing: 25, speaking: 25 }
  },
  cefr_a1: {
    nameVi: 'CEFR A1',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  },
  cefr_a2: {
    nameVi: 'CEFR A2',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  },
  cefr_b1: {
    nameVi: 'CEFR B1',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  },
  cefr_b2: {
    nameVi: 'CEFR B2',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  },
  cefr_c1: {
    nameVi: 'CEFR C1',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  },
  cefr_c2: {
    nameVi: 'CEFR C2',
    targetExams: EXAM_TARGET_GOAL,
    requiredQuestions: 30,
    skillsBreakdown: { grammar: 15, reading: 15 }
  }
};

export interface ExamValidationItemResult {
  testId: string;
  testTitle: string;
  category: string;
  totalQuestions: number;
  validQuestionsCount: number;
  placeholderQuestionsCount: number;
  meetsBlueprintLength: boolean;
  hasAudioWhenRequired: boolean;
  hasContextWhenRequired: boolean;
  hasRubricWhenRequired: boolean;
  allAnswersValid: boolean;
  hasNoInternalDuplicates: boolean;
  isFullyCompliant: boolean;
  failureReasons: string[];
}

export function validateAllExams(): {
  results: ExamValidationItemResult[];
  categorySummary: Record<
    string,
    {
      categoryKey: string;
      nameVi: string;
      targetExams: number;
      actualDeclared: number;
      compliantExamsCount: number;
      deficitCount: number;
      status: 'PASS' | 'FAIL' | 'BLOCKED';
    }
  >;
  isAllPassed: boolean;
} {
  const results: ExamValidationItemResult[] = [];
  const categorySummary: Record<string, any> = {};

  Object.entries(CATEGORY_BLUEPRINTS).forEach(([catKey, bp]) => {
    categorySummary[catKey] = {
      categoryKey: catKey,
      nameVi: bp.nameVi,
      targetExams: bp.targetExams,
      actualDeclared: 0,
      compliantExamsCount: 0,
      deficitCount: bp.targetExams,
      status: 'FAIL'
    };
  });

  for (const test of INITIAL_PRACTICE_TESTS) {
    const cat = classifyTestCategory(test);
    if (!categorySummary[cat]) {
      categorySummary[cat] = {
        categoryKey: cat,
        nameVi: cat,
        targetExams: EXAM_TARGET_GOAL,
        actualDeclared: 0,
        compliantExamsCount: 0,
        deficitCount: EXAM_TARGET_GOAL,
        status: 'FAIL'
      };
    }
    categorySummary[cat].actualDeclared++;

    const bp = CATEGORY_BLUEPRINTS[cat] || {
      targetExams: EXAM_TARGET_GOAL,
      requiredQuestions: test.totalQuestions || 30
    };

    const questions: TestQuestion[] = test.questions || [];
    const totalQ = questions.length;
    const failureReasons: string[] = [];

    // Check 1: Length matches blueprint
    const meetsBlueprintLength = totalQ >= bp.requiredQuestions;
    if (!meetsBlueprintLength) {
      failureReasons.push(`Số câu thực tế (${totalQ}) chưa đạt blueprint (${bp.requiredQuestions} câu)`);
    }

    // Check 2: Placeholders
    let placeholderCount = 0;
    let audioValid = true;
    let answersValid = true;
    let rubricValid = true;
    const seenHashes = new Set<string>();
    let hasInternalDups = false;

    for (const q of questions) {
      if (isPlaceholderQuestion(q)) {
        placeholderCount++;
      }

      const hash = generateQuestionExactHash(q);
      if (seenHashes.has(hash)) {
        hasInternalDups = true;
      } else {
        seenHashes.add(hash);
      }

      // Check skill-specific requirements
      const s = (q.skill || q.section || '').toLowerCase();
      if (s.includes('listen')) {
        if (!q.audioText && !q.audioUrl) {
          audioValid = false;
        }
      }
      if (s.includes('speak') || s.includes('writ')) {
        if (!q.rubric && !q.targetWordCount && !q.speakingPrepSeconds) {
          rubricValid = false;
        }
      }

      // Answer key range check
      if (q.options && q.options.length > 0) {
        if (
          typeof q.correctAnswerIndex !== 'number' ||
          q.correctAnswerIndex < 0 ||
          q.correctAnswerIndex >= q.options.length
        ) {
          answersValid = false;
        }
      }
    }

    if (placeholderCount > 0) {
      failureReasons.push(`Chứa ${placeholderCount} câu hỏi placeholder / demo data`);
    }
    if (!audioValid) {
      failureReasons.push('Thiếu audioText hoặc audioUrl cho phần thi Listening');
    }
    if (!answersValid) {
      failureReasons.push('Chứa câu hỏi có correctAnswerIndex không hợp lệ');
    }
    if (!rubricValid) {
      failureReasons.push('Thiếu rubric đánh giá cho kỹ năng Speaking / Writing');
    }
    if (hasInternalDups) {
      failureReasons.push('Chứa câu hỏi trùng lặp nội dung trong cùng một đề thi');
    }

    const isFullyCompliant =
      meetsBlueprintLength &&
      placeholderCount === 0 &&
      audioValid &&
      answersValid &&
      rubricValid &&
      !hasInternalDups;

    if (isFullyCompliant) {
      categorySummary[cat].compliantExamsCount++;
    }

    results.push({
      testId: test.id,
      testTitle: test.title,
      category: cat,
      totalQuestions: totalQ,
      validQuestionsCount: totalQ - placeholderCount,
      placeholderQuestionsCount: placeholderCount,
      meetsBlueprintLength,
      hasAudioWhenRequired: audioValid,
      hasContextWhenRequired: true,
      hasRubricWhenRequired: rubricValid,
      allAnswersValid: answersValid,
      hasNoInternalDuplicates: !hasInternalDups,
      isFullyCompliant,
      failureReasons
    });
  }

  // Compute final deficits and statuses
  let isAllPassed = true;
  Object.keys(categorySummary).forEach((k) => {
    const summary = categorySummary[k];
    summary.deficitCount = Math.max(0, summary.targetExams - summary.compliantExamsCount);
    if (summary.deficitCount === 0) {
      summary.status = 'PASS';
    } else {
      // If no valid data at all or insufficient source inventory
      summary.status = summary.compliantExamsCount > 0 ? 'FAIL' : 'BLOCKED';
      isAllPassed = false;
    }
  });

  return { results, categorySummary, isAllPassed };
}

// Execute standalone check if run from CLI
if (process.argv[1]?.includes('validate-exam-bank-readiness')) {
  console.log('========================================================================================');
  console.log('             TASK 7 OFFICIAL EXAM BANK READINESS & BLUEPRINT VALIDATOR                 ');
  console.log('========================================================================================\n');

  const { results, categorySummary, isAllPassed } = validateAllExams();

  console.log('CATEGORY COMPLIANCE AUDIT TABLE:');
  console.log('---------------------------------------------------------------------------------------------------------');
  console.log(
    'Category'.padEnd(25) +
      'Target'.padEnd(8) +
      'Declared'.padEnd(10) +
      'Compliant'.padEnd(12) +
      'Deficit'.padEnd(10) +
      'Status'
  );
  console.log('---------------------------------------------------------------------------------------------------------');

  Object.values(categorySummary).forEach((summary: any) => {
    console.log(
      summary.nameVi.padEnd(25) +
        String(summary.targetExams).padEnd(8) +
        String(summary.actualDeclared).padEnd(10) +
        String(summary.compliantExamsCount).padEnd(12) +
        String(summary.deficitCount).padEnd(10) +
        summary.status
    );
  });
  console.log('---------------------------------------------------------------------------------------------------------\n');

  console.log('COMPLIANT BLUEPRINT EXAMS (100% Real, 0 Placeholders, Full Items):');
  const passExams = results.filter((r) => r.isFullyCompliant);
  passExams.forEach((r) => {
    console.log(`  [PASS] [${r.category}] ${r.testId} - "${r.testTitle}" (${r.totalQuestions} items)`);
  });

  console.log(`\nTotal compliant exams ready for production: ${passExams.length}`);
  console.log(`Total non-compliant or placeholder exams:   ${results.length - passExams.length}`);

  if (!isAllPassed) {
    console.log('\n[CRITICAL NOTICE: DEFICIT DETECTED]');
    console.log('The target of 50 complete exams per category is not yet met across all categories.');
    console.log('Exiting with code 1 as strictly instructed by Task 7 rules.\n');
    process.exit(1);
  } else {
    console.log('\n[SUCCESS: ALL CATEGORIES PASSED WITH 50+ COMPLIANT EXAMS]');
    process.exit(0);
  }
}
