import { PracticeTest, TestQuestion, CEFRLevel } from '../types';
import { isPlaceholderQuestion, normalizePrompt } from '../utils/cefrExamGenerator';

export type ExamHubCategoryKey =
  | 'all'
  | 'toeic_2skills'
  | 'toeic_4skills'
  | 'ielts_academic'
  | 'ielts_general'
  | 'cefr_a1'
  | 'cefr_a2'
  | 'cefr_b1'
  | 'cefr_b2'
  | 'cefr_c1'
  | 'cefr_c2';

export const PRACTICE_HUB_CATEGORIES: ExamHubCategoryKey[] = [
  'toeic_2skills',
  'toeic_4skills',
  'ielts_academic',
  'ielts_general',
  'cefr_a1',
  'cefr_a2',
  'cefr_b1',
  'cefr_b2',
  'cefr_c1',
  'cefr_c2'
];

export interface CategoryInventoryStatus {
  key: ExamHubCategoryKey;
  family: 'toeic' | 'ielts' | 'cefr' | 'all';
  nameVi: string;
  nameEn: string;
  targetGoal: number; // 50
  validCount: number;
  placeholderCount: number;
  totalCount: number;
  deficit: number;
  isReady: boolean;
  statusTextVi: string;
  blueprintSummaryVi: string;
  disclaimerVi?: string;
}

/**
 * Classifies a practice test into one of the canonical Exam Hub categories
 */
export function classifyTestCategory(test: PracticeTest): ExamHubCategoryKey {
  const title = (test.title + ' ' + (test.titleVi || '')).toLowerCase();
  const type = test.type;
  const targetLevel = (test.targetLevel || '').toUpperCase();

  // 1. IELTS Blueprints & Patterns (Prioritize checking IELTS first to avoid '4 skills' substring collisions)
  if (
    title.includes('general training') ||
    title.includes('ielts general')
  ) {
    return 'ielts_general';
  }

  if (
    test.blueprint?.blueprintId === 'ielts_custom_mock' ||
    type === 'full_ielts' ||
    title.includes('ielts') ||
    targetLevel.includes('IELTS') ||
    targetLevel.includes('BAND')
  ) {
    return 'ielts_academic';
  }

  // 2. TOEIC 4 Skills
  if (
    test.blueprint?.blueprintId === 'toeic_4skills' ||
    (title.includes('toeic') && (title.includes('4 skills') || title.includes('4 kỹ năng') || title.includes('200'))) ||
    (!title.includes('ielts') && (title.includes('4 skills') || title.includes('4 kỹ năng')))
  ) {
    return 'toeic_4skills';
  }

  // 3. TOEIC 2 Skills
  if (
    test.blueprint?.blueprintId === 'toeic_2skills' ||
    type === 'full_toeic' ||
    title.includes('toeic') ||
    targetLevel.includes('TOEIC')
  ) {
    return 'toeic_2skills';
  }

  // 5. CEFR Levels
  if (targetLevel === 'A1') return 'cefr_a1';
  if (targetLevel === 'A2') return 'cefr_a2';
  if (targetLevel === 'B1') return 'cefr_b1';
  if (targetLevel === 'B2') return 'cefr_b2';
  if (targetLevel === 'C1') return 'cefr_c1';
  if (targetLevel === 'C2') return 'cefr_c2';

  // Fallback to first question's level
  const firstQLevel = (test.questions?.[0]?.cefrLevel || test.questions?.[0]?.cefr)?.toUpperCase();
  if (firstQLevel === 'A1') return 'cefr_a1';
  if (firstQLevel === 'A2') return 'cefr_a2';
  if (firstQLevel === 'B1') return 'cefr_b1';
  if (firstQLevel === 'B2') return 'cefr_b2';
  if (firstQLevel === 'C1') return 'cefr_c1';
  if (firstQLevel === 'C2') return 'cefr_c2';

  return 'cefr_b1';
}

/**
 * Validates whether a practice test is genuinely authored and production-ready
 */
export function isTestValidAndAuthentic(test: PracticeTest): boolean {
  if (!test.questions || test.questions.length === 0) return false;

  // If any question is synthetic placeholder text, it is not marked as fully verified
  for (const q of test.questions) {
    if (isPlaceholderQuestion(q)) return false;
    if (!q.id || !q.prompt) return false;
    if (!q.explanationVi && !q.explanation) return false;
    if (!q.options || q.options.length < 2) return false;
  }

  return true;
}

/**
 * Computes live, honest category inventory statistics across all practice tests
 */
export function computeCategoryInventories(tests: PracticeTest[]): Record<ExamHubCategoryKey, CategoryInventoryStatus> {
  const TARGET_GOAL = 50;

  const base: Record<ExamHubCategoryKey, CategoryInventoryStatus> = {
    all: {
      key: 'all',
      family: 'all',
      nameVi: 'Tất Cả Kỳ Thi & Trình Độ',
      nameEn: 'All Exams & Levels',
      targetGoal: TARGET_GOAL * 9, // 450 total
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: 0,
      isReady: true,
      statusTextVi: 'Tổng quan hệ thống thi',
      blueprintSummaryVi: 'Toàn bộ ngân hàng đề thi chuẩn hóa của LingoPeak'
    },
    toeic_2skills: {
      key: 'toeic_2skills',
      family: 'toeic',
      nameVi: 'TOEIC 2 Skills (Listening & Reading)',
      nameEn: 'TOEIC 2 Skills (LR)',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang triển khai',
      blueprintSummaryVi: 'Chuẩn 100 câu: 50 Listening có audio + 50 Reading'
    },
    toeic_4skills: {
      key: 'toeic_4skills',
      family: 'toeic',
      nameVi: 'TOEIC 4 Skills (Listening, Reading, Speaking, Writing)',
      nameEn: 'TOEIC 4 Skills (LRSW)',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang triển khai',
      blueprintSummaryVi: 'Chuẩn 200 mục: 50 LC + 50 RC + 50 Ghi âm Speaking + 50 Soạn thảo Writing'
    },
    ielts_academic: {
      key: 'ielts_academic',
      family: 'ielts',
      nameVi: 'IELTS Academic',
      nameEn: 'IELTS Academic Mock',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang triển khai',
      blueprintSummaryVi: 'Chuẩn 100 mục: 25 LC + 25 RC + 25 Writing + 25 Speaking',
      disclaimerVi: 'Cấu hình luyện thi tùy chỉnh của LingoPeak, không thay thế chứng chỉ chính thức của IDP/BC.'
    },
    ielts_general: {
      key: 'ielts_general',
      family: 'ielts',
      nameVi: 'IELTS General Training',
      nameEn: 'IELTS General Training',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: false,
      statusTextVi: 'Chưa sẵn sàng',
      blueprintSummaryVi: 'Đang biên tập ngân hàng đề General Training chính thống',
      disclaimerVi: 'Hệ thống chưa có bộ dữ liệu chuẩn hóa General Training. Cam kết không tạo đề giả lập.'
    },
    cefr_a1: {
      key: 'cefr_a1',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR A1 (Căn Bản)',
      nameEn: 'CEFR A1 Breakthrough',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'Ngữ pháp thường nhật, thông báo ngắn, hội thoại giao tiếp A1'
    },
    cefr_a2: {
      key: 'cefr_a2',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR A2 (Sơ Cấp)',
      nameEn: 'CEFR A2 Waystage',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'So sánh, quá khứ đơn, email thư từ, đặt hẹn A2'
    },
    cefr_b1: {
      key: 'cefr_b1',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR B1 (Trung Cấp)',
      nameEn: 'CEFR B1 Threshold',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'Hiện tại hoàn thành, câu điều kiện, bài báo xã hội, phỏng vấn B1'
    },
    cefr_b2: {
      key: 'cefr_b2',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR B2 (Trung Cao Cấp)',
      nameEn: 'CEFR B2 Vantage',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'Đảo ngữ, mệnh đề phân từ, báo cáo học thuật, thảo luận B2'
    },
    cefr_c1: {
      key: 'cefr_c1',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR C1 (Cao Cấp)',
      nameEn: 'CEFR C1 Effective Proficiency',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'Câu chẻ, thành ngữ bác học, luận văn khoa học, hội thảo C1'
    },
    cefr_c2: {
      key: 'cefr_c2',
      family: 'cefr',
      nameVi: 'Luyện đề CEFR C2 (Thành Thạo Đỉnh Cao)',
      nameEn: 'CEFR C2 Mastery',
      targetGoal: TARGET_GOAL,
      validCount: 0,
      placeholderCount: 0,
      totalCount: 0,
      deficit: TARGET_GOAL,
      isReady: true,
      statusTextVi: 'Đang biên tập',
      blueprintSummaryVi: 'Sắc thái tinh tế, triết học ngôn ngữ, tranh biện học thuật C2'
    }
  };

  tests.forEach((test) => {
    const cat = classifyTestCategory(test);
    const isValid = isTestValidAndAuthentic(test);

    base.all.totalCount++;
    if (isValid) base.all.validCount++;
    else base.all.placeholderCount++;

    if (base[cat]) {
      base[cat].totalCount++;
      if (isValid) {
        base[cat].validCount++;
      } else {
        base[cat].placeholderCount++;
      }
    }
  });

  // Calculate deficits
  Object.keys(base).forEach((k) => {
    const key = k as ExamHubCategoryKey;
    base[key].deficit = Math.max(0, base[key].targetGoal - base[key].validCount);
    if (key === 'ielts_general') {
      base[key].statusTextVi = 'Chưa sẵn sàng (0/50 đề)';
    } else if (base[key].validCount >= base[key].targetGoal) {
      base[key].statusTextVi = `Đã hoàn thành mục tiêu (${base[key].validCount}/${base[key].targetGoal} đề)`;
    } else {
      base[key].statusTextVi = `Hiện có ${base[key].validCount}/${base[key].targetGoal} đề (Thiếu ${base[key].deficit} đề)`;
    }
  });

  return base;
}
