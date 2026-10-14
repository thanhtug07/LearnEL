import { PracticeTest, TestAttempt } from '../types';

export function evaluateTestSubmission(
  test: PracticeTest,
  userAnswers: Record<string, number>,
  secondsRemaining: number,
  flaggedQuestions: Iterable<string> | string[] = []
): TestAttempt {
  const questions = test?.questions || [];
  let correctCount = 0;
  const weaknessCategories: Record<string, { total: number; wrong: number }> = {};

  questions.forEach((q) => {
    const selected = userAnswers[q.id];
    const isCorrect = typeof selected === 'number' && selected === q.correctAnswerIndex;
    const cat = q.category || 'General';
    if (isCorrect) {
      correctCount++;
    } else {
      if (!weaknessCategories[cat]) {
        weaknessCategories[cat] = { total: 0, wrong: 0 };
      }
      weaknessCategories[cat].wrong++;
    }
    if (weaknessCategories[cat]) {
      weaknessCategories[cat].total++;
    }
  });

  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
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
    weaknessAnalysisVi: weaknessList.length > 0 ? weaknessList : ['Xuất sắc! Không có lỗi sai nghiêm trọng.'],
    recommendedLessonIds: ['les-toeic-1', 'les-daily-1']
  };

  return attempt;
}

export function formatTimer(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
