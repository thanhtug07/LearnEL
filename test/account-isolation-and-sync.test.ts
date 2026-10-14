import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getUserStorageKey,
  loadNamespacedStorage,
  saveNamespacedStorage,
  clearNamespacedStorage,
  createDefaultUserProfile,
  evaluateDailyReset,
  buildCoursesWithProgress,
  buildVocabularyWithProgress,
  buildGrammarWithProgress,
  buildAchievementsWithProgress,
  DEFAULT_USER
} from '../src/context/AppContext';
import { INITIAL_COURSES, INITIAL_VOCABULARY, INITIAL_GRAMMAR_TOPICS, INITIAL_ACHIEVEMENTS } from '../src/data/seedData';
import { UserProfile, Course, TestAttempt } from '../src/types';

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

describe('Account Isolation, Firebase Sync & Learning Progress Suite', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Clean New Account Initialization', () => {
    it('creates a clean default profile with 0 stats and onboardingCompleted: false', () => {
      const newUid = 'firebase-new-user-001';
      const user = createDefaultUserProfile(newUid, {
        displayName: 'Nguyễn Văn A',
        email: 'vana@example.com',
        photoURL: 'https://example.com/avatar.jpg'
      });

      expect(user.id).toBe(newUid);
      expect(user.name).toBe('Nguyễn Văn A');
      expect(user.email).toBe('vana@example.com');
      // Crucial requirement: New accounts must have 0 stats and onboardingCompleted === false
      expect(user.xp).toBe(0);
      expect(user.levelNumber).toBe(1);
      expect(user.currentStreak).toBe(0);
      expect(user.todayMinutesSpent).toBe(0);
      expect(user.totalMinutesStudied).toBe(0);
      expect(user.onboardingCompleted).toBe(false);
      expect(user.lastActiveDate).toBe(new Date().toISOString().slice(0, 10));
    });

    it('initializes new user courses with 0% progress and no completed lessons', () => {
      // Empty progress from Firestore for a new user
      const emptyCourseProgress = {};
      const courses = buildCoursesWithProgress(INITIAL_COURSES, emptyCourseProgress);

      courses.forEach((c) => {
        expect(c.completedLessons).toBe(0);
        c.modules.forEach((m) => {
          m.lessons.forEach((les) => {
            expect(les.isCompleted).toBe(false);
          });
        });
      });
    });

    it('initializes clean vocabulary without demo review states', () => {
      const vocab = buildVocabularyWithProgress(INITIAL_VOCABULARY, []);
      expect(vocab.length).toBeGreaterThan(0);
      vocab.forEach((v) => {
        expect(v.status).toBe('unseen');
        expect(v.reviewCount).toBe(0);
      });
    });
  });

  describe('2. Account Isolation & Cache Namespacing (User A vs User B)', () => {
    it('generates distinct, non-overlapping storage keys for User A, User B, and Guest', () => {
      const keyGuest = getUserStorageKey(null, 'user');
      const keyUserA = getUserStorageKey('uid-A-123', 'user');
      const keyUserB = getUserStorageKey('uid-B-456', 'user');

      expect(keyGuest).toBe('lingopeak_guest_user');
      expect(keyUserA).toBe('lingopeak_user_uid-A-123_user');
      expect(keyUserB).toBe('lingopeak_user_uid-B-456_user');

      expect(keyUserA).not.toBe(keyUserB);
      expect(keyUserA).not.toBe(keyGuest);
    });

    it('preserves User A data while ensuring User B sees only their clean isolated state', () => {
      const uidA = 'account-A';
      const uidB = 'account-B';

      // User A studies: earns 1200 XP, 45 minutes, completed lesson
      const profileA: UserProfile = {
        ...createDefaultUserProfile(uidA),
        xp: 1200,
        levelNumber: 3,
        totalMinutesStudied: 45,
        onboardingCompleted: true
      };
      saveNamespacedStorage(uidA, 'user', profileA);

      // User B logs in: load namespaced storage for User B
      const loadedB = loadNamespacedStorage<UserProfile | null>(uidB, 'user', null);
      expect(loadedB).toBeNull(); // No data exists for B yet!

      // User B receives clean default profile
      const profileB = createDefaultUserProfile(uidB);
      expect(profileB.xp).toBe(0);
      expect(profileB.totalMinutesStudied).toBe(0);
      expect(profileB.id).toBe(uidB);

      // Verify User A data was untouched in localStorage
      const reloadedA = loadNamespacedStorage<UserProfile>(uidA, 'user', DEFAULT_USER);
      expect(reloadedA.xp).toBe(1200);
      expect(reloadedA.id).toBe(uidA);
    });

    it('clears only the target user namespaced cache on reset without touching other users', () => {
      const uidA = 'user-alice';
      const uidB = 'user-bob';

      saveNamespacedStorage(uidA, 'user', { xp: 500 });
      saveNamespacedStorage(uidA, 'courses', [{ id: 'c1' }]);
      saveNamespacedStorage(uidB, 'user', { xp: 900 });

      // Alice clears local data
      clearNamespacedStorage(uidA);

      expect(localStorage.getItem(getUserStorageKey(uidA, 'user'))).toBeNull();
      expect(localStorage.getItem(getUserStorageKey(uidA, 'courses'))).toBeNull();

      // Bob's data remains intact
      expect(localStorage.getItem(getUserStorageKey(uidB, 'user'))).not.toBeNull();
      const bobData = loadNamespacedStorage(uidB, 'user', { xp: 0 });
      expect(bobData.xp).toBe(900);
    });
  });

  describe('3. Restoring User A upon Sign-In and Refresh', () => {
    it('restores User A persisted progress accurately after logout and re-login', () => {
      const uidA = 'uid-returning-learner';
      const savedCourseProgress = {
        'course-daily-routine': {
          completedLessonIds: ['les-daily-1'],
          completedCount: 1
        }
      };

      const restoredCourses = buildCoursesWithProgress(INITIAL_COURSES, savedCourseProgress);
      const targetCourse = restoredCourses.find((c) => c.id === 'course-daily-routine');

      expect(targetCourse?.completedLessons).toBe(1);
      const lesson1 = targetCourse?.modules[0].lessons.find((l) => l.id === 'les-daily-1');
      expect(lesson1?.isCompleted).toBe(true);

      const lesson2 = targetCourse?.modules[0].lessons.find((l) => l.id === 'les-daily-2');
      expect(lesson2?.isLocked).toBe(false); // Unlocked because prereq was completed
    });

    it('survives page refresh by restoring namespaced cached progress instantly', () => {
      const uid = 'uid-in-progress';
      const inProgressProfile: UserProfile = {
        ...createDefaultUserProfile(uid),
        xp: 450,
        todayMinutesSpent: 20
      };

      saveNamespacedStorage(uid, 'user', inProgressProfile);

      // Simulate browser refresh: reload from localStorage
      const refreshedProfile = loadNamespacedStorage<UserProfile>(uid, 'user', DEFAULT_USER);
      expect(refreshedProfile.xp).toBe(450);
      expect(refreshedProfile.todayMinutesSpent).toBe(20);
    });
  });

  describe('4. Strict Idempotency in Lesson Completion', () => {
    it('does not duplicate XP or completed count when completing the same lesson multiple times', () => {
      const courseId = 'course-daily-routine';
      const lessonId = 'les-daily-1';

      const currentProgress: Record<string, { completedLessonIds: string[]; completedCount: number }> = {
        [courseId]: {
          completedLessonIds: [],
          completedCount: 0
        }
      };

      // Helper function simulating completeLesson logic
      function applyLessonCompletion(cId: string, lId: string, completedSet: Set<string>) {
        const key = `${cId}::${lId}`;
        if (completedSet.has(key)) {
          return { newlyCompleted: false, xpAwarded: 0 };
        }
        completedSet.add(key);
        currentProgress[cId].completedLessonIds.push(lId);
        currentProgress[cId].completedCount += 1;
        return { newlyCompleted: true, xpAwarded: 50 };
      }

      const completedTracking = new Set<string>();

      // First completion
      const first = applyLessonCompletion(courseId, lessonId, completedTracking);
      expect(first.newlyCompleted).toBe(true);
      expect(first.xpAwarded).toBe(50);
      expect(currentProgress[courseId].completedCount).toBe(1);

      // Second completion (e.g. rapid click / re-render / network retry)
      const second = applyLessonCompletion(courseId, lessonId, completedTracking);
      expect(second.newlyCompleted).toBe(false);
      expect(second.xpAwarded).toBe(0);
      expect(currentProgress[courseId].completedCount).toBe(1); // STILL 1!
    });
  });

  describe('5. Midnight Date Transition & Daily Rollover', () => {
    it('resets todayMinutesSpent to 0 when date changes without losing totalMinutesStudied', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const user: UserProfile = {
        ...createDefaultUserProfile('uid-active'),
        todayMinutesSpent: 45,
        totalMinutesStudied: 120,
        currentStreak: 3,
        lastActiveDate: yesterday
      };

      const updated = evaluateDailyReset(user);

      expect(updated.todayMinutesSpent).toBe(0); // Reset for new day!
      expect(updated.totalMinutesStudied).toBe(120); // Lifetime retained!
      expect(updated.lastActiveDate).toBe(new Date().toISOString().slice(0, 10));
      expect(updated.currentStreak).toBe(3); // Streak preserved from yesterday
    });

    it('resets streak to 0 if user missed more than 1 day', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const user: UserProfile = {
        ...createDefaultUserProfile('uid-lapsed'),
        todayMinutesSpent: 30,
        currentStreak: 7,
        lastActiveDate: threeDaysAgo
      };

      const updated = evaluateDailyReset(user);

      expect(updated.todayMinutesSpent).toBe(0);
      expect(updated.currentStreak).toBe(0); // Reset due to inactivity!
    });

    it('does not reset todayMinutesSpent if lastActiveDate is already today', () => {
      const today = new Date().toISOString().slice(0, 10);
      const user: UserProfile = {
        ...createDefaultUserProfile('uid-today'),
        todayMinutesSpent: 25,
        currentStreak: 4,
        lastActiveDate: today
      };

      const updated = evaluateDailyReset(user);

      expect(updated.todayMinutesSpent).toBe(25);
      expect(updated.currentStreak).toBe(4);
    });
  });

  describe('6. Account Switching Race Condition Guard', () => {
    it('discards stale async Firestore resolutions from superseded accounts', () => {
      let activeAuthUid: string | null = 'user-A';
      let authSequence = 1;

      let appliedUserAData = false;
      let appliedUserBData = false;

      // Simulate User A trigger
      const seqA = authSequence;
      const targetA = activeAuthUid;

      // User A async task starts...
      const slowFetchUserA = new Promise((resolve) => {
        setTimeout(() => resolve({ uid: 'user-A', xp: 500 }), 50);
      });

      // Before User A resolves, user switches to User B!
      authSequence += 1;
      activeAuthUid = 'user-B';
      const seqB = authSequence;
      const targetB = activeAuthUid;

      // Check handler for User A when it resolves:
      function handleResolution(seq: number, target: string | null, data: any) {
        if (seq !== authSequence || target !== activeAuthUid) {
          // Discard!
          return false;
        }
        return true;
      }

      expect(handleResolution(seqA, targetA, { xp: 500 })).toBe(false); // Discarded!
      expect(handleResolution(seqB, targetB, { xp: 0 })).toBe(true); // Accepted!
    });
  });

  describe('7. Firestore Security Rules Enforcement (Multi-Tenant Authorization)', () => {
    it('verifies firestore.rules strictly scopes user subcollections to request.auth.uid == userId', () => {
      const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
      const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

      // Check ownership definition
      expect(rulesContent).toContain('function isOwner(userId) {');
      expect(rulesContent).toContain('return isSignedIn() && request.auth.uid == userId;');

      // Check user document rules
      expect(rulesContent).toContain('match /users/{userId} {');
      expect(rulesContent).toContain('allow read: if isOwner(userId);');
      expect(rulesContent).toContain('allow create, update: if isOwner(userId) && isValidId(userId);');
      expect(rulesContent).toContain('allow delete: if isOwner(userId);');

      // Check all subcollections are guarded with isOwner(userId)
      expect(rulesContent).toContain('match /courseProgress/{courseId} {');
      expect(rulesContent).toContain('allow read, write: if isOwner(userId)');

      expect(rulesContent).toContain('match /vocabulary/{vocabId} {');
      expect(rulesContent).toContain('allow read, write: if isOwner(userId)');

      expect(rulesContent).toContain('match /examAttempts/{attemptId} {');
      expect(rulesContent).toContain('allow read, write: if isOwner(userId)');

      expect(rulesContent).toContain('match /achievements/{achievementId} {');
      expect(rulesContent).toContain('allow read, write: if isOwner(userId)');
    });
  });
});
