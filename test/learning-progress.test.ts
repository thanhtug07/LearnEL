import { describe, it, expect } from 'vitest';
import {
  buildCoursesWithProgress,
  calculateLevelFromXP,
  saveNamespacedStorage,
  loadNamespacedStorage,
  createDefaultUserProfile
} from '../src/context/AppContext';
import {
  calculateProgressPercentage,
  isLessonUnlockedForUser,
  LessonDefinition,
  UserCourseEnrollment
} from '../src/services/courseCatalogService';
import { INITIAL_COURSES } from '../src/data/seedData';
import { UserProfile } from '../src/types';

describe('Learning Flow & Progress Engine Suite', () => {
  describe('1. XP Progression & Level Calculation', () => {
    it('calculates levelNumber correctly via calculateLevelFromXP', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(250)).toBe(1);
      expect(calculateLevelFromXP(499)).toBe(1);
      expect(calculateLevelFromXP(500)).toBe(2);
      expect(calculateLevelFromXP(999)).toBe(2);
      expect(calculateLevelFromXP(1000)).toBe(3);
      expect(calculateLevelFromXP(4500)).toBe(10);
    });

    it('gracefully handles negative XP values', () => {
      expect(calculateLevelFromXP(-50)).toBe(1);
    });
  });

  describe('2. Course Progression & Prerequisite Unlocking', () => {
    it('determines lesson unlocking based on prerequisites and completed lessons', () => {
      const lessonWithPrereq: LessonDefinition = {
        id: 'les-advanced-1',
        courseId: 'c1',
        moduleId: 'm1',
        sequence: 2,
        title: 'Advanced Clauses',
        titleVi: 'Mệnh đề nâng cao',
        lessonType: 'grammar',
        durationMinutes: 15,
        estimatedDuration: 15,
        xpReward: 50,
        prerequisites: ['les-basic-1'],
        publicationStatus: 'published',
        objectivesVi: ['Mệnh đề'],
        theoryContent: {
          title: 'Clauses',
          explanationVi: 'Chi tiết',
          examples: []
        },
        vocabulary: [],
        exercises: []
      };

      const enrollmentWithoutPrereq: UserCourseEnrollment = {
        userId: 'u1',
        courseId: 'c1',
        enrolledAt: '2026-10-10',
        completedLessonIds: [],
        lastAccessedLessonId: 'les-basic-1',
        progressPercentage: 0
      };

      const enrollmentWithPrereq: UserCourseEnrollment = {
        ...enrollmentWithoutPrereq,
        completedLessonIds: ['les-basic-1'],
        progressPercentage: 50
      };

      // Locked before prerequisite completed
      expect(isLessonUnlockedForUser(lessonWithPrereq, enrollmentWithoutPrereq)).toBe(false);

      // Unlocked after prerequisite completed
      expect(isLessonUnlockedForUser(lessonWithPrereq, enrollmentWithPrereq)).toBe(true);
    });

    it('calculates course progress percentage accurately and bounds between 0 and 100', () => {
      expect(calculateProgressPercentage(0, 10)).toBe(0);
      expect(calculateProgressPercentage(5, 10)).toBe(50);
      expect(calculateProgressPercentage(10, 10)).toBe(100);
      expect(calculateProgressPercentage(0, 0)).toBe(0);
      // Safeguard against over-100% bugs
      expect(calculateProgressPercentage(12, 10)).toBe(100);
    });

    it('buildCoursesWithProgress properly maps completed lessons and unlocks sequential lessons', () => {
      const sampleCourse = INITIAL_COURSES[0];
      const firstLessonId = sampleCourse.modules[0].lessons[0].id;
      const secondLessonId = sampleCourse.modules[0].lessons[1]?.id;

      const progressMap = {
        [sampleCourse.id]: {
          completedLessonIds: [firstLessonId],
          completedCount: 1
        }
      };

      const hydrated = buildCoursesWithProgress([sampleCourse], progressMap);
      const targetCourse = hydrated[0];

      expect(targetCourse.completedLessons).toBe(1);
      const l1 = targetCourse.modules[0].lessons[0];
      expect(l1.isCompleted).toBe(true);

      if (secondLessonId) {
        const l2 = targetCourse.modules[0].lessons[1];
        // Second lesson should now be unlocked because first lesson was completed
        expect(l2.isLocked).toBe(false);
      }
    });
  });

  describe('3. Learning Session Persistence & Refresh Resilience', () => {
    it('preserves user XP, streak, and studied minutes intact after page refresh simulation', () => {
      const testUid = 'learner-persistence-uid';
      const initialProfile: UserProfile = {
        ...createDefaultUserProfile(testUid),
        xp: 650,
        levelNumber: 2,
        currentStreak: 5,
        todayMinutesSpent: 30,
        totalMinutesStudied: 180,
        onboardingCompleted: true
      };

      // Save into storage
      saveNamespacedStorage(testUid, 'user', initialProfile);

      // Reload from storage (simulating browser reload)
      const reloaded = loadNamespacedStorage<UserProfile | null>(testUid, 'user', null);
      expect(reloaded).not.toBeNull();
      expect(reloaded?.xp).toBe(650);
      expect(reloaded?.levelNumber).toBe(2);
      expect(reloaded?.currentStreak).toBe(5);
      expect(reloaded?.todayMinutesSpent).toBe(30);
      expect(reloaded?.totalMinutesStudied).toBe(180);
      expect(reloaded?.onboardingCompleted).toBe(true);
    });
  });
});
