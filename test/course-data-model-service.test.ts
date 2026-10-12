import { describe, it, expect } from 'vitest';
import {
  CourseDefinition,
  LessonDefinition,
  UserCourseEnrollment,
  isLessonUnlockedForUser,
  createInitialEnrollment,
  calculateProgressPercentage,
  deriveUserCourseView
} from '../src/services/courseCatalogService';

describe('Course & Lesson Data Model Service (Separation of Static Content & User Progress)', () => {
  const sampleLesson1: LessonDefinition = {
    id: 'les-test-1',
    courseId: 'course-test-1',
    moduleId: 'mod-1',
    sequence: 1,
    title: 'Self-Introduction',
    titleVi: 'Giới thiệu bản thân',
    lessonType: 'speaking',
    durationMinutes: 15,
    estimatedDuration: 15,
    xpReward: 50,
    prerequisites: [],
    publicationStatus: 'published',
    objectivesVi: ['Biết cách giới thiệu tên, nghề nghiệp'],
    theoryContent: {
      title: 'Greeting structures',
      explanationVi: 'Cấu trúc câu giới thiệu cơ bản',
      examples: [{ en: 'I am an engineer.', vi: 'Tôi là kỹ sư.' }]
    },
    vocabulary: [],
    exercises: [
      {
        id: 'ex-1',
        type: 'multiple_choice',
        prompt: 'Choose the correct greeting',
        options: ['Hello', 'Dog', 'Table', 'Red'],
        correctAnswer: 'Hello',
        explanationVi: 'Hello là lời chào.'
      }
    ]
  };

  const sampleLesson2: LessonDefinition = {
    id: 'les-test-2',
    courseId: 'course-test-1',
    moduleId: 'mod-1',
    sequence: 2,
    title: 'Daily Habits',
    titleVi: 'Thói quen hằng ngày',
    lessonType: 'grammar',
    durationMinutes: 20,
    estimatedDuration: 20,
    xpReward: 50,
    prerequisites: ['les-test-1'],
    publicationStatus: 'published',
    objectivesVi: ['Thì hiện tại đơn'],
    theoryContent: {
      title: 'Present Simple',
      explanationVi: 'Diễn tả thói quen',
      examples: [{ en: 'I wake up at 7.', vi: 'Tôi thức dậy lúc 7h.' }]
    },
    vocabulary: [],
    exercises: [
      {
        id: 'ex-2',
        type: 'multiple_choice',
        prompt: 'She _____ coffee.',
        options: ['drinks', 'drink', 'drinking', 'drank'],
        correctAnswer: 'drinks',
        explanationVi: 'Chủ ngữ ngôi thứ 3 số ít thêm s.'
      }
    ]
  };

  const sampleCourse: CourseDefinition = {
    id: 'course-test-1',
    title: 'Elementary English',
    titleVi: 'Tiếng Anh Sơ Cấp',
    description: 'Foundational course for A1 learners',
    descriptionVi: 'Khóa học nền tảng cho người bắt đầu',
    level: 'A1',
    language: 'en',
    skills: ['speaking', 'grammar'],
    estimatedDuration: 35,
    estimatedHours: 1,
    category: 'Communication',
    thumbnail: 'https://example.com/thumb.jpg',
    contentVersion: '1.0.0',
    publicationStatus: 'published',
    totalLessons: 2,
    modules: [
      {
        id: 'mod-1',
        courseId: 'course-test-1',
        sequence: 1,
        titleEn: 'Getting Started',
        titleVi: 'Bắt đầu',
        descriptionVi: 'Các bài học làm quen',
        lessonIds: ['les-test-1', 'les-test-2'],
        lessons: [sampleLesson1, sampleLesson2]
      }
    ]
  };

  describe('1. Static Course Definition Integrity', () => {
    it('maintains immutable course and lesson attributes without user state', () => {
      expect(sampleCourse.id).toBe('course-test-1');
      expect(sampleCourse.publicationStatus).toBe('published');
      expect(sampleCourse.modules[0].lessons).toHaveLength(2);
      expect(sampleLesson1.prerequisites).toHaveLength(0);
      expect(sampleLesson2.prerequisites).toEqual(['les-test-1']);
    });
  });

  describe('2. User Enrollment & Progress Isolation', () => {
    it('creates pristine zero-progress enrollment for a newly registered user', () => {
      const enrollment = createInitialEnrollment('user-uid-abc', sampleCourse.id);
      expect(enrollment.userId).toBe('user-uid-abc');
      expect(enrollment.courseId).toBe(sampleCourse.id);
      expect(enrollment.completedLessonIds).toEqual([]);
      expect(enrollment.completedLessonsCount).toBe(0);
      expect(enrollment.progressPercentage).toBe(0);
      expect(enrollment.status).toBe('active');
    });

    it('accurately calculates progress percentage based on completed lessons', () => {
      expect(calculateProgressPercentage(0, 2)).toBe(0);
      expect(calculateProgressPercentage(1, 2)).toBe(50);
      expect(calculateProgressPercentage(2, 2)).toBe(100);
      // Handles empty/edge cases cleanly
      expect(calculateProgressPercentage(0, 0)).toBe(0);
      expect(calculateProgressPercentage(5, 2)).toBe(100);
    });

    it('enforces prerequisite lock verification', () => {
      // Lesson 1 has no prerequisites: always unlocked
      expect(isLessonUnlockedForUser(sampleLesson1, [])).toBe(true);

      // Lesson 2 requires Lesson 1: locked initially
      expect(isLessonUnlockedForUser(sampleLesson2, [])).toBe(false);

      // Once Lesson 1 is completed: unlocked
      expect(isLessonUnlockedForUser(sampleLesson2, ['les-test-1'])).toBe(true);
    });

    it('derives UserCourseView combining static definition and individual user progress', () => {
      // New user (no enrollment)
      const newView = deriveUserCourseView(sampleCourse, null);
      expect(newView.isEnrolled).toBe(false);
      expect(newView.completedLessonsCount).toBe(0);
      expect(newView.progressPercentage).toBe(0);
      expect(newView.isFullyCompleted).toBe(false);
      expect(newView.nextLesson?.id).toBe('les-test-1');
      expect(newView.moduleStates[0].lessons[0].isCompleted).toBe(false);
      expect(newView.moduleStates[0].lessons[0].isLocked).toBe(false);
      expect(newView.moduleStates[0].lessons[1].isCompleted).toBe(false);
      expect(newView.moduleStates[0].lessons[1].isLocked).toBe(true);

      // User after completing lesson 1
      const activeEnrollment: UserCourseEnrollment = {
        userId: 'user-uid-abc',
        courseId: 'course-test-1',
        enrolledAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        status: 'active',
        completedLessonIds: ['les-test-1'],
        completedLessonsCount: 1,
        progressPercentage: 50,
        lessonRecords: {
          'les-test-1': {
            lessonId: 'les-test-1',
            completedAt: new Date().toISOString(),
            score: 100,
            timeSpentSeconds: 600,
            attemptsCount: 1
          }
        }
      };

      const updatedView = deriveUserCourseView(sampleCourse, activeEnrollment);
      expect(updatedView.isEnrolled).toBe(true);
      expect(updatedView.completedLessonsCount).toBe(1);
      expect(updatedView.progressPercentage).toBe(50);
      expect(updatedView.isFullyCompleted).toBe(false);
      expect(updatedView.nextLesson?.id).toBe('les-test-2');
      expect(updatedView.moduleStates[0].lessons[0].isCompleted).toBe(true);
      expect(updatedView.moduleStates[0].lessons[1].isCompleted).toBe(false);
      expect(updatedView.moduleStates[0].lessons[1].isLocked).toBe(false); // Unlocked because prereq is satisfied!
    });
  });
});
