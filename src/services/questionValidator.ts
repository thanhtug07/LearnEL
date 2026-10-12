import {
  TestQuestion,
  QuestionValidationIssue,
  QuestionValidationResult,
  QuestionBatchValidationReport,
  CEFRLevel,
  ContentSourceCategory,
  ReviewStatus
} from '../types';

const VALID_CEFR: Set<CEFRLevel> = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

const VALID_SOURCE_CATEGORIES: Set<ContentSourceCategory> = new Set([
  'original_project',
  'ai_assisted_reviewed',
  'licensed_third_party',
  'official_sample'
]);

const VALID_REVIEW_STATUSES: Set<ReviewStatus> = new Set([
  'draft',
  'pending_review',
  'approved',
  'rejected'
]);

/**
 * Normalizes text for similarity comparison (lowercase, alphanumeric only).
 */
export function normalizePrompt(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes Jaccard word similarity between two normalized strings.
 */
export function computePromptSimilarity(promptA: string, promptB: string): number {
  const wordsA = new Set(normalizePrompt(promptA).split(' ').filter(Boolean));
  const wordsB = new Set(normalizePrompt(promptB).split(' ').filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });

  const union = new Set([...wordsA, ...wordsB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Deterministic single-question validator.
 */
export function validateQuestion(q: Partial<TestQuestion>): QuestionValidationResult {
  const issues: QuestionValidationIssue[] = [];
  const qId = q.id?.trim() || 'unknown-id';

  // 1. ID check
  if (!q.id || typeof q.id !== 'string' || q.id.trim() === '') {
    issues.push({
      field: 'id',
      type: 'error',
      code: 'MISSING_ID',
      message: 'Question ID is required and cannot be empty.'
    });
  } else if (!/^[a-zA-Z0-9_-]+$/.test(q.id.trim())) {
    issues.push({
      field: 'id',
      type: 'warning',
      code: 'NON_STANDARD_ID',
      message: 'Question ID should only contain letters, numbers, dashes, and underscores.'
    });
  }

  // 2. Prompt check
  if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.trim().length < 5) {
    issues.push({
      field: 'prompt',
      type: 'error',
      code: 'INVALID_PROMPT',
      message: 'Question prompt must be at least 5 characters.'
    });
  }

  // 3. Options check
  if (!Array.isArray(q.options) || q.options.length < 2) {
    issues.push({
      field: 'options',
      type: 'error',
      code: 'INSUFFICIENT_OPTIONS',
      message: 'Question must have at least 2 options (standard is 4).'
    });
  } else {
    // Check for empty options
    const emptyIdx = q.options.findIndex((opt) => typeof opt !== 'string' || opt.trim() === '');
    if (emptyIdx !== -1) {
      issues.push({
        field: `options[${emptyIdx}]`,
        type: 'error',
        code: 'EMPTY_OPTION',
        message: `Option at index ${emptyIdx} cannot be empty.`
      });
    }

    // Check for duplicate options (e.g. ['play', 'played', 'play', 'plays'])
    const trimmedOptions = q.options.map((opt) => (typeof opt === 'string' ? opt.trim().toLowerCase() : ''));
    const uniqueOptions = new Set(trimmedOptions);
    if (uniqueOptions.size < trimmedOptions.length) {
      issues.push({
        field: 'options',
        type: 'error',
        code: 'DUPLICATE_OPTIONS',
        message: 'Options contain duplicate values. All distractors must be distinct.'
      });
    }
  }

  // 4. Correct answer index check
  const optionsLength = Array.isArray(q.options) ? q.options.length : 0;
  if (
    typeof q.correctAnswerIndex !== 'number' ||
    !Number.isInteger(q.correctAnswerIndex) ||
    q.correctAnswerIndex < 0 ||
    q.correctAnswerIndex >= optionsLength
  ) {
    issues.push({
      field: 'correctAnswerIndex',
      type: 'error',
      code: 'INVALID_ANSWER_INDEX',
      message: `Correct answer index (${q.correctAnswerIndex}) must be an integer between 0 and ${optionsLength - 1}.`
    });
  }

  // 5. Explanation check
  if (!q.explanationVi || typeof q.explanationVi !== 'string' || q.explanationVi.trim().length < 10) {
    issues.push({
      field: 'explanationVi',
      type: 'error',
      code: 'MISSING_EXPLANATION',
      message: 'Vietnamese pedagogical explanation must be at least 10 characters explaining why the answer is correct.'
    });
  }

  // 6. CEFR Level check
  if (q.cefr && !VALID_CEFR.has(q.cefr)) {
    issues.push({
      field: 'cefr',
      type: 'error',
      code: 'INVALID_CEFR_LEVEL',
      message: `CEFR level '${q.cefr}' is invalid. Allowed levels: A1, A2, B1, B2, C1, C2.`
    });
  }

  // 7. Source & Attribution check
  if (q.source) {
    if (!VALID_SOURCE_CATEGORIES.has(q.source.category)) {
      issues.push({
        field: 'source.category',
        type: 'error',
        code: 'INVALID_SOURCE_CATEGORY',
        message: `Source category '${q.source.category}' is invalid. Must be one of: original_project, ai_assisted_reviewed, licensed_third_party, official_sample.`
      });
    }

    if (!q.source.attribution || q.source.attribution.trim().length === 0) {
      issues.push({
        field: 'source.attribution',
        type: 'error',
        code: 'MISSING_ATTRIBUTION',
        message: 'Source attribution is required.'
      });
    }

    if (!q.source.licenseOrPermission || q.source.licenseOrPermission.trim().length === 0) {
      issues.push({
        field: 'source.licenseOrPermission',
        type: 'error',
        code: 'MISSING_LICENSE',
        message: 'License or permission statement is required.'
      });
    }

    // Protection rule: AI-generated questions cannot be labeled as official sample
    if (q.source.creationMethod === 'ai_assisted' && q.source.category === 'official_sample') {
      issues.push({
        field: 'source.category',
        type: 'error',
        code: 'MISLABELED_AI_AS_OFFICIAL',
        message: 'Rule violation: Original AI-generated questions must not be labeled as official TOEIC/IELTS questions.'
      });
    }
  } else {
    issues.push({
      field: 'source',
      type: 'warning',
      code: 'MISSING_SOURCE_METADATA',
      message: 'Question is missing source category and licensing metadata.'
    });
  }

  // 8. Review status check
  if (q.review?.status && !VALID_REVIEW_STATUSES.has(q.review.status)) {
    issues.push({
      field: 'review.status',
      type: 'error',
      code: 'INVALID_REVIEW_STATUS',
      message: `Review status '${q.review.status}' is invalid. Must be draft, pending_review, approved, or rejected.`
    });
  }

  // 9. Listening specific checks: No fake 404 audio URLs!
  const isListening =
    q.section?.toLowerCase().includes('listening') ||
    q.skill === 'listening' ||
    q.skill === 'toeic_listening' ||
    q.skill === 'ielts_listening';

  if (isListening) {
    const hasAudioText = Boolean(q.audioText && q.audioText.trim().length > 0);
    const hasAudioUrl = Boolean(q.audioUrl && q.audioUrl.trim().length > 0);

    if (!hasAudioText && !hasAudioUrl) {
      issues.push({
        field: 'audioText',
        type: 'error',
        code: 'MISSING_AUDIO_SOURCE',
        message: 'Listening questions must have either an audio transcript (audioText) for TTS playback or a verified playable audioUrl.'
      });
    }

    if (hasAudioUrl && q.audioUrl?.includes('example.com')) {
      issues.push({
        field: 'audioUrl',
        type: 'error',
        code: 'INVENTED_AUDIO_URL',
        message: 'Audio URL cannot be a placeholder or invented domain. Use audioText for browser TTS or provide an active audio asset.'
      });
    }
  }

  const hasErrors = issues.some((i) => i.type === 'error');

  return {
    questionId: qId,
    isValid: !hasErrors,
    issues
  };
}

/**
 * Batch validator that also detects duplicate IDs and duplicate prompts.
 */
export function validateQuestionBatch(
  questions: Partial<TestQuestion>[],
  existingQuestions: TestQuestion[] = []
): QuestionBatchValidationReport {
  const results: QuestionValidationResult[] = [];
  const idSet = new Map<string, number>(); // id -> count in batch
  const existingIdSet = new Set(existingQuestions.map((q) => q.id));

  // Pass 0: Count all ID occurrences across the batch
  questions.forEach((q) => {
    const qId = q.id?.trim();
    if (qId) {
      idSet.set(qId, (idSet.get(qId) || 0) + 1);
    }
  });

  // Map to track prompts for near-duplicate detection
  const promptList: { id: string; prompt: string; normalized: string }[] = [];
  const duplicateGroups: { id: string; prompt: string; duplicateWithIds: string[] }[] = [];

  // Pass 1: Individual validations and ID duplicate counting
  questions.forEach((q) => {
    const res = validateQuestion(q);
    const qId = q.id?.trim() || '';

    if (qId) {
      const occurrenceCount = idSet.get(qId) || 0;
      if (occurrenceCount > 1) {
        res.isValid = false;
        res.issues.push({
          field: 'id',
          type: 'error',
          code: 'DUPLICATE_ID_IN_BATCH',
          message: `Question ID '${qId}' is duplicated in this batch (${occurrenceCount} occurrences).`
        });
      }

      if (existingIdSet.has(qId)) {
        res.issues.push({
          field: 'id',
          type: 'warning',
          code: 'OVERWRITES_EXISTING_ID',
          message: `Question ID '${qId}' already exists in question bank and will update the existing record.`
        });
      }
    }

    if (q.prompt) {
      promptList.push({
        id: qId,
        prompt: q.prompt,
        normalized: normalizePrompt(q.prompt)
      });
    }

    results.push(res);
  });

  // Pass 2: Prompt similarity / duplicate check
  for (let i = 0; i < promptList.length; i++) {
    const itemA = promptList[i];
    const dupWith: string[] = [];

    for (let j = i + 1; j < promptList.length; j++) {
      const itemB = promptList[j];
      const similarity = computePromptSimilarity(itemA.prompt, itemB.prompt);
      if (similarity >= 0.88) {
        dupWith.push(itemB.id);

        // Flag item B
        const bResult = results.find((r) => r.questionId === itemB.id);
        if (bResult) {
          bResult.issues.push({
            field: 'prompt',
            type: 'warning',
            code: 'HIGH_PROMPT_SIMILARITY',
            message: `Question prompt is ${Math.round(similarity * 100)}% similar to question '${itemA.id}'. Check for unintentional duplication.`
          });
        }
      }
    }

    if (dupWith.length > 0) {
      duplicateGroups.push({
        id: itemA.id,
        prompt: itemA.prompt,
        duplicateWithIds: dupWith
      });
    }
  }

  const validCount = results.filter((r) => r.isValid).length;
  const invalidCount = results.filter((r) => !r.isValid).length;
  const duplicateCount = duplicateGroups.length;

  return {
    totalQuestions: questions.length,
    validCount,
    invalidCount,
    duplicateCount,
    results,
    duplicateGroups
  };
}

/**
 * Safely parse JSON batch of questions.
 */
export function parseQuestionsFromJSON(rawJson: string): {
  questions: Partial<TestQuestion>[];
  parseError?: string;
} {
  try {
    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed)) {
      return { questions: parsed };
    }
    if (parsed && Array.isArray(parsed.questions)) {
      return { questions: parsed.questions };
    }
    return {
      questions: [],
      parseError: 'JSON must be an array of questions or an object with a "questions" array.'
    };
  } catch (err: any) {
    return { questions: [], parseError: `Invalid JSON format: ${err?.message}` };
  }
}

/**
 * Safely parse CSV batch of questions.
 * Expected columns: id, prompt, optionA, optionB, optionC, optionD, correctAnswerIndex, explanationVi, category, cefr, skill, sourceCategory
 */
export function parseQuestionsFromCSV(rawCsv: string): {
  questions: Partial<TestQuestion>[];
  parseError?: string;
} {
  try {
    const lines = rawCsv
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return { questions: [], parseError: 'CSV must have at least a header row and one data row.' };
    }

    // Split CSV line respecting quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const questions: Partial<TestQuestion>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every((c) => c === '')) continue;

      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = cols[idx] || '';
      });

      // Extract options: either separate optionA..D or pipe-separated options column
      let options: string[] = [];
      if (row.options) {
        options = row.options.split('|').map((o) => o.trim()).filter(Boolean);
      } else {
        ['optiona', 'optionb', 'optionc', 'optiond'].forEach((key) => {
          if (row[key]) options.push(row[key]);
        });
      }

      const q: Partial<TestQuestion> = {
        id: row.id || `csv-q-${i}`,
        prompt: row.prompt || '',
        options,
        correctAnswerIndex: parseInt(row.correctanswerindex || row.answerindex || '0', 10),
        explanationVi: row.explanationvi || row.explanation || '',
        category: row.category || 'General Practice',
        cefr: (row.cefr?.toUpperCase() as CEFRLevel) || 'B1',
        skill: (row.skill?.toLowerCase() as any) || 'grammar',
        source: {
          category: (row.sourcecategory?.toLowerCase() as any) || 'original_project',
          attribution: row.attribution || 'LingoPeak Curriculum Team',
          licenseOrPermission: row.license || 'LingoPeak Internal Educational License',
          creationMethod: 'human_authored',
          contentVersion: '1.0.0'
        },
        review: {
          status: 'pending_review'
        }
      };

      questions.push(q);
    }

    return { questions };
  } catch (err: any) {
    return { questions: [], parseError: `Failed to parse CSV: ${err?.message}` };
  }
}
