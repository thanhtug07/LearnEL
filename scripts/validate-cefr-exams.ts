import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { STANDARDIZED_CEFR_BENCHMARK_TESTS } from '../src/data/cefr/cefrBenchmarkTests';
import { STANDARDIZED_BLUEPRINT_TESTS } from '../src/data/blueprints';
import { isPlaceholderQuestion, normalizePrompt } from '../src/utils/cefrExamGenerator';
import { TestQuestion, PracticeTest } from '../src/types';

interface QualityAuditRow {
  examName: string;
  skill: string;
  cefr: string;
  validCount: number;
  duplicateIdCount: number;
  duplicateContentCount: number;
  missingMetadataCount: number;
  status: string;
}

console.log('================================================================');
console.log('   LINGOPEAK CEFR-ALIGNED EXAM QUALITY & METADATA AUDIT REPORT  ');
console.log('================================================================\n');

// 1. Global Duplicate Checkers
const globalIdMap = new Map<string, string>(); // id -> location
const globalPromptMap = new Map<string, string>(); // normalized prompt -> location
const duplicateIds: { id: string; firstLoc: string; secondLoc: string }[] = [];
const duplicatePrompts: { prompt: string; firstLoc: string; secondLoc: string }[] = [];

// Audit collection function for a group of questions
function auditQuestionSet(
  questions: TestQuestion[],
  locationPrefix: string,
  targetCefr?: string
) {
  let validCount = 0;
  let dupIdCount = 0;
  let dupContentCount = 0;
  let missingMetaCount = 0;
  let placeholderCount = 0;

  const localIdSet = new Set<string>();
  const localPromptSet = new Set<string>();

  questions.forEach((q, idx) => {
    const loc = `${locationPrefix}#Q${idx + 1}[${q.id}]`;
    const norm = normalizePrompt(q.prompt || '');

    // Check ID Duplication
    if (globalIdMap.has(q.id) || localIdSet.has(q.id)) {
      dupIdCount++;
      duplicateIds.push({
        id: q.id,
        firstLoc: globalIdMap.get(q.id) || 'local',
        secondLoc: loc
      });
    } else {
      globalIdMap.set(q.id, loc);
      localIdSet.add(q.id);
    }

    // Check Content Duplication (distinguishing from ID)
    if (globalPromptMap.has(norm) || localPromptSet.has(norm)) {
      dupContentCount++;
      duplicatePrompts.push({
        prompt: q.prompt,
        firstLoc: globalPromptMap.get(norm) || 'local',
        secondLoc: loc
      });
    } else {
      globalPromptMap.set(norm, loc);
      localPromptSet.add(norm);
    }

    // Check Placeholder
    const isSynthetic = isPlaceholderQuestion(q);
    if (isSynthetic) {
      placeholderCount++;
    }

    // Check Missing Metadata
    let hasMissingMeta = false;
    const skill = (q.skill || '').toLowerCase();
    const qCefr = q.cefrLevel || q.cefr;

    if (!q.skill) hasMissingMeta = true;
    if (!qCefr) hasMissingMeta = true;
    if (targetCefr && qCefr !== targetCefr && targetCefr !== 'ALL') {
      hasMissingMeta = true; // Level mismatch!
    }
    if (!q.explanationVi && !q.explanation) hasMissingMeta = true;

    // Resource check: Listening needs audio
    if (
      (skill.includes('listening')) &&
      !q.audioText &&
      !q.audioUrl &&
      !q.audioId
    ) {
      hasMissingMeta = true;
    }

    // Resource check: Reading passage
    if (
      (skill === 'reading' || skill === 'toeic_reading' || skill === 'ielts_reading') &&
      q.section?.toLowerCase().includes('reading') &&
      q.prompt?.toLowerCase().includes('passage') &&
      !q.contextPassage &&
      !q.passageId
    ) {
      hasMissingMeta = true;
    }

    // Subjective check: Speaking/Writing needs rubric
    if (
      (q.itemType === 'speaking_recording' || q.itemType === 'essay') &&
      (!q.rubric || !q.rubric.criteria || q.rubric.criteria.length === 0)
    ) {
      hasMissingMeta = true;
    }

    // Options check
    if (!q.options || q.options.length < 2) {
      hasMissingMeta = true;
    }

    // Answer index bounds check
    if (
      q.correctAnswerIndex === undefined ||
      q.correctAnswerIndex < 0 ||
      q.correctAnswerIndex >= q.options.length
    ) {
      hasMissingMeta = true;
    }

    if (hasMissingMeta) {
      missingMetaCount++;
    }

    if (!isSynthetic && !hasMissingMeta) {
      validCount++;
    }
  });

  return {
    validCount,
    dupIdCount,
    dupContentCount,
    missingMetaCount,
    placeholderCount,
    total: questions.length
  };
}

// 2. Run Audit on All Curated Categories
const tableRows: QualityAuditRow[] = [];

// CEFR Benchmark Tests (A1 to C2)
STANDARDIZED_CEFR_BENCHMARK_TESTS.forEach((test) => {
  const cefr = test.targetLevel;
  // Group by skill in this test
  const skillsInTest = Array.from(new Set(test.questions.map((q) => q.skill || 'grammar')));

  skillsInTest.forEach((sk) => {
    const qSubset = test.questions.filter((q) => (q.skill || 'grammar') === sk);
    const res = auditQuestionSet(qSubset, `CEFR-${cefr}-${sk}`, cefr);
    tableRows.push({
      examName: `CEFR ${cefr} Benchmark (${test.titleVi})`,
      skill: sk.toUpperCase(),
      cefr: cefr,
      validCount: res.validCount,
      duplicateIdCount: res.dupIdCount,
      duplicateContentCount: res.dupContentCount,
      missingMetadataCount: res.missingMetaCount,
      status: res.validCount === qSubset.length ? '100% Đạt chuẩn CEFR' : 'Cần hoàn thiện'
    });
  });
});

// Standardized Blueprints (TOEIC 2 Skills, TOEIC 4 Skills, IELTS Custom Mock)
STANDARDIZED_BLUEPRINT_TESTS.forEach((test) => {
  const skillsInTest = Array.from(new Set(test.questions.map((q) => q.skill || 'general')));
  skillsInTest.forEach((sk) => {
    const qSubset = test.questions.filter((q) => (q.skill || 'general') === sk);
    const res = auditQuestionSet(qSubset, `${test.id}-${sk}`, 'ALL');
    tableRows.push({
      examName: test.titleVi || test.title,
      skill: sk.toUpperCase(),
      cefr: test.targetLevel,
      validCount: res.validCount,
      duplicateIdCount: res.dupIdCount,
      duplicateContentCount: res.dupContentCount,
      missingMetadataCount: res.missingMetaCount,
      status: res.validCount === qSubset.length ? '100% Đạt chuẩn Blueprint' : 'Thiếu metadata'
    });
  });
});

// Base Practice Tests (Placement, TOEIC RC, IELTS Academic Mock)
const basePracticeTestIds = ['test-placement-general', 'test-toeic-rc-full', 'test-ielts-academic-mock'];
INITIAL_PRACTICE_TESTS.filter((t) => basePracticeTestIds.includes(t.id)).forEach((test) => {
  const res = auditQuestionSet(test.questions, test.id, test.targetLevel);
  tableRows.push({
    examName: test.titleVi || test.title,
    skill: 'MULTI-SKILLS',
    cefr: test.targetLevel,
    validCount: res.validCount,
    duplicateIdCount: res.dupIdCount,
    duplicateContentCount: res.dupContentCount,
    missingMetadataCount: res.missingMetaCount,
    status: res.validCount === test.questions.length ? 'Đạt chuẩn nội dung' : 'Cần bổ sung metadata'
  });
});

// Expanded Catalog Tests (A1 to C2)
const expandedTests = INITIAL_PRACTICE_TESTS.filter((t) => t.id.startsWith('test-expanded-'));
const expandedByCefr: Record<string, TestQuestion[]> = {};
expandedTests.forEach((t) => {
  const lvl = t.targetLevel || 'UNSET';
  if (!expandedByCefr[lvl]) expandedByCefr[lvl] = [];
  expandedByCefr[lvl].push(...t.questions);
});

Object.keys(expandedByCefr).forEach((lvl) => {
  const qList = expandedByCefr[lvl];
  const res = auditQuestionSet(qList, `Expanded-${lvl}`, lvl);
  tableRows.push({
    examName: `Expanded Practice Series (${lvl})`,
    skill: 'MIXED (GRAM/VOC/RC/LC)',
    cefr: lvl,
    validCount: res.validCount,
    duplicateIdCount: res.dupIdCount,
    duplicateContentCount: res.dupContentCount,
    missingMetadataCount: res.missingMetaCount,
    status:
      res.placeholderCount > 0
        ? `Có ${res.placeholderCount} câu mẫu (Cần thay thế dần)`
        : 'Hoàn thiện'
  });
});

// 3. Print Output Table
console.log('-----------------------------------------------------------------------------------------------------------------------');
console.log(
  'Kỳ thi'.padEnd(38) + ' | ' +
  'Kỹ năng'.padEnd(20) + ' | ' +
  'CEFR'.padEnd(14) + ' | ' +
  'Hợp lệ'.padEnd(8) + ' | ' +
  'Trùng'.padEnd(7) + ' | ' +
  'Thiếu meta'.padEnd(12) + ' | ' +
  'Trạng thái'
);
console.log('-----------------------------------------------------------------------------------------------------------------------');

tableRows.forEach((row) => {
  const exam = row.examName.length > 36 ? row.examName.slice(0, 33) + '...' : row.examName;
  const skill = row.skill.length > 18 ? row.skill.slice(0, 15) + '...' : row.skill;
  const cefr = row.cefr.length > 12 ? row.cefr.slice(0, 9) + '...' : row.cefr;
  const valid = String(row.validCount).padEnd(8);
  const dup = String(row.duplicateIdCount + row.duplicateContentCount).padEnd(7);
  const meta = String(row.missingMetadataCount).padEnd(12);
  const st = row.status;

  console.log(
    exam.padEnd(38) + ' | ' +
    skill.padEnd(20) + ' | ' +
    cefr.padEnd(14) + ' | ' +
    valid + ' | ' +
    dup + ' | ' +
    meta + ' | ' +
    st
  );
});
console.log('-----------------------------------------------------------------------------------------------------------------------\n');

console.log('=== AUDIT SUMMARY & ANOMALY REPORT ===');
console.log(`- Total Distinct Question IDs Registered: ${globalIdMap.size}`);
console.log(`- Duplicate Question IDs Detected: ${duplicateIds.length}`);
console.log(`- Duplicate Prompt Contents Detected: ${duplicatePrompts.length}`);
if (duplicateIds.length > 0) {
  console.log('  ⚠️ Detected Duplicate IDs:', duplicateIds.slice(0, 5));
}
if (duplicatePrompts.length > 0) {
  console.log('  ⚠️ Detected Duplicate Prompts:', duplicatePrompts.slice(0, 5));
}
console.log('\nAudit completed successfully.');
