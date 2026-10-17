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
  lessonType: 'grammar' | 'vocab' | 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mixed' | 'business';
  type: 'grammar' | 'vocab' | 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'writing' | 'mixed' | 'business';
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
  skills: ('listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'vocab' | 'business')[];
  estimatedDuration: number; // in minutes
  estimatedHours: number;
  publicationStatus: 'published' | 'draft' | 'archived';
  contentVersion: string;
  category: 'Grammar' | 'Vocabulary' | 'IELTS' | 'TOEIC' | 'Communication' | 'Business' | 'Writing' | 'Reading' | 'Speaking';
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
  text?: string;
  options: string[];
  correctAnswerIndex: number;
  acceptedAnswers?: string[];
  explanationVi: string;
  commonMistakesVi?: string;
  distractorRationales?: string[];
  category: string;
  cefr?: CEFRLevel;
  cefrLevel?: CEFRLevel;
  examType?: 'toeic' | 'ielts' | 'general' | 'placement' | 'cefr_benchmark';
  skill?: 'grammar' | 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'toeic_reading' | 'toeic_listening' | 'ielts_reading' | 'ielts_listening' | 'ielts_writing' | 'ielts_speaking';
  itemType?: QuestionItemType;
  questionType?: QuestionItemType;
  difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'proficiency' | 'easy' | 'medium' | 'hard';
  topic?: string;
  sourceId?: string;
  answerKey?: string | number;
  explanation?: string;
  passageId?: string;
  audioId?: string;
  groupId?: string;
  rubric?: QuestionRubric;
  speakingPrepSeconds?: number;
  speakingRecordSeconds?: number;
  targetWordCount?: { min: number; max?: number };
  source?: {
    category: ContentSourceCategory;
    attribution: string;
    licenseOrPermission: string;
    creationMethod: CreationMethod;
    contentVersion: string;
    sourceId?: string;
    sourceName?: string;
    sourceUrl?: string;
    retrievedAt?: string;
    owner?: string;
    license?: string;
    permissions?: ('reference' | 'verbatim' | 'adapt' | 'distribute')[];
    isLicenseVerified?: boolean;
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
  exactHash?: string;
  normalizedHash?: string;
  examAppearances?: string[];
  usageCount?: number;
}

export type QuestionItemType =
  | 'multiple_choice'
  | 'fill_in_blank'
  | 'matching'
  | 'sentence_ordering'
  | 'short_answer'
  | 'essay'
  | 'speaking_recording';

export interface RubricCriteria {
  criterion: string;
  maxScore: number;
  descriptionVi: string;
}

export interface QuestionRubric {
  totalPoints: number;
  criteria: RubricCriteria[];
  sampleResponse?: string;
  evaluatorNotesVi?: string;
}

export type ContentSourceCategory =
  | 'original_project'
  | 'ai_assisted_reviewed'
  | 'licensed_third_party'
  | 'official_sample'
  | 'open_licensed'
  | 'academic_curated'
  | 'lingopeak_original'
  | 'ai_assisted_draft';

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

export interface BlueprintSkillBreakdown {
  skill: 'listening' | 'reading' | 'speaking' | 'writing';
  questionCount: number;
  durationMinutes: number;
  sectionNames: string[];
}

export interface ExamBlueprint {
  blueprintId: 'toeic_2skills' | 'toeic_4skills' | 'ielts_custom_mock';
  standardName: string;
  officialDisclaimer?: string;
  totalItems: number;
  skillsBreakdown: BlueprintSkillBreakdown[];
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
  blueprint?: ExamBlueprint;
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
  userAnswers: Record<string, number | string>;
  flaggedQuestions: string[];
  weaknessAnalysisVi: string[];
  recommendedLessonIds: string[];
  completedAt?: string;
  skillScores?: Record<string, {
    rawScore: number;
    maxScore: number;
    percentage: number;
    status: 'graded' | 'pending_evaluation' | 'reference_ai_evaluated';
    detailsVi?: string;
  }>;
  speakingRecordings?: Record<string, string>;
  writingResponses?: Record<string, string>;
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
  category: 'IELTS_TASK_1' | 'IELTS_TASK_2' | 'TOEIC_EMAIL' | 'TOEIC_ESSAY' | 'OPINION_PARAGRAPH' | 'BUSINESS';
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
  part: 'daily_roleplay' | 'ielts_part1' | 'ielts_part2' | 'ielts_part3' | 'toeic_part1' | 'toeic_part2' | 'toeic_part3' | 'toeic_part4' | 'toeic_part5';
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
