import { describe, it, expect } from 'vitest';
import {
  generateQuestionExactHash,
  generateQuestionNormalizedHash,
  checkPairwiseDeduplication,
  computeExamQuestionOverlap,
  checkExamLevelDuplication,
  standardizeQuestion,
  ingestQuestionBatch,
  retireSource,
  generateExamFromQuestionBank,
  generateQuestionBankAuditReport,
  isSourcePermittedForPublishing,
  DEFAULT_AUTHORIZED_SOURCES
} from '../src/services/multiSourcePipeline';
import { VERIFIED_QUESTION_BANK } from '../src/data/verifiedQuestionBank';
import { TestQuestion, PracticeTest } from '../src/types';

describe('Task 6: Multi-Source Content Pipeline with Strict Deduplication Suite', () => {
  // Sample valid question for tests
  const sampleValidQuestion: Partial<TestQuestion> = {
    id: 'test-src-q1',
    prompt: 'The manager announced that the quarterly financial report ______ completed by Friday.',
    options: ['would be', 'will have', 'is being', 'has been'],
    correctAnswerIndex: 0,
    explanationVi: 'Trong lời nói gián tiếp với động từ tường thuật ở quá khứ "announced", mệnh đề sau lùi thì sang "would be".',
    category: 'Reported Speech',
    skill: 'reading',
    cefrLevel: 'B2',
    examType: 'toeic',
    source: {
      sourceId: 'src-lingopeak-original',
      category: 'lingopeak_original',
      attribution: 'LingoPeak Curriculum Development Team',
      licenseOrPermission: 'LingoPeak Proprietary',
      creationMethod: 'human_authored',
      contentVersion: '1.0.0',
      license: 'LingoPeak Educational License',
      permissions: ['reference', 'verbatim', 'adapt', 'distribute'],
      isLicenseVerified: true
    }
  };

  // 1. Exact Duplicate Detection (Tier 1)
  it('1. Detects exact question duplicates regardless of ID, punctuation, or casing', () => {
    const qA = standardizeQuestion(sampleValidQuestion);
    const qB = standardizeQuestion({
      ...sampleValidQuestion,
      id: 'completely-different-id-999',
      prompt: '  The manager announced that the quarterly financial report ______ COMPLETED by Friday.  ',
      options: ['is being', 'has been', 'would be', 'will have'] // Permuted options order
    });

    const result = checkPairwiseDeduplication(qA, qB);
    expect(result.matchLevel).toBe('tier1_exact');
    expect(result.similarityScore).toBe(1.0);
  });

  // 2. Near-Exact & Semantic Similarity Detection (Tier 2 & Tier 3)
  it('2. Flags near-duplicates (Tier 2) and semantic suspicious questions (Tier 3) for moderation', () => {
    const qA = standardizeQuestion({
      id: 'q-sim-a',
      prompt: 'She always attends the morning briefing with her departmental colleagues.',
      options: ['attends', 'attend', 'attending', 'attended'],
      correctAnswerIndex: 0,
      explanationVi: 'Thì hiện tại đơn diễn tả thói quen lặp lại hàng ngày.'
    });

    // Near-duplicate: slight variation with filler words
    const qNear = standardizeQuestion({
      id: 'q-sim-b',
      prompt: 'She always attends the early morning briefing with her departmental colleagues.',
      options: ['attends', 'attend', 'attending', 'attended'],
      correctAnswerIndex: 0,
      explanationVi: 'Thì hiện tại đơn diễn tả thói quen lặp lại.'
    });

    const nearResult = checkPairwiseDeduplication(qA, qNear);
    expect(['tier1_exact', 'tier2_near_exact']).toContain(nearResult.matchLevel);
    expect(nearResult.similarityScore).toBeGreaterThanOrEqual(0.85);

    // Semantic suspicious: moderate token overlap
    const qSemantic = standardizeQuestion({
      id: 'q-sim-c',
      prompt: 'The morning briefing is regularly attended by departmental colleagues.',
      options: ['attended', 'attends', 'attending', 'attend'],
      correctAnswerIndex: 0,
      explanationVi: 'Câu bị động với động từ to be và phân từ hai.'
    });

    const semanticResult = checkPairwiseDeduplication(qA, qSemantic);
    expect(semanticResult.similarityScore).toBeGreaterThanOrEqual(0.3);
  });

  // 3. Exam-Level Duplicate Rejection (Tier 4)
  it('3. Rejects creating an exam if question overlap with an existing exam exceeds threshold', () => {
    const baseQuestions = VERIFIED_QUESTION_BANK.slice(0, 10).map((q) => standardizeQuestion(q));
    const existingExam: PracticeTest = {
      id: 'existing-exam-alpha',
      title: 'Original Benchmark Exam Alpha',
      titleVi: 'Đề Thi Thử Alpha',
      type: 'grammar_test',
      durationMinutes: 60,
      totalQuestions: 10,
      targetLevel: 'B1',
      descriptionVi: 'Đề mẫu ban đầu',
      questions: baseQuestions
    };

    // Attempt to clone by shuffling question order and renaming
    const clonedQuestions = [...baseQuestions].reverse();
    const dupCheck = checkExamLevelDuplication(clonedQuestions, [existingExam], 0.4);

    expect(dupCheck.isDuplicate).toBe(true);
    expect(dupCheck.conflictedExamId).toBe('existing-exam-alpha');
    expect(dupCheck.overlapPercent).toBe(100);
    expect(dupCheck.messageVi).toContain('bị từ chối do trùng lặp');
  });

  // 4. Legal Licensing & Verification Enforcement
  it('4. Prohibits publishing content lacking verified license and distribution permissions', () => {
    // Unverified source without distribution rights
    const unverifiedSourceCheck = isSourcePermittedForPublishing({
      category: 'ai_assisted_draft',
      license: 'Internal Draft',
      permissions: ['adapt'],
      isLicenseVerified: false
    });
    expect(unverifiedSourceCheck.allowed).toBe(false);

    // Ingest question with unverified source -> must be placed in pending_review
    const unverifiedQuestion: Partial<TestQuestion> = {
      id: 'test-unverified-q',
      prompt: 'What is the primary function of the marketing department?',
      options: ['Promote products', 'Repair computers', 'Cook food', 'Drive trucks'],
      correctAnswerIndex: 0,
      explanationVi: 'Giải thích cho câu hỏi tiếp thị.',
      source: {
        category: 'ai_assisted_draft',
        attribution: 'Raw AI Generator',
        licenseOrPermission: 'Unreviewed AI Output',
        creationMethod: 'ai_assisted',
        contentVersion: '0.1',
        license: '',
        permissions: ['reference'],
        isLicenseVerified: false
      }
    };

    const report = ingestQuestionBatch([unverifiedQuestion], []);
    expect(report.pendingReviewCount).toBeGreaterThanOrEqual(1);
    const ingested = report.updatedBank.find((q) => q.id === 'test-unverified-q');
    expect(ingested).toBeDefined();
    expect(ingested!.review?.status).toBe('pending_review');
    expect(ingested!.metadata?.isProductionReady).toBe(false);
  });

  // 5. Mandatory Asset & Answer Validation
  it('5. Refuses to approve questions missing valid answers, options, or audio sources for listening', () => {
    const invalidListeningQuestion: Partial<TestQuestion> = {
      id: 'invalid-listening-q',
      prompt: 'Listen to the conversation and choose the correct answer.',
      options: ['Option A', 'Option B'],
      correctAnswerIndex: 0,
      explanationVi: 'Giải thích nghe.',
      skill: 'listening',
      // Missing audioText and audioUrl!
      source: {
        category: 'lingopeak_original',
        attribution: 'LingoPeak Team',
        licenseOrPermission: 'LingoPeak Core',
        creationMethod: 'human_authored',
        contentVersion: '1.0.0',
        license: 'Valid License',
        permissions: ['distribute']
      }
    };

    const report = ingestQuestionBatch([invalidListeningQuestion], []);
    const ingested = report.updatedBank.find((q) => q.id === 'invalid-listening-q');
    expect(ingested).toBeDefined();
    expect(ingested!.review?.status).toBe('pending_review');
    expect(ingested!.metadata?.isProductionReady).toBe(false);
  });

  // 6. Idempotent Ingestion
  it('6. Ensures re-importing the identical batch produces 0 duplicates (strictly idempotent)', () => {
    const initialBank: TestQuestion[] = [];
    const batch = [standardizeQuestion(sampleValidQuestion)];

    // First ingestion
    const report1 = ingestQuestionBatch(batch, initialBank);
    expect(report1.importedCount).toBe(1);
    expect(report1.skippedDuplicateCount).toBe(0);
    expect(report1.updatedBank.length).toBe(1);

    // Second ingestion with exact same batch
    const report2 = ingestQuestionBatch(batch, report1.updatedBank);
    expect(report2.importedCount).toBe(0);
    expect(report2.skippedDuplicateCount).toBe(1);
    expect(report2.updatedBank.length).toBe(1); // Length remains exactly 1!
  });

  // 7. Exam Snapshot Stability
  it('7. Guarantees started exam snapshots are immutable even when the question bank is updated', () => {
    const bank = VERIFIED_QUESTION_BANK.slice(0, 30).map((q) => standardizeQuestion(q));
    const result = generateExamFromQuestionBank(bank, [], {
      blueprintId: 'cefr_benchmark',
      targetLevel: 'A1',
      targetQuestionCount: 2,
      examId: 'test-snapshot-stability'
    });

    expect(result.status).toBe('ready');
    const exam = result.exam!;
    const originalFirstPrompt = exam.questions[0].prompt;

    // Mutate the original question bank entry
    bank[0].prompt = 'MUTATED PROMPT IN MASTER DATABASE';

    // Verify the exam question snapshot did not mutate
    expect(exam.questions[0].prompt).toBe(originalFirstPrompt);
    expect(exam.questions[0].prompt).not.toBe('MUTATED PROMPT IN MASTER DATABASE');
  });

  // 8. Inter-Exam Question Reuse Tracking
  it('8. Accurately tracks question usage frequency across generated exams', () => {
    const bank = VERIFIED_QUESTION_BANK.slice(0, 35).map((q) => standardizeQuestion(q));

    // Generate first exam
    const res1 = generateExamFromQuestionBank(bank, [], {
      blueprintId: 'cefr_benchmark',
      targetLevel: 'A1',
      targetQuestionCount: 2,
      examId: 'exam-reuse-1',
      maxQuestionReuse: 2
    });

    expect(res1.status).toBe('ready');
    const updatedBankAfterExam1 = res1.updatedBank!;

    // Check that used questions have usageCount incremented
    const usedQuestions = updatedBankAfterExam1.filter((q) => (q.usageCount || 0) > 0);
    expect(usedQuestions.length).toBeGreaterThan(0);
    usedQuestions.forEach((q) => {
      expect(q.examAppearances).toContain('exam-reuse-1');
    });

    // Audit report reflects usage metrics
    const auditReport = generateQuestionBankAuditReport(updatedBankAfterExam1);
    expect(auditReport.totalUsageAcrossExams).toBeGreaterThan(0);
    expect(auditReport.averageAppearancesPerQuestion).toBeGreaterThan(0);
  });

  // 9. Reporting Unique Questions by Source, Skill, and CEFR
  it('9. Generates comprehensive audit report broken down by source, skill, and CEFR', () => {
    const sampleBank: TestQuestion[] = [
      standardizeQuestion({ ...sampleValidQuestion, id: 'rep-q1', cefrLevel: 'A1', skill: 'reading' }),
      standardizeQuestion({ ...sampleValidQuestion, id: 'rep-q2', cefrLevel: 'B1', skill: 'listening', audioText: 'Audio text for test' }),
      standardizeQuestion({ ...sampleValidQuestion, id: 'rep-q3', cefrLevel: 'C1', skill: 'writing' })
    ];

    const report = generateQuestionBankAuditReport(sampleBank);
    expect(report.totalQuestions).toBe(3);
    expect(report.approvedCount).toBe(3);
    expect(report.distributionByCefr['A1']).toBe(1);
    expect(report.distributionByCefr['B1']).toBe(1);
    expect(report.distributionByCefr['C1']).toBe(1);
    expect(report.distributionBySkill['reading']).toBe(1);
    expect(report.distributionBySkill['listening']).toBe(1);
    expect(report.distributionBySkill['writing']).toBe(1);
  });

  // 10. Honest Blueprint Readiness & Deficit Reporting (No Faking)
  it('10. Reports honest deficits and refuses to claim readiness when insufficient questions exist', () => {
    // Mini bank with only 5 questions
    const miniBank = VERIFIED_QUESTION_BANK.slice(0, 5).map((q) => standardizeQuestion(q));

    // Request TOEIC 2 Skills (requires 50 Listening + 50 Reading = 100 questions)
    const result = generateExamFromQuestionBank(miniBank, [], {
      blueprintId: 'toeic_2skills'
    });

    expect(result.status).toBe('insufficient_questions');
    expect(result.exam).toBeUndefined();
    expect(result.requiredCount).toBe(100);
    expect(result.deficitCount).toBeGreaterThanOrEqual(95);
    expect(result.messageVi).toContain('chưa đủ câu chuẩn hóa');
    expect(result.deficitBySkill['Listening']).toBeGreaterThan(0);
    expect(result.deficitBySkill['Reading']).toBeGreaterThan(0);
  });

  // 11. Source Retirement & Revocation
  it('11. Revokes and removes questions from circulation when a data source is retired', () => {
    const bank = [
      standardizeQuestion({
        ...sampleValidQuestion,
        id: 'licensed-q-1',
        source: {
          sourceId: 'src-retired-vendor',
          category: 'licensed_third_party',
          attribution: 'Third Party Vendor',
          licenseOrPermission: 'Commercial License V1',
          creationMethod: 'imported',
          contentVersion: '1.0.0',
          license: 'Vendor License',
          permissions: ['distribute']
        }
      })
    ];

    const { updatedBank, retiredCount } = retireSource('src-retired-vendor', bank);
    expect(retiredCount).toBe(1);
    expect(updatedBank[0].review?.status).toBe('rejected');
    expect(updatedBank[0].metadata?.isProductionReady).toBe(false);
  });
});
