import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import {
  generateQuestionBankAuditReport,
  DEFAULT_AUTHORIZED_SOURCES,
  getSourceRegistry
} from '../src/services/multiSourcePipeline';

console.log('=== MULTI-SOURCE QUESTION BANK & LEGAL LICENSING AUDIT ===\n');

console.log('1. AUTHORIZED DATA SOURCES REGISTRY:');
console.log('-----------------------------------------------------------------------------------------');
console.log(
  'Source ID'.padEnd(25) +
    'Category'.padEnd(20) +
    'License'.padEnd(30) +
    'Verified'
);
console.log('-----------------------------------------------------------------------------------------');
getSourceRegistry().forEach((src) => {
  console.log(
    src.sourceId.padEnd(25) +
      src.category.padEnd(20) +
      src.license.slice(0, 28).padEnd(30) +
      (src.isVerified ? 'YES (Active)' : 'NO (Pending Review)')
  );
});
console.log('-----------------------------------------------------------------------------------------\n');

console.log('2. INVENTORY AUDIT REPORT (VERIFIED_QUESTION_BANK):');
const report = generateQuestionBankAuditReport(VERIFIED_QUESTION_BANK);

console.log(`- Total Questions in Master Bank: ${report.totalQuestions}`);
console.log(`- Approved for Exams:            ${report.approvedCount}`);
console.log(`- Pending Editorial Review:      ${report.pendingReviewCount}`);
console.log(`- Rejected / Suspended:          ${report.rejectedCount}`);
console.log(`- Total Cross-Exam Appearances:  ${report.totalUsageAcrossExams}`);
console.log(`- Avg Appearances per Question:  ${report.averageAppearancesPerQuestion}`);
console.log(`- Questions Never Used:          ${report.questionsNeverUsedCount}\n`);

console.log('3. DISTRIBUTION BY SOURCE CATEGORY:');
Object.entries(report.distributionBySource).forEach(([source, count]) => {
  console.log(`  * ${source.padEnd(25)}: ${count} questions`);
});

console.log('\n4. DISTRIBUTION BY CEFR LEVEL:');
Object.entries(report.distributionByCefr).forEach(([level, count]) => {
  console.log(`  * Level ${level.padEnd(5)}: ${count} questions`);
});

console.log('\n5. DISTRIBUTION BY SKILL:');
Object.entries(report.distributionBySkill).forEach(([skill, count]) => {
  console.log(`  * Skill ${skill.padEnd(20)}: ${count} questions`);
});

console.log('\n=== AUDIT COMPLETED SUCCESSFULLY ===');
