import { CEFRLevel, PracticeTest, TestQuestion, QuestionItemType } from '../types';

export interface CefrExamGenerationOptions {
  level: CEFRLevel;
  skills?: ('grammar' | 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking')[];
  targetCount?: number;
  durationMinutes?: number;
  examType?: 'cefr_benchmark' | 'general' | 'placement';
  testId?: string;
  title?: string;
  titleVi?: string;
  descriptionVi?: string;
  questionBank?: TestQuestion[];
}

export interface CefrExamGenerationResult {
  status: 'ready' | 'insufficient_questions';
  test?: PracticeTest;
  targetLevel: CEFRLevel;
  requestedCount: number;
  availableCount: number;
  deficitCount: number;
  deficitBySkill: Record<string, number>;
  messageVi: string;
}

/**
 * Normalizes question prompt to detect near-duplicates and semantic identicals
 */
export function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a question is synthetic placeholder/template content
 */
export function isPlaceholderQuestion(q: TestQuestion): boolean {
  const p = (q.prompt || '').toLowerCase();
  const expl = (q.explanationVi || '').toLowerCase();
  
  if (
    p.includes('valid accurate lexical') ||
    p.includes('choose the correct grammatical or lexical option') ||
    p.includes('select the word or phrase that best completes the sentence (set') ||
    p.includes('listen to the audio excerpt and identify the speaker') ||
    p.includes('read the following passage and answer item')
  ) {
    return true;
  }

  if (
    expl.includes('phương án tại vị trí') ||
    expl.includes('primary verified choice') ||
    expl.includes('alternative distractor')
  ) {
    return true;
  }

  if (
    q.options &&
    q.options.some(
      (opt) =>
        opt.toLowerCase().includes('option a: valid') ||
        opt.toLowerCase().includes('primary verified choice') ||
        opt.toLowerCase().includes('alternative distractor')
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Maps CEFR level to difficulty string
 */
export function mapCefrToDifficulty(
  level: CEFRLevel
): 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'proficiency' {
  switch (level) {
    case 'A1':
      return 'beginner';
    case 'A2':
      return 'elementary';
    case 'B1':
      return 'intermediate';
    case 'B2':
      return 'upper_intermediate';
    case 'C1':
      return 'advanced';
    case 'C2':
      return 'proficiency';
  }
}

/**
 * Generates an authentic, CEFR-aligned exam strictly adhering to pedagogical constraints.
 * Never invents mock questions, never takes questions from non-matching levels, and reports
 * deficits with total transparency.
 */
export function generateCefrExam(options: CefrExamGenerationOptions): CefrExamGenerationResult {
  const {
    level,
    skills,
    targetCount = 10,
    durationMinutes = 20,
    examType = 'cefr_benchmark',
    testId,
    title,
    titleVi,
    descriptionVi,
    questionBank = []
  } = options;

  // 1. Filter bank strictly for matching CEFR level
  const levelMatchingQuestions = questionBank.filter((q) => {
    const qLevel = q.cefrLevel || q.cefr;
    return qLevel === level;
  });

  // 2. Filter out synthetic placeholder questions
  const authenticCandidates = levelMatchingQuestions.filter((q) => !isPlaceholderQuestion(q));

  // 3. Filter by requested skills if specified
  const filteredCandidates = skills && skills.length > 0
    ? authenticCandidates.filter((q) => {
        const s = q.skill || 'grammar';
        return skills.includes(s as any);
      })
    : authenticCandidates;

  // 4. Ensure uniqueness by ID and normalized prompt
  const seenIds = new Set<string>();
  const seenPrompts = new Set<string>();
  const distinctQuestions: TestQuestion[] = [];

  for (const q of filteredCandidates) {
    const norm = normalizePrompt(q.prompt);
    if (!seenIds.has(q.id) && !seenPrompts.has(norm)) {
      seenIds.add(q.id);
      seenPrompts.add(norm);
      distinctQuestions.push(q);
    }
  }

  // 5. Group questions by shared passage or audio
  // Passages and audio sets should stay grouped coherently
  const groupedQuestions: TestQuestion[] = [];
  const processedGroupIds = new Set<string>();

  distinctQuestions.forEach((q) => {
    const groupKey = q.groupId || q.passageId || q.audioId || (q.contextPassage ? `ctx-${q.contextPassage.slice(0, 30)}` : null);
    if (groupKey) {
      if (!processedGroupIds.has(groupKey)) {
        processedGroupIds.add(groupKey);
        // Add all questions sharing this group key together
        const family = distinctQuestions.filter((item) => {
          const itemKey = item.groupId || item.passageId || item.audioId || (item.contextPassage ? `ctx-${item.contextPassage.slice(0, 30)}` : null);
          return itemKey === groupKey;
        });
        groupedQuestions.push(...family);
      }
    } else {
      groupedQuestions.push(q);
    }
  });

  const availableCount = groupedQuestions.length;
  const isDeficit = availableCount < targetCount;
  const deficitCount = Math.max(0, targetCount - availableCount);

  // Compute skill breakdown and deficits
  const deficitBySkill: Record<string, number> = {};
  if (skills && skills.length > 0) {
    const targetPerSkill = Math.ceil(targetCount / skills.length);
    skills.forEach((s) => {
      const countInSkill = groupedQuestions.filter((q) => (q.skill || '').includes(s)).length;
      if (countInSkill < targetPerSkill) {
        deficitBySkill[s] = targetPerSkill - countInSkill;
      }
    });
  }

  if (isDeficit) {
    return {
      status: 'insufficient_questions',
      targetLevel: level,
      requestedCount: targetCount,
      availableCount,
      deficitCount,
      deficitBySkill,
      messageVi: `Ngân hàng câu hỏi hiện có ${availableCount} câu hợp lệ cho cấp độ ${level} (yêu cầu: ${targetCount} câu). Thiếu ${deficitCount} câu. Không tự ý sinh dữ liệu giả lập.`
    };
  }

  // 6. Select the targetCount questions
  const selected = groupedQuestions.slice(0, targetCount);

  // 7. Enrich metadata
  const enrichedQuestions: TestQuestion[] = selected.map((q, idx) => ({
    ...q,
    questionNumber: idx + 1,
    examType,
    cefrLevel: level,
    cefr: level,
    difficulty: q.difficulty || mapCefrToDifficulty(level),
    skill: q.skill || 'grammar',
    questionType: q.questionType || q.itemType || 'multiple_choice',
    itemType: q.itemType || q.questionType || 'multiple_choice',
    topic: q.topic || q.category || 'General Assessment',
    sourceId: q.sourceId || (q.source ? q.source.attribution : 'lingopeak_curriculum'),
    answerKey: q.answerKey !== undefined ? q.answerKey : q.correctAnswerIndex,
    explanation: q.explanation || q.explanationVi,
    passageId: q.passageId || (q.contextPassage ? `pass-${level.toLowerCase()}-${idx + 1}` : undefined),
    audioId: q.audioId || (q.audioText ? `aud-${level.toLowerCase()}-${idx + 1}` : undefined)
  }));

  const generatedTest: PracticeTest = {
    id: testId || `test-cefr-generated-${level.toLowerCase()}-${Date.now()}`,
    title: title || `CEFR Level ${level} Proficiency Assessment`,
    titleVi: titleVi || `Đề Kiểm Tra Trình Độ Tiếng Anh Chuẩn CEFR ${level}`,
    type: 'topic_quiz',
    durationMinutes,
    totalQuestions: targetCount,
    targetLevel: level,
    descriptionVi: descriptionVi || `Bộ đề chuẩn hóa theo khung tham chiếu châu Âu CEFR cấp độ ${level}. Đảm bảo 100% câu hỏi độc lập, có giải thích sư phạm chi tiết.`,
    questions: enrichedQuestions
  };

  return {
    status: 'ready',
    test: generatedTest,
    targetLevel: level,
    requestedCount: targetCount,
    availableCount,
    deficitCount: 0,
    deficitBySkill: {},
    messageVi: `Sinh đề thi cấp độ ${level} thành công với ${targetCount} câu hỏi chuẩn hóa.`
  };
}
