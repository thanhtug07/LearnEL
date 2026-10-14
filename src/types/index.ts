export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TargetExam = 'IELTS' | 'TOEIC' | 'COMMUNICATION' | 'GENERAL';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: CEFRLevel;
  targetExam: TargetExam;
  targetScore: string;
  dailyMinutesGoal: number;
  todayMinutesSpent: number;
  currentStreak: number;
  totalMinutesStudied: number;
  xp: number;
  levelNumber: number;
  language: 'vi' | 'en';
  soundEnabled: boolean;
  onboardingCompleted: boolean;
  lastActiveDate?: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  ipa: string;
  pos: string; // n, v, adj, adv, phr
  viMeaning: string;
  enDefinition: string;
  exampleEn: string;
  exampleVi: string;
  collocations: string[];
  synonyms: string[];
  antonyms?: string[];
  cefr: CEFRLevel;
  topic: string;
  usageNoteVi?: string;
  status: 'unseen' | 'learning' | 'mastered';
  lastReviewed?: string;
  nextReviewDate?: string;
  reviewCount: number;
  isFavorite?: boolean;
}

export type ExerciseType = 
  | 'multiple_choice' 
  | 'fill_blank' 
  | 'sentence_order' 
  | 'matching' 
  | 'true_false' 
  | 'listening_mc' 
  | 'speaking_prompt';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptVi?: string;
  context?: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string | string[]; // Can be string or array for ordering/matching
  explanationVi: string;
  matchingPairs?: { left: string; right: string }[];
}

export interface Lesson {
  id: string;
  courseId: string;
  sequence: number; // Order sequence in module/course
  title: string;
  titleVi: string;
  durationMinutes: number;
  estimatedDuration: number; // in minutes
  xpReward: number;
  isLocked: boolean;
  isCompleted: boolean;
  lessonType: 'grammar' | 'vocab' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mixed';
  type: 'grammar' | 'vocab' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mixed';
  prerequisites: string[]; // List of prerequisite lesson IDs
  publicationStatus: 'published' | 'draft' | 'archived';
  objectivesVi: string[];
  theoryContent: {
    title: string;
    explanationVi: string;
    examples: { en: string; vi: string }[];
    notesVi?: string;
  };
  vocabulary: VocabularyItem[];
  exercises: Exercise[];
}

export interface CourseModule {
  id: string;
  titleVi: string;
  descriptionVi: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  level: CEFRLevel;
  language: string; // e.g. 'en-US' or 'en'
  skills: ('listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary')[];
  estimatedDuration: number; // in minutes
  estimatedHours: number;
  publicationStatus: 'published' | 'draft' | 'archived';
  contentVersion: string;
  category: 'Grammar' | 'Vocabulary' | 'IELTS' | 'TOEIC' | 'Communication' | 'Business';
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  modules: CourseModule[];
}

export interface GrammarTopic {
  id: string;
  title: string;
  titleVi: string;
  level: CEFRLevel;
  category: string;
  formula: string;
  explanationVi: string;
  correctExamples: { en: string; vi: string }[];
  incorrectExamples: { wrong: string; right: string; noteVi: string }[];
  commonMistakesVi: string[];
  exercises: Exercise[];
  masteryPercentage: number;
}

export interface TestQuestion {
  id: string;
  questionNumber: number;
  section: string;
  contextPassage?: string;
  audioText?: string;
  audioUrl?: string;
  prompt: string;
  options: string[];
  correctAnswerIndex: number;
  acceptedAnswers?: string[];
  explanationVi: string;
  commonMistakesVi?: string;
  distractorRationales?: string[];
  category: string;
  cefr?: CEFRLevel;
  skill?: 'grammar' | 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'toeic_reading' | 'toeic_listening' | 'ielts_reading' | 'ielts_listening';
  source?: {
    category: ContentSourceCategory;
    attribution: string;
    licenseOrPermission: string;
    creationMethod: CreationMethod;
    contentVersion: string;
  };
  review?: {
    status: ReviewStatus;
    reviewerId?: string;
    reviewerName?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    aiValidationPassed?: boolean;
    aiReviewNotes?: string;
  };
  metadata?: {
    createdAt: string;
    updatedAt: string;
    authorId?: string;
    isProductionReady: boolean;
  };
}

export type ContentSourceCategory =
  | 'original_project'
  | 'ai_assisted_reviewed'
  | 'licensed_third_party'
  | 'official_sample';

export type ReviewStatus = 'draft' | 'pending_review' | 'needs_human_review' | 'approved' | 'rejected';

export type AIAuditStatus = 'not_evaluated' | 'evaluation_failed' | 'evaluated_pass' | 'evaluated_concerns';

export type CreationMethod = 'human_authored' | 'ai_assisted' | 'imported';

export interface QuestionValidationIssue {
  field?: string;
  type: 'error' | 'warning';
  code: string;
  message: string;
  details?: any;
}

export interface QuestionValidationResult {
  questionId: string;
  isValid: boolean;
  issues: QuestionValidationIssue[];
}

export interface QuestionBatchValidationReport {
  totalQuestions: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  results: QuestionValidationResult[];
  duplicateGroups: { id: string; prompt: string; duplicateWithIds: string[] }[];
}

export interface PracticeTest {
  id: string;
  title: string;
  titleVi: string;
  type: 'full_ielts' | 'full_toeic' | 'topic_quiz' | 'placement_test' | 'grammar_test' | 'mini_test';
  durationMinutes: number;
  totalQuestions: number;
  targetLevel: string;
  descriptionVi: string;
  questions: TestQuestion[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  date: string;
  timeSpentSeconds: number;
  score: number;
  totalQuestions: number;
  accuracy: number;
  userAnswers: Record<string, number>;
  flaggedQuestions: string[];
  weaknessAnalysisVi: string[];
  recommendedLessonIds: string[];
}

export interface PracticeSet {
  id: string;
  title: string;
  titleVi: string;
  targetSkill: 'grammar' | 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'pronunciation' | 'business';
  cefr: CEFRLevel;
  category: 'targeted_practice' | 'mixed_review' | 'error_correction' | 'vocabulary_recall' | 'grammar_application' | 'reading_comprehension' | 'listening_comprehension' | 'speaking_prompt' | 'writing_prompt';
  objectiveVi: string;
  instructionsVi: string;
  estimatedMinutes: number;
  totalExercises: number;
  publicationStatus: 'published' | 'draft' | 'archived';
  exercises: Exercise[];
  contentVersion: string;
  source?: {
    attribution: string;
    license: string;
  };
}

export interface Achievement {
  id: string;
  titleVi: string;
  descVi: string;
  iconName: string;
  category: 'streak' | 'vocab' | 'test' | 'speaking' | 'overall';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  category: 'IELTS_TASK_1' | 'IELTS_TASK_2' | 'TOEIC_EMAIL' | 'OPINION_PARAGRAPH' | 'BUSINESS';
  promptEn: string;
  promptVi: string;
  sampleAnswerEn: string;
  bandOrLevel: string;
  tipsVi: string[];
}

export interface SpeakingTopic {
  id: string;
  title: string;
  titleVi: string;
  part: 'daily_roleplay' | 'ielts_part1' | 'ielts_part2' | 'ielts_part3';
  cueCardEn?: string;
  questions: {
    promptEn: string;
    promptVi: string;
    modelAnswerEn: string;
    keyVocabulary: string[];
  }[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

// Re-export canonical data model types and domain helpers
export * from '../services/courseCatalogService';
