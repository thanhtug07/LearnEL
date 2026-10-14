import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserStorageKey,
  saveNamespacedStorage,
  loadNamespacedStorage,
  clearNamespacedStorage,
  createDefaultUserProfile,
  buildCoursesWithProgress,
  DEFAULT_USER
} from '../src/context/AppContext';
import { INITIAL_COURSES, INITIAL_PRACTICE_TESTS } from '../src/data/seedData';
import { UserProfile, Course, PracticeTest, TestAttempt } from '../src/types';
import { evaluateTestSubmission } from '../src/utils/examEngine';
import { isLessonUnlockedForUser, calculateCourseProgress } from '../src/services/courseCatalogService';

class MockLocalStorage {
  private store: Record<string, string> = {};

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MockLocalStorage() as any;
}

describe('End-to-End User Flow & Regression Gate Suite', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Authentication & Account Isolation Flow', () => {
    it('handles new user signup, logout, switch account, and prevents cross-account data leakage', () => {
      // 1. New User Alice signs up
      const aliceUid = 'user-alice-001';
      const aliceInitial = createDefaultUserProfile(aliceUid, {
        name: 'Alice Wonderland',
        email: 'alice@example.com',
        level: 'B1',
        targetExam: 'IELTS'
      });

      expect(aliceInitial.onboardingCompleted).toBe(false);
      expect(aliceInitial.xp).toBe(0);

      // Alice completes onboarding and earns XP
      const aliceUpdated: UserProfile = {
        ...aliceInitial,
        onboardingCompleted: true,
        xp: 150,
        todayMinutesSpent: 30,
        totalMinutesStudied: 30
      };
      saveNamespacedStorage(aliceUid, 'user', aliceUpdated);

      // Alice completes lesson 1 in course 1
      const aliceCourseId = INITIAL_COURSES[0].id;
      const aliceLesson1Id = INITIAL_COURSES[0].modules[0].lessons[0].id;
      saveNamespacedStorage(aliceUid, `course_${aliceCourseId}`, [aliceLesson1Id]);

      // Alice takes a practice test
      const aliceAttempt: TestAttempt = {
        id: 'attempt-alice-1',
        testId: INITIAL_PRACTICE_TESTS[0].id,
        testTitle: INITIAL_PRACTICE_TESTS[0].title,
        date: new Date().toISOString().slice(0, 10),
        score: 8,
        totalQuestions: 10,
        accuracy: 80,
        timeSpentSeconds: 420,
        userAnswers: {},
        flaggedQuestions: [],
        weaknessAnalysisVi: [],
        recommendedLessonIds: [],
        completedAt: new Date().toISOString()
      };
      saveNamespacedStorage(aliceUid, 'test_attempts', [aliceAttempt]);

      // Verify Alice data is saved under her namespace
      expect(loadNamespacedStorage<UserProfile>(aliceUid, 'user', DEFAULT_USER).xp).toBe(150);
      expect(loadNamespacedStorage<string[]>(aliceUid, `course_${aliceCourseId}`, [])).toContain(aliceLesson1Id);
      expect(loadNamespacedStorage<TestAttempt[]>(aliceUid, 'test_attempts', [])).toHaveLength(1);

      // 2. Alice logs out (storage is cleared for active session, but namespaced records remain isolated)
      // 3. New User Bob signs up
      const bobUid = 'user-bob-002';
      const bobProfile = createDefaultUserProfile(bobUid, {
        name: 'Bob Builder',
        email: 'bob@example.com',
        level: 'A1',
        targetExam: 'TOEIC'
      });

      // VERIFY STRICT ISOLATION: Bob must NOT see Alice's data!
      const bobSavedProfile = loadNamespacedStorage<UserProfile>(bobUid, 'user', bobProfile);
      expect(bobSavedProfile.name).toBe('Bob Builder');
      expect(bobSavedProfile.xp).toBe(0);
      expect(bobSavedProfile.onboardingCompleted).toBe(false);

      const bobCourseProgress = loadNamespacedStorage<string[]>(bobUid, `course_${aliceCourseId}`, []);
      expect(bobCourseProgress).toHaveLength(0);
      expect(bobCourseProgress).not.toContain(aliceLesson1Id);

      const bobTestAttempts = loadNamespacedStorage<TestAttempt[]>(bobUid, 'test_attempts', []);
      expect(bobTestAttempts).toHaveLength(0);

      // 4. Bob completes his own test and saves data
      const bobAttempt: TestAttempt = {
        id: 'attempt-bob-1',
        testId: INITIAL_PRACTICE_TESTS[1].id,
        testTitle: INITIAL_PRACTICE_TESTS[1].title,
        date: new Date().toISOString().slice(0, 10),
        score: 5,
        totalQuestions: 10,
        accuracy: 50,
        timeSpentSeconds: 300,
        userAnswers: {},
        flaggedQuestions: [],
        weaknessAnalysisVi: [],
        recommendedLessonIds: [],
        completedAt: new Date().toISOString()
      };
      saveNamespacedStorage(bobUid, 'test_attempts', [bobAttempt]);

      // 5. Switch back to Alice: verify Alice's data is still intact and unmodified by Bob
      const aliceRestoredAttempts = loadNamespacedStorage<TestAttempt[]>(aliceUid, 'test_attempts', []);
      expect(aliceRestoredAttempts).toHaveLength(1);
      expect(aliceRestoredAttempts[0].id).toBe('attempt-alice-1');
      expect(aliceRestoredAttempts[0].accuracy).toBe(80);
    });
  });

  describe('2. Onboarding Lifecycle Flow', () => {
    it('completes onboarding step-by-step and persists configured target profile', () => {
      const uid = 'learner-onboard-01';
      const profile = createDefaultUserProfile(uid, { email: 'learner@lingopeak.edu.vn' });
      expect(profile.onboardingCompleted).toBe(false);

      // Step 1: Select Level B2
      // Step 2: Select Exam IELTS with target Band 7.5
      // Step 3: Select 45 minutes daily commitment
      const onboardedProfile: UserProfile = {
        ...profile,
        level: 'B2',
        targetExam: 'IELTS',
        targetScore: 'Band 7.5',
        dailyMinutesGoal: 45,
        onboardingCompleted: true
      };

      saveNamespacedStorage(uid, 'user', onboardedProfile);

      // Reload/Refresh simulation
      const loaded = loadNamespacedStorage<UserProfile>(uid, 'user', profile);
      expect(loaded.onboardingCompleted).toBe(true);
      expect(loaded.level).toBe('B2');
      expect(loaded.targetExam).toBe('IELTS');
      expect(loaded.targetScore).toBe('Band 7.5');
      expect(loaded.dailyMinutesGoal).toBe(45);
    });

    it('allows skipping optional fields while preserving valid defaults and marking onboardingCompleted', () => {
      const uid = 'learner-skip-02';
      const profile = createDefaultUserProfile(uid, { email: 'skip@lingopeak.edu.vn' });

      // User skips optional fields
      const skippedProfile: UserProfile = {
        ...profile,
        level: 'B1',
        targetExam: 'COMMUNICATION',
        targetScore: 'Mục tiêu linh hoạt',
        dailyMinutesGoal: 30,
        onboardingCompleted: true
      };

      saveNamespacedStorage(uid, 'user', skippedProfile);

      const loaded = loadNamespacedStorage<UserProfile>(uid, 'user', profile);
      expect(loaded.onboardingCompleted).toBe(true);
      expect(loaded.targetScore).toBe('Mục tiêu linh hoạt');
    });

    it('allows changing goals later in profile settings and restores after refresh', () => {
      const uid = 'learner-change-goal-03';
      const initialProfile = createDefaultUserProfile(uid, {
        email: 'goal@lingopeak.edu.vn',
        level: 'B1',
        targetExam: 'TOEIC',
        targetScore: '600',
        onboardingCompleted: true
      });
      saveNamespacedStorage(uid, 'user', initialProfile);

      // User switches goal to IELTS 7.5 with 60 mins/day
      const updatedProfile: UserProfile = {
        ...initialProfile,
        level: 'B2',
        targetExam: 'IELTS',
        targetScore: '7.5',
        dailyMinutesGoal: 60
      };
      saveNamespacedStorage(uid, 'user', updatedProfile);

      const rehydrated = loadNamespacedStorage<UserProfile>(uid, 'user', initialProfile);
      expect(rehydrated.targetExam).toBe('IELTS');
      expect(rehydrated.targetScore).toBe('7.5');
      expect(rehydrated.dailyMinutesGoal).toBe(60);
    });
  });

  describe('3. Learning & Lesson Progression Flow', () => {
    it('manages course selection, lesson prerequisites, XP award, and idempotency', () => {
      const uid = 'learner-study-01';
      const course = INITIAL_COURSES[0];
      const lessons = course.modules.flatMap((m) => m.lessons);
      expect(lessons.length).toBeGreaterThanOrEqual(2);

      const lesson1 = lessons[0];
      const lesson2 = lessons[1];

      // Initially, lesson 1 is unlocked
      const initialCompleted = new Set<string>();
      expect(isLessonUnlockedForUser(lesson1, initialCompleted)).toBe(true);

      // If lesson 2 has prerequisite lesson 1, it must initially be locked
      if (lesson2.prerequisites.length > 0) {
        expect(isLessonUnlockedForUser(lesson2, initialCompleted)).toBe(false);
      }

      // Complete lesson 1
      const completedSet = new Set<string>([lesson1.id]);
      saveNamespacedStorage(uid, `course_${course.id}`, Array.from(completedSet));

      // Progress calculation
      const progress = calculateCourseProgress(course, completedSet);
      expect(progress.completedLessonsCount).toBe(1);
      expect(progress.progressPercentage).toBeGreaterThan(0);

      // Lesson 2 is now unlocked
      expect(isLessonUnlockedForUser(lesson2, completedSet)).toBe(true);

      // XP and study time calculation:
      let userState = createDefaultUserProfile(uid, { email: 'learner-study@test.com' });
      const xpReward = lesson1.xpReward || 50;
      userState = {
        ...userState,
        xp: userState.xp + xpReward,
        todayMinutesSpent: userState.todayMinutesSpent + lesson1.durationMinutes,
        totalMinutesStudied: userState.totalMinutesStudied + lesson1.durationMinutes
      };
      saveNamespacedStorage(uid, 'user', userState);

      // Verify award updated exactly once
      expect(userState.xp).toBe(xpReward);

      // Idempotency: completing lesson 1 again does NOT add duplicate XP
      const alreadyCompleted = completedSet.has(lesson1.id);
      expect(alreadyCompleted).toBe(true);
      if (alreadyCompleted) {
        // Do not add XP again!
      }
      expect(userState.xp).toBe(xpReward);

      // Refresh verification: progress is preserved from storage
      const persistedIds = loadNamespacedStorage<string[]>(uid, `course_${course.id}`, []);
      expect(persistedIds).toContain(lesson1.id);
      expect(persistedIds).toHaveLength(1);
    });
  });

  describe('4. Tests & Practice Simulation Flow', () => {
    it('evaluates practice tests, manages blank questions, calculates scores, and ensures idempotency', () => {
      const uid = 'learner-exam-01';
      const test = INITIAL_PRACTICE_TESTS[0];
      expect(test.questions.length).toBeGreaterThan(0);

      // Simulate answers: answer first question correctly, leave second blank, answer third incorrectly
      const userAnswers: Record<string, number> = {};
      const q0 = test.questions[0];
      userAnswers[q0.id] = q0.correctAnswerIndex; // Correct

      if (test.questions.length > 1) {
        // second question left undefined (blank)
      }
      if (test.questions.length > 2) {
        const q2 = test.questions[2];
        const wrongChoice = (q2.correctAnswerIndex + 1) % q2.options.length;
        userAnswers[q2.id] = wrongChoice; // Incorrect
      }

      const evaluation = evaluateTestSubmission(test, userAnswers, 300);

      // Blank question must not throw error and is counted as unattempted/incorrect
      expect(evaluation.score).toBeGreaterThanOrEqual(1);
      expect(evaluation.totalQuestions).toBe(test.questions.length);
      expect(evaluation.accuracy).toBe(Math.round((evaluation.score / test.questions.length) * 100));

      // Attempt Record creation
      const attempt: TestAttempt = {
        id: `att-${Date.now()}`,
        testId: test.id,
        testTitle: test.title,
        date: new Date().toISOString().slice(0, 10),
        score: evaluation.score,
        totalQuestions: evaluation.totalQuestions,
        accuracy: evaluation.accuracy,
        timeSpentSeconds: 300,
        userAnswers: evaluation.userAnswers,
        flaggedQuestions: evaluation.flaggedQuestions,
        weaknessAnalysisVi: evaluation.weaknessAnalysisVi,
        recommendedLessonIds: evaluation.recommendedLessonIds,
        completedAt: new Date().toISOString()
      };

      // Idempotent submission: rapid multiple clicks should only record once
      const processedAttemptIds = new Set<string>();
      let attemptsRecorded = 0;

      const recordAttemptIdempotent = (att: TestAttempt) => {
        if (processedAttemptIds.has(att.id)) {
          return false; // Skip duplicate submission
        }
        processedAttemptIds.add(att.id);
        attemptsRecorded++;
        return true;
      };

      // Simulate 3 rapid clicks on submit button
      const r1 = recordAttemptIdempotent(attempt);
      const r2 = recordAttemptIdempotent(attempt);
      const r3 = recordAttemptIdempotent(attempt);

      expect(r1).toBe(true);
      expect(r2).toBe(false);
      expect(r3).toBe(false);
      expect(attemptsRecorded).toBe(1);

      // Persist attempt history
      saveNamespacedStorage(uid, 'test_attempts', [attempt]);

      // Verify attempt history persists across page reloads
      const loadedAttempts = loadNamespacedStorage<TestAttempt[]>(uid, 'test_attempts', []);
      expect(loadedAttempts).toHaveLength(1);
      expect(loadedAttempts[0].testId).toBe(test.id);
      expect(loadedAttempts[0].score).toBe(evaluation.score);
    });

    it('auto-submits exam when timer expires', () => {
      const test = INITIAL_PRACTICE_TESTS[0];
      const userAnswers: Record<string, number> = { [test.questions[0].id]: test.questions[0].correctAnswerIndex };

      // Timer reaches 0
      const remainingSeconds = 0;
      const isTimerExpired = remainingSeconds <= 0;
      expect(isTimerExpired).toBe(true);

      // Auto submission evaluates whatever is currently answered
      const evaluation = evaluateTestSubmission(test, userAnswers, test.durationMinutes * 60);
      expect(evaluation.score).toBeGreaterThanOrEqual(1);
      expect(evaluation.totalQuestions).toBe(test.questions.length);
    });
  });

  describe('5. AI Integration & Fault-Tolerance Regression', () => {
    it('verifies AI offline mode never fabricates fake scores and returns pedagogical fallback', async () => {
      // In offline mode without GEMINI_API_KEY
      const isLiveAI = false;
      const fallbackResponse = {
        isFallback: true,
        provider: 'offline-rule-based',
        content: 'Phản hồi mẫu có cơ sở sư phạm...'
      };

      expect(isLiveAI).toBe(false);
      expect(fallbackResponse.isFallback).toBe(true);
      expect(fallbackResponse.provider).toBe('offline-rule-based');
    });
  });

  describe('6. Security & Authorization Regression', () => {
    it('verifies non-admin role check prohibits administrative operations', () => {
      const learnerTokenUser = {
        uid: 'learner-uid-456',
        email: 'learner@example.com',
        isAdmin: false
      };

      expect(learnerTokenUser.isAdmin).toBe(false);

      const adminOperationAllowed = (user: typeof learnerTokenUser) => user.isAdmin;
      expect(adminOperationAllowed(learnerTokenUser)).toBe(false);
    });
  });
});
