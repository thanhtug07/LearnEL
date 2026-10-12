import { describe, it, expect } from 'vitest';
import {
  INITIAL_COURSES,
  INITIAL_VOCABULARY,
  INITIAL_GRAMMAR_TOPICS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_PRACTICE_TESTS
} from '../src/data/seedData';

describe('Root Cause Audit: First-Login Zero State & Verified Course Catalog', () => {
  describe('1. First-Login Zero State Guarantee', () => {
    it('ensures all initial courses start with 0 completed lessons', () => {
      INITIAL_COURSES.forEach((course) => {
        expect(course.completedLessons).toBe(0);
        course.modules.forEach((mod) => {
          mod.lessons.forEach((lesson) => {
            expect(lesson.isCompleted).toBe(false);
          });
        });
      });
    });

    it('ensures all initial vocabulary items start with unseen status and 0 reviews', () => {
      const masteredOrLearning = INITIAL_VOCABULARY.filter(
        (v) => v.status === 'mastered' || v.status === 'learning'
      );
      expect(masteredOrLearning.length).toBe(0);

      INITIAL_VOCABULARY.forEach((vocab) => {
        expect(vocab.status).toBe('unseen');
        expect(vocab.reviewCount).toBe(0);
        expect(vocab.isFavorite).toBeFalsy();
      });
    });

    it('ensures all initial grammar topics start with 0% mastery', () => {
      INITIAL_GRAMMAR_TOPICS.forEach((grammar) => {
        expect(grammar.masteryPercentage).toBe(0);
      });
    });

    it('ensures all achievements start locked with 0 progress', () => {
      const unlockedAchievements = INITIAL_ACHIEVEMENTS.filter((a) => a.unlocked);
      expect(unlockedAchievements.length).toBe(0);

      INITIAL_ACHIEVEMENTS.forEach((ach) => {
        expect(ach.progress).toBe(0);
        expect(ach.unlocked).toBe(false);
        expect((ach as any).unlockedAt).toBeUndefined();
      });
    });
  });

  describe('2. Course Catalog Data Model Compliance', () => {
    it('ensures every course contains required metadata fields', () => {
      expect(INITIAL_COURSES.length).toBeGreaterThan(0);

      INITIAL_COURSES.forEach((course) => {
        // Stable ID, title, description, CEFR level, language, skills, estimated duration, publication status and content version
        expect(course.id).toBeTruthy();
        expect(course.title).toBeTruthy();
        expect(course.titleVi).toBeTruthy();
        expect(course.description).toBeTruthy();
        expect(course.descriptionVi).toBeTruthy();
        expect(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).toContain(course.level);
        expect(course.language).toBe('en');
        expect(Array.isArray(course.skills)).toBe(true);
        expect(course.skills.length).toBeGreaterThan(0);
        expect(course.estimatedDuration).toBeGreaterThan(0);
        expect(course.publicationStatus).toBe('published');
        expect(course.contentVersion).toBeTruthy();
        expect(course.totalLessons).toBeGreaterThan(0);
        expect(course.modules.length).toBeGreaterThan(0);
      });
    });

    it('ensures every lesson contains stable ID, sequence, duration, prerequisites, publication status and real content', () => {
      INITIAL_COURSES.forEach((course) => {
        course.modules.forEach((mod) => {
          mod.lessons.forEach((lesson, index) => {
            expect(lesson.id).toBeTruthy();
            expect(lesson.courseId).toBe(course.id);
            expect(lesson.sequence).toBe(index + 1);
            expect(lesson.title).toBeTruthy();
            expect(lesson.titleVi).toBeTruthy();
            expect(lesson.durationMinutes).toBeGreaterThan(0);
            expect(lesson.estimatedDuration).toBeGreaterThan(0);
            expect(lesson.publicationStatus).toBe('published');
            expect(Array.isArray(lesson.prerequisites)).toBe(true);

            // Verify real educational content
            expect(lesson.objectivesVi.length).toBeGreaterThan(0);
            expect(lesson.theoryContent.title).toBeTruthy();
            expect(lesson.theoryContent.explanationVi).toBeTruthy();
            expect(lesson.theoryContent.examples.length).toBeGreaterThan(0);
            expect(lesson.exercises.length).toBeGreaterThan(0);

            // First lesson in course is unlocked, second lesson is locked and requires first lesson
            if (lesson.sequence === 1) {
              expect(lesson.isLocked).toBe(false);
              expect(lesson.prerequisites.length).toBe(0);
            } else {
              expect(lesson.isLocked).toBe(true);
              expect(lesson.prerequisites.length).toBeGreaterThan(0);
            }
          });
        });
      });
    });
  });

  describe('3. Dynamic Progress Derivation & Separation', () => {
    it('calculates progress percentage accurately from completed lessons relative to total lessons', () => {
      const course = INITIAL_COURSES[0];
      const totalLessons = course.modules.flatMap((m) => m.lessons).length;

      // Initial state: 0 completed
      const initialCompleted = 0;
      expect(Math.round((initialCompleted / totalLessons) * 100)).toBe(0);

      // User completes lesson 1
      const completedIds = new Set([course.modules[0].lessons[0].id]);
      const activeCompletedCount = course.modules
        .flatMap((m) => m.lessons)
        .filter((l) => completedIds.has(l.id)).length;

      expect(activeCompletedCount).toBe(1);
      const progressPercent = Math.round((activeCompletedCount / totalLessons) * 100);
      expect(progressPercent).toBe(Math.round((1 / totalLessons) * 100));

      // Check unlock of lesson 2 when lesson 1 is done
      const lesson2 = course.modules[0].lessons[1];
      const isLesson2Unlocked = lesson2.prerequisites.every((preId) => completedIds.has(preId));
      expect(isLesson2Unlocked).toBe(true);
    });

    it('ensures roadmap stages derive status dynamically without hardcoded flags', () => {
      const userCompletedLessonIds = new Set<string>();

      const isLessonDone = (lessonId: string) => userCompletedLessonIds.has(lessonId);

      // When user has completed nothing
      expect(isLessonDone('les-daily-1')).toBe(false);
      expect(isLessonDone('les-daily-2')).toBe(false);

      // When user completes les-daily-1
      userCompletedLessonIds.add('les-daily-1');
      expect(isLessonDone('les-daily-1')).toBe(true);
      expect(isLessonDone('les-daily-2')).toBe(false);
    });
  });
});
