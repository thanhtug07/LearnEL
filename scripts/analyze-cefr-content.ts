import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { STANDARDIZED_BLUEPRINT_TESTS } from '../src/data/blueprints';
import { NEW_TESTS_CATALOG } from '../src/data/tests/testsCatalog';

console.log('=== DEEP CONTENT & CEFR DISTRIBUTION ANALYSIS ===\n');

// Analyze VERIFIED_QUESTION_BANK
console.log(`VERIFIED_QUESTION_BANK length: ${VERIFIED_QUESTION_BANK.length}`);

const isTemplateQuestion = (prompt: string, options: string[]) => {
  const p = prompt.toLowerCase();
  if (p.includes('valid accurate lexical') || p.includes('choose the correct grammatical or lexical option') || p.includes('select the word or phrase that best completes the sentence (set')) {
    return true;
  }
  if (options.some(o => o.toLowerCase().includes('option a: valid') || o.toLowerCase().includes('primary verified choice') || o.toLowerCase().includes('alternative distractor'))) {
    return true;
  }
  return false;
};

const bankAnalysis = {
  total: VERIFIED_QUESTION_BANK.length,
  byCefr: {} as Record<string, number>,
  bySkill: {} as Record<string, number>,
  templateCount: 0,
  genuineCount: 0,
  genuineByCefrSkill: {} as Record<string, number>
};

VERIFIED_QUESTION_BANK.forEach(q => {
  const c = q.cefr || 'UNSET';
  bankAnalysis.byCefr[c] = (bankAnalysis.byCefr[c] || 0) + 1;
  const s = q.skill || 'UNSET';
  bankAnalysis.bySkill[s] = (bankAnalysis.bySkill[s] || 0) + 1;

  if (isTemplateQuestion(q.prompt, q.options)) {
    bankAnalysis.templateCount++;
  } else {
    bankAnalysis.genuineCount++;
    const key = `${c}_${s}`;
    bankAnalysis.genuineByCefrSkill[key] = (bankAnalysis.genuineByCefrSkill[key] || 0) + 1;
  }
});

console.log('Question Bank Breakdown:', {
  total: bankAnalysis.total,
  genuineCount: bankAnalysis.genuineCount,
  templateCount: bankAnalysis.templateCount,
  byCefr: bankAnalysis.byCefr,
  bySkill: bankAnalysis.bySkill,
  genuineByCefrSkill: bankAnalysis.genuineByCefrSkill
});

// Analyze tests
console.log('\n=== TESTS ANALYSIS ===');
console.log(`Total tests in INITIAL_PRACTICE_TESTS: ${INITIAL_PRACTICE_TESTS.length}`);
console.log(`- Standardized Blueprint Tests: ${STANDARDIZED_BLUEPRINT_TESTS.length}`);
console.log(`- New Tests Catalog: ${NEW_TESTS_CATALOG.length}`);

let testTemplateQCount = 0;
let testGenuineQCount = 0;
const testsByTargetLevel: Record<string, { total: number; genuineQ: number; templateQ: number }> = {};

INITIAL_PRACTICE_TESTS.forEach(t => {
  const lvl = t.targetLevel || 'UNSET';
  if (!testsByTargetLevel[lvl]) {
    testsByTargetLevel[lvl] = { total: 0, genuineQ: 0, templateQ: 0 };
  }
  testsByTargetLevel[lvl].total++;

  t.questions.forEach(q => {
    if (isTemplateQuestion(q.prompt, q.options)) {
      testTemplateQCount++;
      testsByTargetLevel[lvl].templateQ++;
    } else {
      testGenuineQCount++;
      testsByTargetLevel[lvl].genuineQ++;
    }
  });
});

console.log('Tests by Target Level:', testsByTargetLevel);
console.log(`Total Test Questions: genuine=${testGenuineQCount}, template=${testTemplateQCount}`);
