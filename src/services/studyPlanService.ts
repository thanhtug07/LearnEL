import { UserProfile, Course, VocabularyItem, GrammarTopic, TestAttempt, CEFRLevel, TargetExam } from '../types';

export interface StudyMilestone {
  id: string;
  stageNumber: number;
  level: CEFRLevel;
  titleVi: string;
  titleEn: string;
  targetDescriptionVi: string;
  estimatedWeeks: number;
  requiredXp: number;
  skillsFocus: ('grammar' | 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'writing')[];
  recommendedCourseIds: string[];
  recommendedTestIds: string[];
  modules: {
    id: string;
    name: string;
    nameVi: string;
    courseId?: string;
    lessonId?: string;
    testId?: string;
    type: 'lesson' | 'quiz' | 'exam' | 'vocab_drill' | 'speaking_checkpoint';
    durationMinutes: number;
    completed: boolean;
  }[];
  status: 'completed' | 'in_progress' | 'upcoming' | 'locked';
  progressPercentage: number;
}

export interface DailyStudyTask {
  id: string;
  titleVi: string;
  titleEn: string;
  category: 'lesson' | 'vocab' | 'grammar' | 'exam' | 'speaking' | 'listening';
  actionTab: 'courses' | 'vocabulary' | 'grammar' | 'practice-tests' | 'speaking' | 'listening' | 'writing' | 'ielts' | 'toeic';
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  linkPayload?: {
    courseId?: string;
    lessonId?: string;
    testId?: string;
  };
}

export interface PersonalizedPlan {
  currentLevel: CEFRLevel;
  targetExam: TargetExam;
  targetScore: string;
  dailyMinutesGoal: number;
  totalEstimatedHours: number;
  totalEstimatedWeeks: number;
  targetCompletionDate: string; // ISO date string YYYY-MM-DD
  overallProgressPercentage: number;
  milestones: StudyMilestone[];
  dailyTasks: DailyStudyTask[];
  strengths: string[];
  areasToImprove: string[];
}

export const CEFR_ORDER: Record<CEFRLevel, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
  C2: 6
};

export const CEFR_DETAILS: Record<CEFRLevel, {
  nameVi: string;
  targetVocab: number;
  estimatedHoursFromZero: number;
  descriptionVi: string;
  ieltsEquivalent: string;
  toeicEquivalent: string;
}> = {
  A1: {
    nameVi: 'Khởi động / Cơ bản (Beginner)',
    targetVocab: 600,
    estimatedHoursFromZero: 80,
    descriptionVi: 'Hiểu và sử dụng các biểu đạt quen thuộc hàng ngày và các câu đơn giản.',
    ieltsEquivalent: 'Band 1.0 - 2.5',
    toeicEquivalent: '120 - 225'
  },
  A2: {
    nameVi: 'Sơ cấp (Elementary)',
    targetVocab: 1200,
    estimatedHoursFromZero: 180,
    descriptionVi: 'Giao tiếp trong các tình huống thường nhật đơn giản, trao đổi thông tin quen thuộc.',
    ieltsEquivalent: 'Band 3.0 - 3.5',
    toeicEquivalent: '230 - 545'
  },
  B1: {
    nameVi: 'Trung cấp (Intermediate)',
    targetVocab: 2500,
    estimatedHoursFromZero: 350,
    descriptionVi: 'Hiểu các ý chính của chủ đề quen thuộc, xử lý hầu hết các tình huống du lịch hoặc công việc.',
    ieltsEquivalent: 'Band 4.0 - 5.0',
    toeicEquivalent: '550 - 745'
  },
  B2: {
    nameVi: 'Trung cấp cao (Upper-Intermediate)',
    targetVocab: 4000,
    estimatedHoursFromZero: 550,
    descriptionVi: 'Hiểu ý chính của các văn bản phức tạp, trao đổi lưu loát tự nhiên với người bản ngữ.',
    ieltsEquivalent: 'Band 5.5 - 6.5',
    toeicEquivalent: '750 - 850'
  },
  C1: {
    nameVi: 'Cao cấp (Advanced)',
    targetVocab: 6500,
    estimatedHoursFromZero: 800,
    descriptionVi: 'Sử dụng ngôn ngữ linh hoạt cho mục đích xã hội, học thuật và chuyên môn công việc.',
    ieltsEquivalent: 'Band 7.0 - 8.0',
    toeicEquivalent: '855 - 945'
  },
  C2: {
    nameVi: 'Thành thạo (Proficiency / Mastery)',
    targetVocab: 10000,
    estimatedHoursFromZero: 1100,
    descriptionVi: 'Hiểu một cách dễ dàng hầu hết mọi nội dung đọc hoặc nghe, diễn đạt cực kỳ tinh tế và chuẩn xác.',
    ieltsEquivalent: 'Band 8.5 - 9.0',
    toeicEquivalent: '950 - 990'
  }
};

/**
 * Calculates estimated study weeks from current level to target
 */
export function calculateEstimatedStudyWeeks(
  currentLevel: CEFRLevel,
  targetExam: TargetExam,
  dailyMinutes: number
): { totalHours: number; totalWeeks: number; completionDate: string } {
  const currentRank = CEFR_ORDER[currentLevel] || 3;
  let targetRank = 4; // default B2

  if (targetExam === 'IELTS') {
    targetRank = Math.max(currentRank + 1, 5); // C1
  } else if (targetExam === 'TOEIC') {
    targetRank = Math.max(currentRank + 1, 4); // B2
  } else if (targetExam === 'COMMUNICATION') {
    targetRank = Math.max(currentRank + 1, 3); // B1
  } else {
    targetRank = Math.min(6, currentRank + 1);
  }

  const currentHours = CEFR_DETAILS[currentLevel]?.estimatedHoursFromZero || 350;
  const targetLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const targetLevelKey = targetLevels[Math.min(5, Math.max(0, targetRank - 1))];
  const targetHours = CEFR_DETAILS[targetLevelKey]?.estimatedHoursFromZero || 550;

  const neededHours = Math.max(30, targetHours - currentHours);
  const safeDailyMinutes = Math.max(15, dailyMinutes || 30);
  const weeklyHours = (safeDailyMinutes * 7) / 60;
  const totalWeeks = Math.max(2, Math.ceil(neededHours / weeklyHours));

  const now = new Date();
  const finishDate = new Date(now.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000);
  const completionDate = finishDate.toISOString().split('T')[0];

  return {
    totalHours: neededHours,
    totalWeeks,
    completionDate
  };
}

/**
 * Helper to determine if a lesson is completed
 */
function isLessonCompleted(courses: Course[], courseId?: string, lessonId?: string): boolean {
  if (!courseId || !lessonId) return false;
  const course = courses.find((c) => c.id === courseId);
  if (!course) return false;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson && lesson.isCompleted) return true;
  }
  return false;
}

/**
 * Helper to determine if a test attempt exists and passed
 */
function isTestPassed(testAttempts: TestAttempt[], testId?: string): boolean {
  if (!testId) return false;
  return testAttempts.some((a) => a.testId === testId && a.accuracy >= 60);
}

/**
 * Generates a full personalized study plan tailored to the user profile and current progress
 */
export function generatePersonalizedPlan(
  user: UserProfile,
  courses: Course[],
  testAttempts: TestAttempt[],
  vocabulary: VocabularyItem[],
  grammarTopics: GrammarTopic[]
): PersonalizedPlan {
  const currentLvl = user.level || 'B1';
  const exam = user.targetExam || 'IELTS';
  const score = user.targetScore || (exam === 'IELTS' ? 'Band 7.0' : exam === 'TOEIC' ? '750+' : 'Fluency');
  const dailyMins = user.dailyMinutesGoal || 30;

  const { totalHours, totalWeeks, completionDate } = calculateEstimatedStudyWeeks(currentLvl, exam, dailyMins);

  // Generate customized milestones based on user level and goal
  const milestones: StudyMilestone[] = [];

  // Stage 1: Current Level Consolidation / Gap Fixing
  const stage1Title =
    currentLvl === 'A1' || currentLvl === 'A2'
      ? { vi: 'Giai đoạn 1: Xây Dựng Nền Tảng Phản Xạ & Phát Âm Chuẩn', en: 'Stage 1: Core Fundamentals & Pronunciation' }
      : currentLvl === 'B1'
      ? { vi: 'Giai đoạn 1: Chuẩn Hóa Ngữ Pháp & Mở Rộng Vốn Từ Trung Cấp', en: 'Stage 1: Grammar Mastery & Intermediate Lexicon' }
      : { vi: 'Giai đoạn 1: Nâng Cấp Từ Vựng Học Thuật & Đọc Hiểu Nâng Cao', en: 'Stage 1: Academic Collocations & Critical Reading' };

  const stage1Modules = [
    {
      id: 'm1-1',
      name: 'Thói quen sinh hoạt & Quản lý thời gian',
      nameVi: 'Thói quen sinh hoạt & Quản lý thời gian',
      courseId: 'course-daily-routine',
      lessonId: 'les-daily-1',
      type: 'lesson' as const,
      durationMinutes: 15,
      completed: isLessonCompleted(courses, 'course-daily-routine', 'les-daily-1')
    },
    {
      id: 'm1-2',
      name: 'Giao tiếp gọi đồ uống & Nhà hàng',
      nameVi: 'Giao tiếp gọi đồ uống & Nhà hàng',
      courseId: 'course-daily-routine',
      lessonId: 'les-daily-2',
      type: 'lesson' as const,
      durationMinutes: 15,
      completed: isLessonCompleted(courses, 'course-daily-routine', 'les-daily-2')
    },
    {
      id: 'm1-3',
      name: 'Kiểm tra trình độ phân loại (Placement Benchmark)',
      nameVi: 'Kiểm tra trình độ phân loại (Placement Benchmark)',
      testId: 'test-placement',
      type: 'quiz' as const,
      durationMinutes: 20,
      completed: isTestPassed(testAttempts, 'test-placement')
    }
  ];

  milestones.push({
    id: 'stg-1',
    stageNumber: 1,
    level: currentLvl,
    titleVi: stage1Title.vi,
    titleEn: stage1Title.en,
    targetDescriptionVi: `Củng cố vững chắc cấp độ ${currentLvl}, làm chủ ít nhất 300 từ vựng cốt lõi và các thì căn bản.`,
    estimatedWeeks: Math.max(2, Math.floor(totalWeeks * 0.25)),
    requiredXp: 300,
    skillsFocus: ['grammar', 'vocabulary', 'listening'],
    recommendedCourseIds: ['course-daily-routine'],
    recommendedTestIds: ['test-placement'],
    modules: stage1Modules,
    status: 'in_progress',
    progressPercentage: Math.round(
      (stage1Modules.filter((m) => m.completed).length / stage1Modules.length) * 100
    )
  });

  // Stage 2: Target Exam Strategy or Fluency Elevation
  const stage2Title =
    exam === 'TOEIC'
      ? { vi: 'Giai đoạn 2: Bứt Phá TOEIC Reading & Listening (ETS Format)', en: 'Stage 2: TOEIC ETS Core Strategies' }
      : exam === 'IELTS'
      ? { vi: 'Giai đoạn 2: Nắm Vững 4 Tiêu Chí IELTS & Kỹ Năng PEEL', en: 'Stage 2: IELTS 4-Criteria & PEEL Writing Framework' }
      : { vi: 'Giai đoạn 2: Phản Xạ Giao Tiếp Tự Tin & Đàm Phán Công Việc', en: 'Stage 2: Workplace Fluency & Natural Communication' };

  const stage2Modules = [
    {
      id: 'm2-1',
      name: exam === 'TOEIC'
        ? 'Dấu hiệu đuôi từ loại & Bẫy ngữ pháp ETS Part 5'
        : 'Academic Writing Task 2: Cấu trúc đoạn văn PEEL',
      nameVi: exam === 'TOEIC'
        ? 'Dấu hiệu đuôi từ loại & Bẫy ngữ pháp ETS Part 5'
        : 'Academic Writing Task 2: Cấu trúc đoạn văn PEEL',
      courseId: exam === 'TOEIC' ? 'course-toeic-pro' : 'course-ielts-mastery',
      lessonId: exam === 'TOEIC' ? 'les-toeic-1' : 'les-ielts-w1',
      type: 'lesson' as const,
      durationMinutes: 20,
      completed: isLessonCompleted(courses, exam === 'TOEIC' ? 'course-toeic-pro' : 'course-ielts-mastery', exam === 'TOEIC' ? 'les-toeic-1' : 'les-ielts-w1')
    },
    {
      id: 'm2-2',
      name: exam === 'TOEIC'
        ? 'Thư tín Doanh nghiệp & Xử lý Hóa đơn, Đơn hàng Part 7'
        : 'Academic Reading: Phương pháp Skimming & Scanning',
      nameVi: exam === 'TOEIC'
        ? 'Thư tín Doanh nghiệp & Xử lý Hóa đơn, Đơn hàng Part 7'
        : 'Academic Reading: Phương pháp Skimming & Scanning',
      courseId: exam === 'TOEIC' ? 'course-toeic-pro' : 'course-ielts-mastery',
      lessonId: exam === 'TOEIC' ? 'les-toeic-2' : 'les-ielts-r1',
      type: 'lesson' as const,
      durationMinutes: 25,
      completed: isLessonCompleted(courses, exam === 'TOEIC' ? 'course-toeic-pro' : 'course-ielts-mastery', exam === 'TOEIC' ? 'les-toeic-2' : 'les-ielts-r1')
    },
    {
      id: 'm2-3',
      name: 'Kiểm tra chuyên sâu giữa kỳ (Sectional Exam Check)',
      nameVi: 'Kiểm tra chuyên sâu giữa kỳ (Sectional Exam Check)',
      testId: exam === 'TOEIC' ? 'test-toeic-reading-750' : 'test-ielts-reading-academic',
      type: 'exam' as const,
      durationMinutes: 35,
      completed: isTestPassed(testAttempts, exam === 'TOEIC' ? 'test-toeic-reading-750' : 'test-ielts-reading-academic')
    }
  ];

  milestones.push({
    id: 'stg-2',
    stageNumber: 2,
    level: currentLvl === 'A1' ? 'A2' : currentLvl === 'A2' ? 'B1' : 'B2',
    titleVi: stage2Title.vi,
    titleEn: stage2Title.en,
    targetDescriptionVi: `Áp dụng chiến thuật giải đề cho mục tiêu ${exam} ${score}. Nâng cao độ chuẩn xác tối thiểu 75%.`,
    estimatedWeeks: Math.max(3, Math.floor(totalWeeks * 0.4)),
    requiredXp: 800,
    skillsFocus: ['reading', 'writing', 'grammar'],
    recommendedCourseIds: [exam === 'TOEIC' ? 'course-toeic-pro' : 'course-ielts-mastery'],
    recommendedTestIds: [exam === 'TOEIC' ? 'test-toeic-reading-750' : 'test-ielts-reading-academic'],
    modules: stage2Modules,
    status: 'upcoming',
    progressPercentage: Math.round(
      (stage2Modules.filter((m) => m.completed).length / stage2Modules.length) * 100
    )
  });

  // Stage 3: Full Simulation & Real-time Exam Mastery
  const stage3Title = {
    vi: `Giai đoạn 3: Luyện Thi Thực Chiến & Đạt Mục Tiêu ${score}`,
    en: `Stage 3: Full Mock Exam Mastery & Reaching ${score}`
  };

  const stage3Modules = [
    {
      id: 'm3-1',
      name: exam === 'TOEIC'
        ? 'Thi thử TOEIC 2 Kỹ Năng Chuẩn ETS (100 câu có tính giờ)'
        : 'Thi thử IELTS 4 Kỹ Năng Chuẩn Quốc Tế (Tính giờ mô phỏng)',
      nameVi: exam === 'TOEIC'
        ? 'Thi thử TOEIC 2 Kỹ Năng Chuẩn ETS (100 câu có tính giờ)'
        : 'Thi thử IELTS 4 Kỹ Năng Chuẩn Quốc Tế (Tính giờ mô phỏng)',
      testId: exam === 'TOEIC' ? 'test-toeic-2skills-standard-100' : 'test-ielts-custom-mock-100',
      type: 'exam' as const,
      durationMinutes: 120,
      completed: isTestPassed(testAttempts, exam === 'TOEIC' ? 'test-toeic-2skills-standard-100' : 'test-ielts-custom-mock-100')
    },
    {
      id: 'm3-2',
      name: 'Kiểm tra phát âm & Trả lời câu hỏi cùng AI Speaking Coach',
      nameVi: 'Kiểm tra phát âm & Trả lời câu hỏi cùng AI Speaking Coach',
      type: 'speaking_checkpoint' as const,
      durationMinutes: 20,
      completed: testAttempts.some((a) => a.testId.includes('spk') || a.testId.includes('speaking'))
    }
  ];

  milestones.push({
    id: 'stg-3',
    stageNumber: 3,
    level: currentLvl === 'A1' ? 'B1' : currentLvl === 'A2' ? 'B2' : 'C1',
    titleVi: stage3Title.vi,
    titleEn: stage3Title.en,
    targetDescriptionVi: `Hoàn tất ít nhất 1 bài Mock Test toàn diện, rà soát giải thích đáp án và khắc phục điểm yếu cuối cùng.`,
    estimatedWeeks: Math.max(2, Math.floor(totalWeeks * 0.35)),
    requiredXp: 1500,
    skillsFocus: ['listening', 'reading', 'speaking', 'writing'],
    recommendedCourseIds: [],
    recommendedTestIds: [exam === 'TOEIC' ? 'test-toeic-2skills-standard-100' : 'test-ielts-custom-mock-100'],
    modules: stage3Modules,
    status: 'locked',
    progressPercentage: Math.round(
      (stage3Modules.filter((m) => m.completed).length / stage3Modules.length) * 100
    )
  });

  // Calculate sequential status
  let activeFound = false;
  for (let i = 0; i < milestones.length; i++) {
    const stg = milestones[i];
    const isAllDone = stg.modules.every((m) => m.completed);
    if (isAllDone) {
      stg.status = 'completed';
    } else if (!activeFound) {
      stg.status = 'in_progress';
      activeFound = true;
    } else if (milestones[i - 1]?.status === 'in_progress') {
      stg.status = 'upcoming';
    } else {
      stg.status = 'locked';
    }
  }

  // Calculate overall progress percentage
  const allModules = milestones.flatMap((s) => s.modules);
  const completedModulesCount = allModules.filter((m) => m.completed).length;
  const overallProgressPercentage = allModules.length > 0 ? Math.round((completedModulesCount / allModules.length) * 100) : 0;

  // Generate actionable daily study tasks for today
  const dailyTasks: DailyStudyTask[] = [];

  // Task 1: Resume or start next lesson
  let activeLessonFound: { courseId: string; lessonId: string; titleVi: string } | null = null;
  for (const c of courses) {
    for (const m of c.modules) {
      for (const l of m.lessons) {
        if (!l.isCompleted && !l.isLocked) {
          activeLessonFound = { courseId: c.id, lessonId: l.id, titleVi: l.titleVi };
          break;
        }
      }
      if (activeLessonFound) break;
    }
    if (activeLessonFound) break;
  }

  if (activeLessonFound) {
    dailyTasks.push({
      id: 'dt-lesson',
      titleVi: `Học bài tiếp theo: ${activeLessonFound.titleVi}`,
      titleEn: `Continue lesson: ${activeLessonFound.titleVi}`,
      category: 'lesson',
      actionTab: 'courses',
      estimatedMinutes: 15,
      xpReward: 50,
      isCompleted: isLessonCompleted(courses, activeLessonFound.courseId, activeLessonFound.lessonId),
      linkPayload: {
        courseId: activeLessonFound.courseId,
        lessonId: activeLessonFound.lessonId
      }
    });
  }

  // Task 2: Review Vocabulary with Spaced Repetition (SRS)
  const dueVocab = vocabulary.filter((v) => v.status === 'learning').length;
  dailyTasks.push({
    id: 'dt-vocab',
    titleVi: dueVocab > 0 ? `Ôn tập ${Math.min(10, dueVocab)} thẻ từ vựng cần nhớ hôm nay` : 'Học 10 từ vựng mới theo chủ đề',
    titleEn: dueVocab > 0 ? `Review ${Math.min(10, dueVocab)} due flashcards with Spaced Repetition` : 'Learn 10 new topic flashcards',
    category: 'vocab',
    actionTab: 'vocabulary',
    estimatedMinutes: 10,
    xpReward: 30,
    isCompleted: vocabulary.some((v) => v.reviewCount > 0 && v.status === 'mastered')
  });

  // Task 3: Skill Practice (Listening / Speaking / Exam)
  if (exam === 'IELTS') {
    dailyTasks.push({
      id: 'dt-ielts',
      titleVi: 'Luyện 1 đề IELTS Speaking hoặc Writing Task 2 với AI',
      titleEn: 'Practice 1 IELTS Speaking cue card or Writing Task 2 with AI',
      category: 'exam',
      actionTab: 'ielts',
      estimatedMinutes: 15,
      xpReward: 40,
      isCompleted: testAttempts.some((a) => a.testId.includes('ielts'))
    });
  } else if (exam === 'TOEIC') {
    dailyTasks.push({
      id: 'dt-toeic',
      titleVi: 'Luyện giải bẫy từ loại TOEIC Part 5 & Part 7',
      titleEn: 'Master TOEIC Part 5 grammar traps & Part 7 passages',
      category: 'exam',
      actionTab: 'toeic',
      estimatedMinutes: 15,
      xpReward: 40,
      isCompleted: testAttempts.some((a) => a.testId.includes('toeic'))
    });
  } else {
    dailyTasks.push({
      id: 'dt-comm',
      titleVi: 'Luyện phát âm Microphone & Đối thoại phản xạ cùng AI',
      titleEn: 'Microphone pronunciation drill & AI conversation',
      category: 'speaking',
      actionTab: 'speaking',
      estimatedMinutes: 10,
      xpReward: 35,
      isCompleted: testAttempts.some((a) => a.testId.includes('spk'))
    });
  }

  // Compute strengths and weaknesses based on attempts and data
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  const masteredCount = vocabulary.filter((v) => v.status === 'mastered').length;
  if (masteredCount >= 5) {
    strengths.push(`Vốn từ vựng đã tích lũy ${masteredCount} từ thông thạo`);
  } else {
    areasToImprove.push('Cần bổ sung vốn từ vựng học thuật & cụm Collocation');
  }

  const grammarMasteryAvg =
    grammarTopics.length > 0
      ? grammarTopics.reduce((acc, g) => acc + g.masteryPercentage, 0) / grammarTopics.length
      : 0;

  if (grammarMasteryAvg >= 50) {
    strengths.push('Nắm chắc các chủ điểm ngữ pháp cốt lõi');
  } else {
    areasToImprove.push('Cần củng cố thì động từ, câu điều kiện và mệnh đề quan hệ');
  }

  if (testAttempts.length > 0) {
    const avgScore = testAttempts.reduce((acc, t) => acc + t.accuracy, 0) / testAttempts.length;
    if (avgScore >= 75) {
      strengths.push(`Kỹ năng làm bài thi trắc nghiệm đạt độ chuẩn xác cao (${Math.round(avgScore)}%)`);
    } else {
      areasToImprove.push('Cần cải thiện tốc độ đọc hiểu và bẫy đề thi');
    }
  } else {
    areasToImprove.push('Chưa hoàn thành bài thi thử chính thức nào để đo lường điểm số');
  }

  return {
    currentLevel: currentLvl,
    targetExam: exam,
    targetScore: score,
    dailyMinutesGoal: dailyMins,
    totalEstimatedHours: totalHours,
    totalEstimatedWeeks: totalWeeks,
    targetCompletionDate: completionDate,
    overallProgressPercentage,
    milestones,
    dailyTasks,
    strengths,
    areasToImprove
  };
}
