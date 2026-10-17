import {
  TestQuestion,
  PracticeTest,
  CEFRLevel,
  ContentSourceCategory,
  ReviewStatus,
  ExamBlueprint
} from '../types';
import { isPlaceholderQuestion } from '../utils/cefrExamGenerator';
import { validateQuestion } from './questionValidator';

// ============================================================================
// 1. DATA SOURCE REGISTRY & LEGAL LICENSING SCHEMA
// ============================================================================

export type SourcePermission = 'reference' | 'verbatim' | 'adapt' | 'distribute';

export interface AuthorizedSourceRecord {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  category: ContentSourceCategory;
  owner: string;
  license: string;
  permissions: SourcePermission[];
  isVerified: boolean;
  termsUrl?: string;
  retrievedAt: string;
  active: boolean;
  notes?: string;
}

/**
 * Priority order of legal sources:
 * 1. open_licensed (Permissive licenses: CC-BY, CC0)
 * 2. academic_curated (Academic / research corpora with clear licenses)
 * 3. official_sample (Official sample materials permitted under fair terms)
 * 4. lingopeak_original (Authored by LingoPeak pedagogical team)
 * 5. ai_assisted_draft (AI draft based on CEFR/blueprint; requires human approval)
 */
export const DEFAULT_AUTHORIZED_SOURCES: AuthorizedSourceRecord[] = [
  {
    sourceId: 'src-lingopeak-original',
    sourceName: 'LingoPeak Core Curriculum & Pedagogical Lab',
    sourceUrl: 'https://lingopeak.edu.vn/curriculum',
    category: 'lingopeak_original',
    owner: 'LingoPeak Education Academic Board',
    license: 'LingoPeak Proprietary Educational License',
    permissions: ['reference', 'verbatim', 'adapt', 'distribute'],
    isVerified: true,
    retrievedAt: '2026-09-01T00:00:00Z',
    active: true,
    notes: 'Authored directly by certified English language instructors and linguists.'
  },
  {
    sourceId: 'src-open-cc4',
    sourceName: 'Open Educational Resources English Assessment Repository',
    sourceUrl: 'https://oercommons.org/curricula/english-assessment',
    category: 'open_licensed',
    owner: 'OER Global Commons Community',
    license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    permissions: ['reference', 'verbatim', 'adapt', 'distribute'],
    isVerified: true,
    retrievedAt: '2026-09-10T00:00:00Z',
    active: true,
    notes: 'Allows sharing and adapting for any purpose with appropriate attribution.'
  },
  {
    sourceId: 'src-academic-cefr',
    sourceName: 'CEFR Graded Lexical & Grammar Benchmark Corpus',
    sourceUrl: 'https://cefr-benchmarks.edu/corpora',
    category: 'academic_curated',
    owner: 'Applied Linguistics Research Consortium',
    license: 'Academic & Non-Commercial Educational Reuse Agreement',
    permissions: ['reference', 'adapt', 'distribute'],
    isVerified: true,
    retrievedAt: '2026-09-12T00:00:00Z',
    active: true,
    notes: 'Standardized language descriptors and validated difficulty calibrations.'
  },
  {
    sourceId: 'src-official-samples',
    sourceName: 'Official Public Sample Question Exemplars',
    sourceUrl: 'https://ets.org/toeic/sample & https://ielts.org/sample-test',
    category: 'official_sample',
    owner: 'Authorized Examination Boards',
    license: 'Official Sample Fair-Use Educational Guidance',
    permissions: ['reference'],
    isVerified: true,
    retrievedAt: '2026-09-05T00:00:00Z',
    active: true,
    notes: 'Reference items for structural calibration; direct verbatim commercial distribution prohibited.'
  },
  {
    sourceId: 'src-ai-blueprint-draft',
    sourceName: 'LingoPeak AI Pedagogical Blueprint Generator',
    sourceUrl: 'internal://lingopeak-ai-generator/v2',
    category: 'ai_assisted_draft',
    owner: 'LingoPeak AI Research Team',
    license: 'LingoPeak Generated Draft - Mandatory Editorial Review',
    permissions: ['adapt'],
    isVerified: false, // Must be individually verified before publishing
    retrievedAt: '2026-10-01T00:00:00Z',
    active: true,
    notes: 'Draft items created by LLMs based on strict CEFR rubrics. Must undergo editorial sign-off.'
  }
];

// In-memory source registry
let sourceRegistry: Map<string, AuthorizedSourceRecord> = new Map(
  DEFAULT_AUTHORIZED_SOURCES.map((s) => [s.sourceId, s])
);

export function getSourceRegistry(): AuthorizedSourceRecord[] {
  return Array.from(sourceRegistry.values());
}

export function registerSource(source: AuthorizedSourceRecord): void {
  sourceRegistry.set(source.sourceId, { ...source });
}

export function findSourceById(sourceId: string): AuthorizedSourceRecord | undefined {
  return sourceRegistry.get(sourceId);
}

/**
 * Checks whether a content source has legally verified rights for publication.
 */
export function isSourcePermittedForPublishing(source?: {
  sourceId?: string;
  category?: ContentSourceCategory;
  license?: string;
  permissions?: SourcePermission[];
  isLicenseVerified?: boolean;
}): { allowed: boolean; reason: string } {
  if (!source) {
    return { allowed: false, reason: 'Thiếu thông tin nguồn (Source metadata missing).' };
  }

  if (source.isLicenseVerified === false) {
    return { allowed: false, reason: 'Giấy phép chưa được xác minh pháp lý (Unverified license).' };
  }

  // If a known sourceId is provided, consult registry
  if (source.sourceId && sourceRegistry.has(source.sourceId)) {
    const reg = sourceRegistry.get(source.sourceId)!;
    if (!reg.active) {
      return { allowed: false, reason: `Nguồn '${reg.sourceName}' đã bị thu hồi hoặc ngừng hoạt động.` };
    }
    if (!reg.isVerified) {
      return { allowed: false, reason: `Nguồn '${reg.sourceName}' chưa qua kiểm duyệt pháp lý giấy phép.` };
    }
    if (!reg.permissions.includes('distribute')) {
      return { allowed: false, reason: `Giấy phép của '${reg.sourceName}' không cho phép phân phối (distribute).` };
    }
    return { allowed: true, reason: 'Nguồn hợp lệ và đã xác minh bản quyền.' };
  }

  // Fallback check on individual source fields
  if (!source.license || source.license.trim().length === 0) {
    return { allowed: false, reason: 'Chưa có giấy phép hoặc điều khoản sử dụng hợp lệ.' };
  }

  if (source.category === 'ai_assisted_draft') {
    return { allowed: false, reason: 'Nội dung AI tạo bản nháp cần kiểm duyệt chuyên gia trước khi xuất bản.' };
  }

  if (!source.permissions || !source.permissions.includes('distribute')) {
    return { allowed: false, reason: 'Quyền sử dụng không bao gồm phân phối (distribute).' };
  }

  return { allowed: true, reason: 'Đủ điều kiện xuất bản.' };
}

// ============================================================================
// 2. MULTI-TIER DEDUPLICATION ENGINE
// ============================================================================

/**
 * Fast deterministic string hash (FNV-1a 32-bit variant)
 */
export function computeDeterministicHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Normalizes text for exact and near-duplicate matching
 */
export function normalizeTextForDeduplication(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^\w\s]/g, '')         // strip punctuation
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim();
}

/**
 * Tier 1: Generates exact content hash based on normalized prompt and sorted options
 */
export function generateQuestionExactHash(q: Partial<TestQuestion>): string {
  const normPrompt = normalizeTextForDeduplication(q.prompt || q.text || '');
  const normOptions = (q.options || [])
    .map((opt) => normalizeTextForDeduplication(opt))
    .sort()
    .join('||');
  const passageSnippet = q.contextPassage ? normalizeTextForDeduplication(q.contextPassage.slice(0, 50)) : '';
  const audioSnippet = q.audioText ? normalizeTextForDeduplication(q.audioText.slice(0, 50)) : '';

  return computeDeterministicHash(`${normPrompt}::${normOptions}::${passageSnippet}::${audioSnippet}`);
}

/**
 * Generates normalized prompt hash for rapid near-duplicate lookup
 */
export function generateQuestionNormalizedHash(q: Partial<TestQuestion>): string {
  const normPrompt = normalizeTextForDeduplication(q.prompt || q.text || '');
  return computeDeterministicHash(normPrompt);
}

/**
 * Computes word set Jaccard similarity
 */
export function computeJaccardSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(normalizeTextForDeduplication(textA).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeTextForDeduplication(textB).split(' ').filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });
  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export type DeduplicationMatchLevel =
  | 'none'
  | 'tier1_exact'
  | 'tier2_near_exact'
  | 'tier3_semantic_suspicious';

export interface DeduplicationCheckResult {
  matchLevel: DeduplicationMatchLevel;
  similarityScore: number;
  duplicateWithId?: string;
  reasonVi: string;
}

/**
 * Evaluates two questions across Tier 1, Tier 2, and Tier 3 deduplication
 */
export function checkPairwiseDeduplication(
  q1: Partial<TestQuestion>,
  q2: Partial<TestQuestion>
): DeduplicationCheckResult {
  // If IDs are identical, it's the exact same entity
  if (q1.id && q2.id && q1.id === q2.id) {
    return {
      matchLevel: 'tier1_exact',
      similarityScore: 1.0,
      duplicateWithId: q2.id,
      reasonVi: 'Trùng ID bản ghi.'
    };
  }

  // Tier 1: Exact Hash Comparison
  const hash1 = q1.exactHash || generateQuestionExactHash(q1);
  const hash2 = q2.exactHash || generateQuestionExactHash(q2);
  if (hash1 === hash2) {
    return {
      matchLevel: 'tier1_exact',
      similarityScore: 1.0,
      duplicateWithId: q2.id,
      reasonVi: 'Trùng khớp chính xác 100% nội dung câu hỏi và các phương án (Tier 1).'
    };
  }

  // Tier 2: Near-Exact Match (Jaccard >= 0.85 on prompt + same/permuted options)
  const prompt1 = q1.prompt || q1.text || '';
  const prompt2 = q2.prompt || q2.text || '';
  const promptSimilarity = computeJaccardSimilarity(prompt1, prompt2);

  if (promptSimilarity >= 0.85) {
    return {
      matchLevel: 'tier2_near_exact',
      similarityScore: promptSimilarity,
      duplicateWithId: q2.id,
      reasonVi: `Trùng gần chính xác (${Math.round(promptSimilarity * 100)}% độ tương đồng câu hỏi - Tier 2).`
    };
  }

  // Tier 3: Semantic Suspicious (Similarity between 0.70 and 0.84)
  if (promptSimilarity >= 0.70) {
    return {
      matchLevel: 'tier3_semantic_suspicious',
      similarityScore: promptSimilarity,
      duplicateWithId: q2.id,
      reasonVi: `Nghi ngờ trùng ngữ nghĩa (${Math.round(promptSimilarity * 100)}% tương đồng - Cần kiểm duyệt viên duyệt - Tier 3).`
    };
  }

  return {
    matchLevel: 'none',
    similarityScore: promptSimilarity,
    reasonVi: 'Nội dung độc lập, không phát hiện trùng lặp.'
  };
}

/**
 * Tier 4: Exam-level duplication check.
 * Compares question overlap between a proposed exam and an existing exam.
 */
export function computeExamQuestionOverlap(
  examQuestionsA: Partial<TestQuestion>[],
  examQuestionsB: Partial<TestQuestion>[]
): {
  overlapRatio: number;
  sharedQuestionCount: number;
  totalUniqueCount: number;
} {
  const setA = new Set(
    examQuestionsA.map((q) => q.exactHash || generateQuestionExactHash(q))
  );
  const setB = new Set(
    examQuestionsB.map((q) => q.exactHash || generateQuestionExactHash(q))
  );

  let sharedCount = 0;
  setA.forEach((h) => {
    if (setB.has(h)) sharedCount++;
  });

  const unionCount = setA.size + setB.size - sharedCount;
  const overlapRatio = unionCount === 0 ? 0 : sharedCount / unionCount;

  return {
    overlapRatio,
    sharedQuestionCount: sharedCount,
    totalUniqueCount: unionCount
  };
}

/**
 * Checks if a proposed exam is too duplicate of any existing exam (Threshold: default 40%)
 */
export function checkExamLevelDuplication(
  proposedQuestions: Partial<TestQuestion>[],
  existingExams: PracticeTest[],
  maxAllowedOverlap: number = 0.4
): { isDuplicate: boolean; conflictedExamId?: string; overlapPercent: number; messageVi: string } {
  for (const existing of existingExams) {
    if (!existing.questions || existing.questions.length === 0) continue;
    const { overlapRatio } = computeExamQuestionOverlap(proposedQuestions, existing.questions);
    if (overlapRatio > maxAllowedOverlap) {
      return {
        isDuplicate: true,
        conflictedExamId: existing.id,
        overlapPercent: Math.round(overlapRatio * 100),
        messageVi: `Đề thi bị từ chối do trùng lặp ${Math.round(overlapRatio * 100)}% số câu hỏi với đề '${existing.title}' (${existing.id}). Giới hạn tối đa là ${Math.round(maxAllowedOverlap * 100)}%.`
      };
    }
  }

  return {
    isDuplicate: false,
    overlapPercent: 0,
    messageVi: 'Độ đa dạng của đề thi đạt chuẩn, không trùng lặp cấp đề.'
  };
}

// ============================================================================
// 3. INGESTION & BATCH STANDARDIZATION WORKFLOW
// ============================================================================

export interface IngestionBatchOptions {
  defaultSourceId?: string;
  autoApproveVerified?: boolean;
  batchId?: string;
}

export interface IngestionReport {
  batchId: string;
  timestamp: string;
  totalReceived: number;
  importedCount: number;
  updatedCount: number;
  skippedDuplicateCount: number;
  pendingReviewCount: number;
  rejectedCount: number;
  exactDuplicates: { questionId: string; duplicateWithId: string; prompt: string }[];
  nearDuplicates: { questionId: string; duplicateWithId: string; prompt: string; similarity: number }[];
  semanticSuspicious: { questionId: string; duplicateWithId: string; prompt: string; similarity: number }[];
  licenseIssues: { questionId: string; reason: string }[];
  updatedBank: TestQuestion[];
}

/**
 * Standardizes a raw question record into production schema
 */
export function standardizeQuestion(
  raw: Partial<TestQuestion>,
  defaultSourceId?: string
): TestQuestion {
  const normPrompt = (raw.prompt || raw.text || '').trim();
  const qId = raw.id?.trim() || `lp-gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Resolve source
  const rawSource = raw.source;
  const sourceId = rawSource?.sourceId || defaultSourceId || 'src-lingopeak-original';
  const regSource = findSourceById(sourceId);

  const sourceMeta = {
    category: (rawSource?.category || regSource?.category || 'lingopeak_original') as ContentSourceCategory,
    attribution: rawSource?.attribution || regSource?.owner || 'LingoPeak Curriculum Development Team',
    licenseOrPermission: rawSource?.licenseOrPermission || rawSource?.license || regSource?.license || 'LingoPeak Proprietary',
    creationMethod: rawSource?.creationMethod || 'human_authored',
    contentVersion: rawSource?.contentVersion || '1.0.0',
    sourceId,
    sourceName: rawSource?.sourceName || regSource?.sourceName,
    sourceUrl: rawSource?.sourceUrl || regSource?.sourceUrl,
    retrievedAt: rawSource?.retrievedAt || new Date().toISOString(),
    owner: rawSource?.owner || regSource?.owner,
    license: rawSource?.license !== undefined ? rawSource.license : (regSource?.license || ''),
    permissions: rawSource?.permissions || regSource?.permissions || ['reference', 'distribute'],
    isLicenseVerified: rawSource?.isLicenseVerified !== undefined ? rawSource.isLicenseVerified : (regSource?.isVerified ?? false)
  };

  const exactHash = generateQuestionExactHash({ ...raw, prompt: normPrompt });
  const normalizedHash = generateQuestionNormalizedHash({ prompt: normPrompt });

  return {
    id: qId,
    questionNumber: raw.questionNumber || 1,
    section: raw.section || 'General Reading & Lexicon',
    prompt: normPrompt,
    text: normPrompt,
    options: Array.isArray(raw.options) ? raw.options.map((opt) => String(opt).trim()) : [],
    correctAnswerIndex: typeof raw.correctAnswerIndex === 'number' ? raw.correctAnswerIndex : 0,
    acceptedAnswers: raw.acceptedAnswers,
    explanationVi:
      raw.explanationVi?.trim() ||
      raw.explanation?.trim() ||
      'Giải thích chi tiết chuẩn phương án đang được hội đồng chuyên môn hoàn thiện.',
    distractorRationales: raw.distractorRationales,
    commonMistakesVi: raw.commonMistakesVi,
    category: raw.category || 'General',
    cefr: raw.cefr || raw.cefrLevel || 'B1',
    cefrLevel: raw.cefrLevel || raw.cefr || 'B1',
    examType: raw.examType || 'general',
    skill: raw.skill || 'reading',
    itemType: raw.itemType || raw.questionType || 'multiple_choice',
    questionType: raw.questionType || raw.itemType || 'multiple_choice',
    difficulty: raw.difficulty || 'intermediate',
    topic: raw.topic || 'General Topics',
    contextPassage: raw.contextPassage,
    audioText: raw.audioText,
    audioUrl: raw.audioUrl,
    rubric: raw.rubric,
    speakingPrepSeconds: raw.speakingPrepSeconds,
    speakingRecordSeconds: raw.speakingRecordSeconds,
    source: sourceMeta,
    review: {
      status: raw.review?.status || 'approved',
      reviewerId: raw.review?.reviewerId,
      reviewerName: raw.review?.reviewerName,
      reviewedAt: raw.review?.reviewedAt || new Date().toISOString(),
      reviewNotes: raw.review?.reviewNotes,
      aiValidationPassed: raw.review?.aiValidationPassed ?? true
    },
    metadata: {
      createdAt: raw.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isProductionReady: raw.metadata?.isProductionReady ?? true
    },
    exactHash,
    normalizedHash,
    examAppearances: raw.examAppearances || [],
    usageCount: raw.usageCount || 0
  };
}

/**
 * Ingests a batch of questions with multi-tier deduplication, source verification, and idempotency
 */
export function ingestQuestionBatch(
  rawQuestions: Partial<TestQuestion>[],
  existingBank: TestQuestion[],
  options: IngestionBatchOptions = {}
): IngestionReport {
  const batchId = options.batchId || `batch-${Date.now()}`;
  const report: IngestionReport = {
    batchId,
    timestamp: new Date().toISOString(),
    totalReceived: rawQuestions.length,
    importedCount: 0,
    updatedCount: 0,
    skippedDuplicateCount: 0,
    pendingReviewCount: 0,
    rejectedCount: 0,
    exactDuplicates: [],
    nearDuplicates: [],
    semanticSuspicious: [],
    licenseIssues: [],
    updatedBank: [...existingBank]
  };

  // Build lookup maps for existing bank
  const idMap = new Map<string, TestQuestion>();
  const exactHashMap = new Map<string, TestQuestion>();
  const activeBank = [...existingBank];

  activeBank.forEach((q) => {
    idMap.set(q.id, q);
    const hash = q.exactHash || generateQuestionExactHash(q);
    exactHashMap.set(hash, q);
  });

  for (const raw of rawQuestions) {
    const standardized = standardizeQuestion(raw, options.defaultSourceId);
    const exactHash = standardized.exactHash!;

    // Step 1: Legal License & Permission Check
    const licenseCheck = isSourcePermittedForPublishing(standardized.source);
    if (!licenseCheck.allowed) {
      standardized.review!.status = 'pending_review';
      standardized.metadata!.isProductionReady = false;
      report.licenseIssues.push({
        questionId: standardized.id,
        reason: licenseCheck.reason
      });
      report.pendingReviewCount++;
    }

    // Step 2: Quality validation check (valid options, answers, audio for listening, etc.)
    const valResult = validateQuestion(standardized);
    const isSyntheticPlaceholder = isPlaceholderQuestion(standardized);

    if (!valResult.isValid || isSyntheticPlaceholder) {
      standardized.review!.status = 'pending_review';
      standardized.metadata!.isProductionReady = false;
      report.pendingReviewCount++;
    }

    // Step 3: Exact Hash Check (Tier 1)
    if (exactHashMap.has(exactHash)) {
      const existing = exactHashMap.get(exactHash)!;
      // Idempotency: Same ID and same exact hash -> skip
      if (existing.id === standardized.id) {
        report.skippedDuplicateCount++;
        continue;
      }

      // Different ID but identical content -> exact duplicate
      report.exactDuplicates.push({
        questionId: standardized.id,
        duplicateWithId: existing.id,
        prompt: standardized.prompt
      });
      standardized.review!.status = 'rejected';
      standardized.metadata!.isProductionReady = false;
      report.rejectedCount++;
      continue;
    }

    // Step 4: Near-Duplicate & Semantic Similarity Check (Tier 2 & Tier 3)
    let foundNearDuplicate = false;
    for (const bankQ of activeBank) {
      const pairCheck = checkPairwiseDeduplication(standardized, bankQ);

      if (pairCheck.matchLevel === 'tier2_near_exact') {
        report.nearDuplicates.push({
          questionId: standardized.id,
          duplicateWithId: bankQ.id,
          prompt: standardized.prompt,
          similarity: pairCheck.similarityScore
        });
        standardized.review!.status = 'pending_review';
        standardized.metadata!.isProductionReady = false;
        report.pendingReviewCount++;
        foundNearDuplicate = true;
        break;
      } else if (pairCheck.matchLevel === 'tier3_semantic_suspicious') {
        report.semanticSuspicious.push({
          questionId: standardized.id,
          duplicateWithId: bankQ.id,
          prompt: standardized.prompt,
          similarity: pairCheck.similarityScore
        });
        // Route to review rather than auto-rejecting
        standardized.review!.status = 'pending_review';
        standardized.metadata!.isProductionReady = false;
        report.pendingReviewCount++;
        break;
      }
    }

    // Step 5: ID Collision / Update Handling
    if (idMap.has(standardized.id)) {
      // Update in-place
      const idx = activeBank.findIndex((q) => q.id === standardized.id);
      if (idx !== -1) {
        activeBank[idx] = standardized;
        exactHashMap.set(exactHash, standardized);
        report.updatedCount++;
      }
    } else {
      // Insert new question
      activeBank.push(standardized);
      idMap.set(standardized.id, standardized);
      exactHashMap.set(exactHash, standardized);
      report.importedCount++;
    }
  }

  report.updatedBank = activeBank;
  return report;
}

/**
 * Retires or revokes a data source, immediately removing its questions from production availability
 */
export function retireSource(
  sourceId: string,
  questionBank: TestQuestion[]
): { updatedBank: TestQuestion[]; retiredCount: number } {
  // Update registry
  if (sourceRegistry.has(sourceId)) {
    const reg = sourceRegistry.get(sourceId)!;
    reg.active = false;
    reg.isVerified = false;
  }

  let count = 0;
  const updatedBank = questionBank.map((q) => {
    if (q.source?.sourceId === sourceId) {
      count++;
      return {
        ...q,
        review: {
          ...q.review,
          status: 'rejected' as ReviewStatus,
          reviewNotes: `Source '${sourceId}' has been revoked/retired.`
        },
        metadata: {
          createdAt: q.metadata?.createdAt || new Date().toISOString(),
          authorId: q.metadata?.authorId,
          isProductionReady: false,
          updatedAt: new Date().toISOString()
        }
      };
    }
    return q;
  });

  return { updatedBank, retiredCount: count };
}

// ============================================================================
// 4. BLUEPRINT-DRIVEN EXAM GENERATOR WITH SNAPSHOT STABILITY
// ============================================================================

export interface ExamGenerationOptions {
  blueprintId: 'toeic_2skills' | 'toeic_4skills' | 'ielts_custom_mock' | 'cefr_benchmark';
  targetLevel?: CEFRLevel | string;
  examId?: string;
  title?: string;
  titleVi?: string;
  maxAllowedExamOverlap?: number; // default 0.35 (35%)
  maxQuestionReuse?: number;      // default 3 exams
  targetQuestionCount?: number;
}

export interface ExamGenerationResult {
  status: 'ready' | 'insufficient_questions' | 'exam_duplicate_rejected';
  exam?: PracticeTest;
  availableCount: number;
  requiredCount: number;
  deficitCount: number;
  deficitBySkill: Record<string, number>;
  messageVi: string;
  updatedBank?: TestQuestion[];
}

/**
 * Assembles an authentic mock exam from the verified question bank
 */
export function generateExamFromQuestionBank(
  questionBank: TestQuestion[],
  existingExams: PracticeTest[],
  options: ExamGenerationOptions
): ExamGenerationResult {
  const maxOverlap = options.maxAllowedExamOverlap ?? 0.35;
  const maxReuse = options.maxQuestionReuse ?? 3;

  // 1. Filter bank to ONLY approved, production-ready, non-placeholder questions
  const candidatePool = questionBank.filter((q) => {
    if (q.review?.status !== 'approved') return false;
    if (q.metadata?.isProductionReady === false) return false;
    if (isPlaceholderQuestion(q)) return false;
    // Check reuse budget
    if (typeof q.usageCount === 'number' && q.usageCount >= maxReuse) return false;
    return true;
  });

  // 2. Define Blueprint Requirements
  interface SkillReq {
    skillMatch: (q: TestQuestion) => boolean;
    required: number;
    skillKey: string;
  }

  let skillRequirements: SkillReq[] = [];
  let durationMinutes = 60;
  let defaultType: PracticeTest['type'] = 'grammar_test';

  if (options.blueprintId === 'toeic_2skills') {
    defaultType = 'full_toeic';
    durationMinutes = 120;
    skillRequirements = [
      {
        skillKey: 'Listening',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'toeic_listening' ||
          q.skill === 'listening' ||
          q.section.toLowerCase().includes('listening')
      },
      {
        skillKey: 'Reading',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'toeic_reading' ||
          q.skill === 'reading' ||
          q.skill === 'grammar' ||
          q.skill === 'vocab' ||
          q.section.toLowerCase().includes('reading')
      }
    ];
  } else if (options.blueprintId === 'toeic_4skills') {
    defaultType = 'full_toeic';
    durationMinutes = 200;
    skillRequirements = [
      {
        skillKey: 'Listening',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'toeic_listening' ||
          q.skill === 'listening' ||
          q.section.toLowerCase().includes('listening')
      },
      {
        skillKey: 'Reading',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'toeic_reading' ||
          q.skill === 'reading' ||
          q.section.toLowerCase().includes('reading')
      },
      {
        skillKey: 'Speaking',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'speaking' ||
          q.itemType === 'speaking_recording'
      },
      {
        skillKey: 'Writing',
        required: 50,
        skillMatch: (q) =>
          q.skill === 'writing' ||
          q.itemType === 'essay' ||
          q.itemType === 'short_answer'
      }
    ];
  } else if (options.blueprintId === 'ielts_custom_mock') {
    defaultType = 'full_ielts';
    durationMinutes = 150;
    skillRequirements = [
      {
        skillKey: 'Listening',
        required: 25,
        skillMatch: (q) =>
          q.skill === 'ielts_listening' ||
          q.skill === 'listening' ||
          q.section.toLowerCase().includes('listening')
      },
      {
        skillKey: 'Reading',
        required: 25,
        skillMatch: (q) =>
          q.skill === 'ielts_reading' ||
          q.skill === 'reading' ||
          q.section.toLowerCase().includes('reading')
      },
      {
        skillKey: 'Writing',
        required: 25,
        skillMatch: (q) =>
          q.skill === 'ielts_writing' ||
          q.skill === 'writing'
      },
      {
        skillKey: 'Speaking',
        required: 25,
        skillMatch: (q) =>
          q.skill === 'ielts_speaking' ||
          q.skill === 'speaking'
      }
    ];
  } else {
    // CEFR Level Benchmark
    const targetCefr = (options.targetLevel || 'B1').toUpperCase() as CEFRLevel;
    defaultType = 'placement_test';
    durationMinutes = 60;
    const reqCount = options.targetQuestionCount ?? 30;
    skillRequirements = [
      {
        skillKey: `CEFR ${targetCefr}`,
        required: reqCount,
        skillMatch: (q) => (q.cefr || q.cefrLevel || '').toUpperCase() === targetCefr
      }
    ];
  }

  // 3. Selection with intra-exam deduplication & reuse budget
  const selectedQuestions: TestQuestion[] = [];
  const selectedIdSet = new Set<string>();
  const deficitBySkill: Record<string, number> = {};
  let totalRequired = 0;
  let totalAvailable = 0;

  for (const req of skillRequirements) {
    totalRequired += req.required;

    // Filter matching questions that haven't been picked for this exam yet
    const matching = candidatePool.filter(
      (q) => !selectedIdSet.has(q.id) && req.skillMatch(q)
    );

    // Sort matching pool by usageCount ASC to maximize diversity
    matching.sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0));

    totalAvailable += matching.length;

    if (matching.length < req.required) {
      deficitBySkill[req.skillKey] = req.required - matching.length;
    } else {
      deficitBySkill[req.skillKey] = 0;
      const picked = matching.slice(0, req.required);
      picked.forEach((q) => {
        selectedQuestions.push(q);
        selectedIdSet.add(q.id);
      });
    }
  }

  const totalDeficit = Object.values(deficitBySkill).reduce((acc, d) => acc + d, 0);

  if (totalDeficit > 0) {
    return {
      status: 'insufficient_questions',
      availableCount: selectedQuestions.length,
      requiredCount: totalRequired,
      deficitCount: totalDeficit,
      deficitBySkill,
      messageVi: `Ngân hàng câu hỏi chưa đủ câu chuẩn hóa cho cấu hình này (Hiện có: ${selectedQuestions.length}/${totalRequired}, Thiếu: ${totalDeficit} câu). Cam kết không tạo câu hỏi giả mạo.`
    };
  }

  // 4. Tier 4: Check Exam-Level Duplication against all existing exams
  const examDupCheck = checkExamLevelDuplication(
    selectedQuestions,
    existingExams,
    maxOverlap
  );

  if (examDupCheck.isDuplicate) {
    return {
      status: 'exam_duplicate_rejected',
      availableCount: selectedQuestions.length,
      requiredCount: totalRequired,
      deficitCount: 0,
      deficitBySkill: {},
      messageVi: examDupCheck.messageVi
    };
  }

  // 5. Create immutable snapshot for the exam
  const examId = options.examId || `test-gen-${options.blueprintId}-${Date.now()}`;
  const examSnapshot: TestQuestion[] = selectedQuestions.map((q, idx) => ({
    ...JSON.parse(JSON.stringify(q)), // Deep clone for snapshot stability
    questionNumber: idx + 1
  }));

  // Update bank usage counts & appearances
  const updatedBank = questionBank.map((q) => {
    if (selectedIdSet.has(q.id)) {
      return {
        ...q,
        usageCount: (q.usageCount || 0) + 1,
        examAppearances: [...(q.examAppearances || []), examId]
      };
    }
    return q;
  });

  const generatedExam: PracticeTest = {
    id: examId,
    title: options.title || `Mock Exam (${options.blueprintId.toUpperCase()})`,
    titleVi: options.titleVi || `Đề Thi Thử Chuẩn Hóa (${options.blueprintId})`,
    type: defaultType,
    durationMinutes,
    totalQuestions: examSnapshot.length,
    targetLevel: options.targetLevel || 'All Levels',
    descriptionVi: `Đề thi được biên soạn tự động từ ngân hàng câu hỏi chuẩn hóa qua pipeline kiểm định bản quyền & phát hiện trùng lặp.`,
    questions: examSnapshot,
    blueprint: {
      blueprintId: options.blueprintId as any,
      standardName: options.blueprintId,
      totalItems: examSnapshot.length,
      skillsBreakdown: []
    }
  };

  return {
    status: 'ready',
    exam: generatedExam,
    availableCount: examSnapshot.length,
    requiredCount: totalRequired,
    deficitCount: 0,
    deficitBySkill: {},
    messageVi: 'Tạo đề thi thành công với 100% câu hỏi độc lập và chuẩn hóa.',
    updatedBank
  };
}

// ============================================================================
// 5. AUDIT & INVENTORY REPORTING
// ============================================================================

export interface BankAuditReport {
  totalQuestions: number;
  approvedCount: number;
  pendingReviewCount: number;
  rejectedCount: number;
  distributionBySource: Record<string, number>;
  distributionBySkill: Record<string, number>;
  distributionByCefr: Record<string, number>;
  totalUsageAcrossExams: number;
  averageAppearancesPerQuestion: number;
  questionsNeverUsedCount: number;
}

export function generateQuestionBankAuditReport(
  bank: TestQuestion[]
): BankAuditReport {
  const bySource: Record<string, number> = {};
  const bySkill: Record<string, number> = {};
  const byCefr: Record<string, number> = {};

  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let totalUsage = 0;
  let neverUsed = 0;

  bank.forEach((q) => {
    const status = q.review?.status || 'approved';
    if (status === 'approved') approved++;
    else if (status === 'rejected') rejected++;
    else pending++;

    const sourceCat = q.source?.category || 'lingopeak_original';
    bySource[sourceCat] = (bySource[sourceCat] || 0) + 1;

    const skill = q.skill || 'reading';
    bySkill[skill] = (bySkill[skill] || 0) + 1;

    const cefr = (q.cefr || q.cefrLevel || 'Unknown').toUpperCase();
    byCefr[cefr] = (byCefr[cefr] || 0) + 1;

    const usage = q.usageCount || 0;
    totalUsage += usage;
    if (usage === 0) neverUsed++;
  });

  return {
    totalQuestions: bank.length,
    approvedCount: approved,
    pendingReviewCount: pending,
    rejectedCount: rejected,
    distributionBySource: bySource,
    distributionBySkill: bySkill,
    distributionByCefr: byCefr,
    totalUsageAcrossExams: totalUsage,
    averageAppearancesPerQuestion: bank.length === 0 ? 0 : Number((totalUsage / bank.length).toFixed(2)),
    questionsNeverUsedCount: neverUsed
  };
}
