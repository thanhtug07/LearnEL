import { PracticeTest, TestAttempt, TestQuestion } from '../types';

export interface ExamSession {
  testId: string;
  userId?: string;
  startedAt: number;
  durationMinutes: number;
  targetEndTime: number;
  userAnswers: Record<string, number | string>;
  flaggedQuestions: string[];
  currentIndex: number;
  isSubmitted: boolean;
  questionIds?: string[];
  selectedQuestions?: TestQuestion[];
}

const memoryStorage: Record<string, string> = {};

function getSafeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {}
  return {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => {
      memoryStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete memoryStorage[key];
    }
  };
}

export function getExamSessionStorageKey(testId: string): string {
  return `lingopeak_exam_session_${testId}`;
}

export function loadExamSession(testId: string): ExamSession | null {
  try {
    const raw = getSafeStorage().getItem(getExamSessionStorageKey(testId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.testId === testId && typeof parsed.targetEndTime === 'number') {
        return parsed as ExamSession;
      }
    }
  } catch (e) {
    console.error('Failed to load exam session:', e);
  }
  return null;
}

export function saveExamSession(session: ExamSession): void {
  try {
    getSafeStorage().setItem(getExamSessionStorageKey(session.testId), JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save exam session:', e);
  }
}

export function clearExamSession(testId: string): void {
  try {
    getSafeStorage().removeItem(getExamSessionStorageKey(testId));
  } catch (e) {
    console.error('Failed to clear exam session:', e);
  }
}

export function calculateRemainingSeconds(session: { targetEndTime: number }): number {
  const now = Date.now();
  return Math.max(0, Math.floor((session.targetEndTime - now) / 1000));
}

export interface SectionGroup {
  sectionName: string;
  startIndex: number;
  endIndex: number;
  questions: TestQuestion[];
}

export function groupQuestionsBySection(questions: TestQuestion[]): SectionGroup[] {
  if (!questions || questions.length === 0) return [];

  const groups: SectionGroup[] = [];
  let currentGroup: SectionGroup | null = null;

  questions.forEach((q, idx) => {
    const secName = q.section || 'Phần thi chung';
    if (!currentGroup || currentGroup.sectionName !== secName) {
      if (currentGroup) {
        currentGroup.endIndex = idx - 1;
      }
      currentGroup = {
        sectionName: secName,
        startIndex: idx,
        endIndex: idx,
        questions: [q]
      };
      groups.push(currentGroup);
    } else {
      currentGroup.questions.push(q);
      currentGroup.endIndex = idx;
    }
  });

  return groups;
}

export function calculateEstimatedScore(
  test: PracticeTest,
  accuracy: number,
  correctCount: number
): { scoreText: string; bandOrLevel: string; descriptor: string } {
  const isToeic = test.type === 'full_toeic' || test.title.toLowerCase().includes('toeic');
  const isIelts = test.type === 'full_ielts' || test.title.toLowerCase().includes('ielts');

  if (isToeic) {
    // TOEIC scale mapping: roughly 100 - 495 per skill or 200-990 overall
    const scaledScore = Math.min(495, Math.max(50, Math.round(50 + (accuracy / 100) * 445)));
    let descriptor = 'Cần luyện thêm ngữ pháp và từ vựng công sở.';
    if (scaledScore >= 450) descriptor = 'Xuất sắc! Trình độ tương đương 900+ TOEIC.';
    else if (scaledScore >= 350) descriptor = 'Khá giỏi! Sẵn sàng chinh phục mốc 750+ TOEIC.';
    else if (scaledScore >= 250) descriptor = 'Đạt mức trung cấp. Cần cải thiện tốc độ đọc hiểu.';

    return {
      scoreText: `${scaledScore}/495`,
      bandOrLevel: `TOEIC ~${scaledScore * 2}`,
      descriptor
    };
  }

  if (isIelts) {
    let band = '5.0';
    let descriptor = 'Mức điểm trung bình, cần rèn luyện thêm từ vựng học thuật.';
    if (accuracy >= 90) {
      band = '8.5 - 9.0';
      descriptor = 'Thành thạo tự nhiên như người bản xứ.';
    } else if (accuracy >= 80) {
      band = '7.5 - 8.0';
      descriptor = 'Vận dụng tốt từ vựng nâng cao và câu phức ghép.';
    } else if (accuracy >= 70) {
      band = '6.5 - 7.0';
      descriptor = 'Đáp ứng chuẩn đầu ra đại học và du học.';
    } else if (accuracy >= 55) {
      band = '5.5 - 6.0';
      descriptor = 'Nắm vững ý chính, cần chú ý bẫy câu hỏi suy luận.';
    }

    return {
      scoreText: `Band ${band}`,
      bandOrLevel: `IELTS Band ${band}`,
      descriptor
    };
  }

  // Default CEFR placement
  let cefr = 'A1';
  let descriptor = 'Cấp độ mới bắt đầu làm quen.';
  if (accuracy >= 85) {
    cefr = 'C1 (Advanced)';
    descriptor = 'Thành thạo chuyên sâu, đọc hiểu văn bản học thuật phức tạp.';
  } else if (accuracy >= 70) {
    cefr = 'B2 (Upper-Intermediate)';
    descriptor = 'Giao tiếp tự tin, ngữ pháp và từ vựng vững chắc.';
  } else if (accuracy >= 50) {
    cefr = 'B1 (Intermediate)';
    descriptor = 'Có nền tảng cơ bản, diễn đạt được ý kiến thông dụng.';
  } else if (accuracy >= 30) {
    cefr = 'A2 (Elementary)';
    descriptor = 'Giao tiếp đơn giản trong ngữ cảnh quen thuộc.';
  }

  return {
    scoreText: cefr,
    bandOrLevel: cefr,
    descriptor
  };
}

export function evaluateTestSubmission(
  test: PracticeTest,
  userAnswers: Record<string, number | string>,
  secondsRemaining: number,
  flaggedQuestions: Iterable<string> | string[] = []
): TestAttempt {
  const questions = test?.questions || [];
  let correctCount = 0;
  let objectiveQuestionsCount = 0;
  const weaknessCategories: Record<string, { total: number; wrong: number }> = {};

  // Per-skill breakdown tracking
  const skillStats: Record<string, { raw: number; max: number; isSubjective: boolean; answered: number }> = {};

  questions.forEach((q) => {
    const rawSkill = (q.skill || 'general').toLowerCase();
    let skillGroup = 'reading';
    if (rawSkill.includes('listening')) skillGroup = 'listening';
    else if (rawSkill.includes('speaking')) skillGroup = 'speaking';
    else if (rawSkill.includes('writing')) skillGroup = 'writing';
    else if (rawSkill.includes('grammar') || rawSkill.includes('vocab')) skillGroup = 'reading';

    const isSubjective = q.itemType === 'speaking_recording' || q.itemType === 'essay';

    if (!skillStats[skillGroup]) {
      skillStats[skillGroup] = { raw: 0, max: 0, isSubjective, answered: 0 };
    }
    skillStats[skillGroup].max++;

    const answer = userAnswers[q.id];
    const hasAnswer = answer !== undefined && answer !== null && (typeof answer === 'number' || String(answer).trim().length > 0);
    if (hasAnswer) {
      skillStats[skillGroup].answered++;
    }

    if (!isSubjective) {
      objectiveQuestionsCount++;
      const isCorrect = typeof answer === 'number' && answer === q.correctAnswerIndex;
      const cat = q.category || 'General';
      if (isCorrect) {
        correctCount++;
        skillStats[skillGroup].raw++;
      } else {
        if (!weaknessCategories[cat]) {
          weaknessCategories[cat] = { total: 0, wrong: 0 };
        }
        weaknessCategories[cat].wrong++;
      }
      if (weaknessCategories[cat]) {
        weaknessCategories[cat].total++;
      }
    } else {
      // Subjective tasks
      if (hasAnswer) {
        skillStats[skillGroup].raw++;
      }
    }
  });

  // Build segregated skill scores
  const skillScores: Record<string, {
    rawScore: number;
    maxScore: number;
    percentage: number;
    status: 'graded' | 'pending_evaluation' | 'reference_ai_evaluated';
    detailsVi?: string;
  }> = {};

  Object.entries(skillStats).forEach(([sk, stats]) => {
    if (stats.isSubjective) {
      skillScores[sk] = {
        rawScore: stats.answered,
        maxScore: stats.max,
        percentage: stats.max > 0 ? Math.round((stats.answered / stats.max) * 100) : 0,
        status: 'pending_evaluation',
        detailsVi: `Đã nộp ${stats.answered}/${stats.max} nhiệm vụ — Đang chờ đánh giá theo rubric khảo thí.`
      };
    } else {
      skillScores[sk] = {
        rawScore: stats.raw,
        maxScore: stats.max,
        percentage: stats.max > 0 ? Math.round((stats.raw / stats.max) * 100) : 0,
        status: 'graded',
        detailsVi: `Đạt ${stats.raw}/${stats.max} câu trắc nghiệm chính xác.`
      };
    }
  });

  const totalQuestions = questions.length;
  // If there are objective questions, accuracy is based on them; otherwise 0
  const accuracy = objectiveQuestionsCount > 0 ? Math.round((correctCount / objectiveQuestionsCount) * 100) : 0;
  const timeSpent = Math.max(1, (test?.durationMinutes || 15) * 60 - secondsRemaining);

  const weaknessList: string[] = Object.entries(weaknessCategories)
    .filter(([_, stats]) => stats.wrong > 0)
    .map(([cat, stats]) => `Cần ôn luyện thêm chủ điểm: ${cat} (Sai ${stats.wrong}/${stats.total} câu)`);

  const attempt: TestAttempt = {
    id: `attempt-${test.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    testId: test.id,
    testTitle: test.title,
    date: new Date().toISOString().slice(0, 10),
    timeSpentSeconds: timeSpent,
    score: correctCount,
    totalQuestions: totalQuestions,
    accuracy,
    userAnswers,
    flaggedQuestions: Array.from(flaggedQuestions),
    weaknessAnalysisVi: weaknessList.length > 0 ? weaknessList : ['Xuất sắc! Không có lỗi sai trắc nghiệm nào.'],
    recommendedLessonIds: ['les-toeic-1', 'les-daily-1'],
    completedAt: new Date().toISOString(),
    skillScores
  };

  return attempt;
}

export function formatTimer(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
