import {
  CEFRLevel,
  Exercise,
  VocabularyItem,
  Course
} from '../types';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';

/**
 * ============================================================================
 * STATIC / CANONICAL COURSE DEFINITIONS
 * (Shared across all users; read-only for learners, managed by curriculum/admin)
 * ============================================================================
 */

export type CoursePublicationStatus = 'draft' | 'published' | 'archived';
export type CourseCategory =
  | 'Grammar'
  | 'Vocabulary'
  | 'IELTS'
  | 'TOEIC'
  | 'Communication'
  | 'Business'
  | 'Writing'
  | 'Reading'
  | 'Speaking';

export type CourseSkill =
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'grammar'
  | 'vocabulary'
  | 'vocab'
  | 'business';

export type LessonType =
  | 'grammar'
  | 'vocab'
  | 'vocabulary'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'mixed'
  | 'business';

/**
 * Theory content block within a lesson
 */
export interface LessonTheoryContent {
  title: string;
  explanationVi: string;
  examples: { en: string; vi: string }[];
  notesVi?: string;
}

/**
 * Static Lesson Definition (Published curriculum content)
 */
export interface LessonDefinition {
  /** Stable unique ID (e.g., 'les-daily-1', 'les-toeic-1') */
  id: string;
  /** Course identifier this lesson belongs to */
  courseId: string;
  /** Module identifier */
  moduleId: string;
  /** Numerical order sequence within the module or course */
  sequence: number;
  /** English display title */
  title: string;
  /** Vietnamese translated title */
  titleVi: string;
  /** Pedagogical lesson type */
  lessonType: LessonType;
  /** Duration in minutes */
  durationMinutes: number;
  /** Estimated duration */
  estimatedDuration: number;
  /** XP rewarded to learner upon successful completion */
  xpReward: number;
  /** List of prerequisite lesson IDs that must be completed before unlocking */
  prerequisites: string[];
  /** Publication lifecycle state */
  publicationStatus: CoursePublicationStatus;
  /** Learning objectives in Vietnamese */
  objectivesVi: string[];
  /** Instructional core theory content */
  theoryContent: LessonTheoryContent;
  /** Curated target vocabulary introduced in this lesson */
  vocabulary: VocabularyItem[];
  /** Assessment exercises testing comprehension */
  exercises: Exercise[];
}

/**
 * Course Module Definition
 */
export interface CourseModuleDefinition {
  id: string;
  courseId: string;
  sequence: number;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  lessonIds: string[];
  lessons: LessonDefinition[];
}

/**
 * Static Course Definition
 */
export interface CourseDefinition {
  /** Stable unique ID (e.g., 'course-daily-routine', 'course-ielts-mastery') */
  id: string;
  /** Course title in English */
  title: string;
  /** Course title in Vietnamese */
  titleVi: string;
  /** Full English description and learning outcomes */
  description: string;
  /** Vietnamese description */
  descriptionVi: string;
  /** Target CEFR proficiency level */
  level: CEFRLevel;
  /** Content language code ('en' / 'en-US') */
  language: string;
  /** Primary language skills targeted */
  skills: CourseSkill[];
  /** Estimated completion duration in minutes */
  estimatedDuration: number;
  /** Estimated completion duration in hours */
  estimatedHours: number;
  /** Subject category */
  category: CourseCategory;
  /** Cover image or thumbnail asset URL */
  thumbnail: string;
  /** Semantic content version (e.g. '1.0.0') */
  contentVersion: string;
  /** Publication lifecycle status */
  publicationStatus: CoursePublicationStatus;
  /** Total count of published lessons */
  totalLessons: number;
  /** Ordered syllabus modules */
  modules: CourseModuleDefinition[];
}

/**
 * ============================================================================
 * INDIVIDUAL USER PROGRESS & ENROLLMENT MODEL
 * (Isolated per authenticated user UID in Firestore/local storage)
 * ============================================================================
 */

export type EnrollmentStatus = 'active' | 'completed' | 'paused';

/**
 * Record of an individual completed lesson by a user
 */
export interface UserLessonAttemptRecord {
  lessonId: string;
  completedAt: string; // ISO 8601 date string
  score?: number;      // Exercise score or accuracy (0-100)
  timeSpentSeconds: number;
  attemptsCount: number;
}

/**
 * User Enrollment & Progress for a specific Course
 */
export interface UserCourseEnrollment {
  /** Authenticated user UID */
  userId: string;
  /** Course ID enrolled in */
  courseId: string;
  /** Date first enrolled */
  enrolledAt: string;
  /** Last activity timestamp */
  lastAccessedAt?: string;
  /** Lifecycle status */
  status?: EnrollmentStatus;
  /** Set or list of unique completed lesson IDs */
  completedLessonIds: string[];
  /** Total count of completed lessons */
  completedLessonsCount?: number;
  /** Derived progress percentage (0 - 100) */
  progressPercentage: number;
  /** Detailed per-lesson completion records */
  lessonRecords?: Record<string, UserLessonAttemptRecord>;
  /** ID of last accessed lesson */
  lastAccessedLessonId?: string;
}

/**
 * Computed Lesson State for a specific User
 * (Merges static LessonDefinition with UserCourseEnrollment)
 */
export interface UserLessonState {
  lesson: LessonDefinition;
  isCompleted: boolean;
  isLocked: boolean;
  canStart: boolean;
  lastAttempt?: UserLessonAttemptRecord;
}

/**
 * Computed Course View for a specific User
 * (Combines CourseDefinition with UserCourseEnrollment)
 */
export interface UserCourseView {
  course: CourseDefinition;
  isEnrolled: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  isFullyCompleted: boolean;
  nextLesson?: LessonDefinition | null;
  moduleStates: {
    module: CourseModuleDefinition;
    lessons: UserLessonState[];
    completedCount: number;
    totalCount: number;
  }[];
}

/**
 * ============================================================================
 * PURE DOMAIN UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Determines whether a lesson is unlocked for a user based on completed lesson IDs
 */
export function isLessonUnlockedForUser(
  lesson: { prerequisites?: string[] },
  completedLessonIds: Set<string> | string[] | UserCourseEnrollment
): boolean {
  if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
    return true;
  }
  let completedSet: Set<string>;
  if (completedLessonIds instanceof Set) {
    completedSet = completedLessonIds;
  } else if (Array.isArray(completedLessonIds)) {
    completedSet = new Set(completedLessonIds);
  } else if (
    completedLessonIds &&
    typeof completedLessonIds === 'object' &&
    Array.isArray((completedLessonIds as any).completedLessonIds)
  ) {
    completedSet = new Set((completedLessonIds as any).completedLessonIds);
  } else {
    completedSet = new Set();
  }

  return lesson.prerequisites.every((prereqId: string) => completedSet.has(prereqId));
}

/**
 * Derives a pristine 0% user enrollment record for a new user
 */
export function createInitialEnrollment(
  userId: string,
  courseId: string
): UserCourseEnrollment {
  const now = new Date().toISOString();
  return {
    userId,
    courseId,
    enrolledAt: now,
    lastAccessedAt: now,
    status: 'active',
    completedLessonIds: [],
    completedLessonsCount: 0,
    progressPercentage: 0,
    lessonRecords: {}
  };
}

/**
 * Computes progress percentage given completed count and total published lessons
 */
export function calculateProgressPercentage(
  completedCount: number,
  totalLessons: number
): number {
  if (totalLessons <= 0) return 0;
  const clamped = Math.max(0, Math.min(completedCount, totalLessons));
  return Math.round((clamped / totalLessons) * 100);
}

/**
 * Calculates course progress summary from completed lesson IDs
 */
export function calculateCourseProgress(
  course: CourseDefinition | Course,
  completedLessonIds: Set<string> | string[]
): { completedLessonsCount: number; totalLessonsCount: number; progressPercentage: number } {
  const completedSet = completedLessonIds instanceof Set ? completedLessonIds : new Set(completedLessonIds);
  const allLessons: Array<{ id: string }> = (course.modules as Array<{ lessons: Array<{ id: string }> }>).flatMap(
    (m) => m.lessons
  );
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => completedSet.has(l.id)).length;
  const progressPercentage = calculateProgressPercentage(completedLessonsCount, totalLessonsCount);
  return {
    completedLessonsCount,
    totalLessonsCount,
    progressPercentage
  };
}

/**
 * Merges a static CourseDefinition with a user's enrollment data to produce a UserCourseView
 */
export function deriveUserCourseView(
  course: CourseDefinition,
  enrollment?: UserCourseEnrollment | null
): UserCourseView {
  const completedIds = new Set<string>(enrollment?.completedLessonIds || []);
  let nextLesson: LessonDefinition | null = null;

  const moduleStates = course.modules.map((mod) => {
    const lessons: UserLessonState[] = mod.lessons.map((les) => {
      const isCompleted = completedIds.has(les.id);
      const isLocked = !isLessonUnlockedForUser(les, completedIds);
      const canStart = !isLocked;

      if (!isCompleted && !isLocked && !nextLesson) {
        nextLesson = les;
      }

      return {
        lesson: les,
        isCompleted,
        isLocked,
        canStart,
        lastAttempt: enrollment?.lessonRecords?.[les.id]
      };
    });

    const completedCount = lessons.filter((l) => l.isCompleted).length;
    return {
      module: mod,
      lessons,
      completedCount,
      totalCount: lessons.length
    };
  });

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const totalLessonsCount = allLessons.length;
  const completedLessonsCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercentage = calculateProgressPercentage(completedLessonsCount, totalLessonsCount);

  // If no next uncompleted lesson found, default to first lesson if not completed
  if (!nextLesson && allLessons.length > 0 && completedLessonsCount < totalLessonsCount) {
    nextLesson = allLessons.find((l) => !completedIds.has(l.id)) || null;
  }

  return {
    course,
    isEnrolled: Boolean(enrollment),
    completedLessonsCount,
    totalLessonsCount,
    progressPercentage,
    isFullyCompleted: totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount,
    nextLesson,
    moduleStates
  };
}

/**
 * ============================================================================
 * FIRESTORE PERSISTENCE & SYNC METHODS
 * ============================================================================
 */

/**
 * Fetches all published courses from Firestore collection 'courses'.
 * Returns an empty array if Firestore returns empty or errors.
 */
export async function fetchPublishedCoursesFromFirestore(): Promise<Course[]> {
  const path = 'courses';
  try {
    const colRef = collection(db, 'courses');
    const q = query(colRef, where('publicationStatus', '==', 'published'));
    const snapshot = await getDocs(q);
    
    // If published courses were found in Firestore, map them
    if (!snapshot.empty) {
      const courses: Course[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        courses.push({
          id: docSnap.id,
          ...data
        } as Course);
      });
      return courses;
    }

    // Try fetching without publicationStatus filter in case all docs are published
    const allSnapshot = await getDocs(colRef);
    if (!allSnapshot.empty) {
      const courses: Course[] = [];
      allSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        courses.push({
          id: docSnap.id,
          ...data
        } as Course);
      });
      return courses;
    }

    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Fetches user-specific course enrollments/progress from Firestore.
 * Path: users/{userId}/courseProgress
 */
export async function fetchUserCourseProgressFromFirestore(
  userId: string
): Promise<Record<string, UserCourseEnrollment>> {
  if (!userId) return {};
  const path = `users/${userId}/courseProgress`;
  const result: Record<string, UserCourseEnrollment> = {};

  try {
    const colRef = collection(db, 'users', userId, 'courseProgress');
    const snapshot = await getDocs(colRef);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const courseId = docSnap.id;
      const completedIds: string[] = Array.isArray(data.completedLessonIds)
        ? data.completedLessonIds
        : [];
      const completedCount = typeof data.completedCount === 'number'
        ? data.completedCount
        : completedIds.length;
      const progressPercentage = typeof data.progressPercentage === 'number'
        ? data.progressPercentage
        : 0;

      result[courseId] = {
        userId,
        courseId,
        enrolledAt: data.enrolledAt || data.updatedAt || new Date().toISOString(),
        lastAccessedAt: data.lastAccessedAt || data.updatedAt || new Date().toISOString(),
        status: data.status || 'active',
        completedLessonIds: completedIds,
        completedLessonsCount: completedCount,
        progressPercentage,
        lessonRecords: data.lessonRecords || {}
      };
    });

    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

/**
 * Records a lesson completion for a specific authenticated user in Firestore.
 * Path: users/{userId}/courseProgress/{courseId}
 */
export async function saveUserLessonCompletionToFirestore(
  userId: string,
  courseId: string,
  lessonId: string,
  completedLessonIds: string[],
  totalLessons: number,
  attemptScore?: number
): Promise<UserCourseEnrollment | null> {
  if (!userId || !courseId || !lessonId) return null;
  const path = `users/${userId}/courseProgress/${courseId}`;

  try {
    const now = new Date().toISOString();
    const progressRef = doc(db, 'users', userId, 'courseProgress', courseId);
    
    // Ensure unique IDs
    const uniqueCompleted = Array.from(new Set([...completedLessonIds, lessonId]));
    const completedCount = uniqueCompleted.length;
    const progressPercentage = calculateProgressPercentage(completedCount, totalLessons);

    const enrollmentRecord: UserCourseEnrollment = {
      userId,
      courseId,
      enrolledAt: now,
      lastAccessedAt: now,
      status: progressPercentage >= 100 ? 'completed' : 'active',
      completedLessonIds: uniqueCompleted,
      completedLessonsCount: completedCount,
      progressPercentage,
      lessonRecords: {
        [lessonId]: {
          lessonId,
          completedAt: now,
          score: attemptScore,
          timeSpentSeconds: 900,
          attemptsCount: 1
        }
      }
    };

    await setDoc(
      progressRef,
      {
        courseId,
        completedLessonIds: uniqueCompleted,
        completedCount,
        progressPercentage,
        status: enrollmentRecord.status,
        lastAccessedAt: now,
        updatedAt: now
      },
      { merge: true }
    );

    return enrollmentRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}

