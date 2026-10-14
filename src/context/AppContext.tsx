import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  Course,
  VocabularyItem,
  GrammarTopic,
  PracticeTest,
  TestAttempt,
  Achievement
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_VOCABULARY,
  INITIAL_GRAMMAR_TOPICS,
  INITIAL_PRACTICE_TESTS,
  INITIAL_ACHIEVEMENTS
} from '../data/seedData';
import {
  fetchPublishedCoursesFromFirestore,
  fetchUserCourseProgressFromFirestore,
  saveUserLessonCompletionToFirestore,
  UserCourseEnrollment
} from '../services/courseCatalogService';
import {
  auth,
  signInWithGoogle,
  logOut,
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
  saveCourseProgressToFirestore,
  loadCourseProgressFromFirestore,
  saveVocabularyItemToFirestore,
  deleteVocabularyItemFromFirestore,
  loadVocabularyFromFirestore,
  saveGrammarProgressToFirestore,
  loadGrammarProgressFromFirestore,
  saveExamAttemptToFirestore,
  loadExamAttemptsFromFirestore,
  saveAchievementsToFirestore,
  loadAchievementsFromFirestore,
  logActivityToFirestore,
  loadActivityLogsFromFirestore,
  ActivityLogItem
} from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export const DEFAULT_USER: UserProfile = {
  id: 'user-guest-1',
  name: 'Học viên',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  level: 'B1',
  targetExam: 'IELTS',
  targetScore: 'Band 7.0',
  dailyMinutesGoal: 30,
  todayMinutesSpent: 0,
  currentStreak: 0,
  totalMinutesStudied: 0,
  xp: 0,
  levelNumber: 1,
  language: 'vi',
  soundEnabled: true,
  onboardingCompleted: true,
};

export function getUserStorageKey(userId: string | null | undefined, key: string): string {
  if (!userId) {
    return `lingopeak_guest_${key}`;
  }
  return `lingopeak_user_${userId}_${key}`;
}

const memoryStorage = new Map<string, string>();

function getStorage() {
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, val: string) => memoryStorage.set(key, val),
    removeItem: (key: string) => memoryStorage.delete(key),
    clear: () => memoryStorage.clear(),
    key: (index: number) => Array.from(memoryStorage.keys())[index] || null,
    get length() {
      return memoryStorage.size;
    }
  };
}

export function saveNamespacedStorage<T>(userId: string | null | undefined, key: string, value: T): void {
  try {
    const storageKey = getUserStorageKey(userId, key);
    getStorage().setItem(storageKey, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to namespaced storage:', e);
  }
}

export function loadNamespacedStorage<T>(userId: string | null | undefined, key: string, fallback: T): T {
  try {
    const storageKey = getUserStorageKey(userId, key);
    const item = getStorage().getItem(storageKey);
    if (item !== null && item !== undefined) {
      return JSON.parse(item) as T;
    }
  } catch (e) {
    console.error('Failed to load from namespaced storage:', e);
  }
  return fallback;
}

export function clearNamespacedStorage(userId: string | null | undefined): void {
  try {
    const storage = getStorage();
    const prefix = userId ? `lingopeak_user_${userId}_` : `lingopeak_guest_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k: string) => storage.removeItem(k));
  } catch (e) {
    console.error('Failed to clear namespaced storage:', e);
  }
}

export function calculateLevelFromXP(xp: number): number {
  if (typeof xp !== 'number' || xp <= 0) {
    return 1;
  }
  return Math.floor(xp / 500) + 1;
}

export function createDefaultUserProfile(
  userId: string,
  custom?: Partial<UserProfile> & { displayName?: string; photoURL?: string }
): UserProfile {
  return {
    id: userId,
    name: custom?.displayName || custom?.name || 'Học viên',
    email: custom?.email || '',
    avatar: custom?.photoURL || custom?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    level: 'B1',
    targetExam: 'IELTS',
    targetScore: 'Band 7.0',
    dailyMinutesGoal: 30,
    todayMinutesSpent: 0,
    currentStreak: 0,
    totalMinutesStudied: 0,
    xp: 0,
    levelNumber: 1,
    language: 'vi',
    soundEnabled: true,
    onboardingCompleted: false,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    ...custom
  };
}

export function evaluateDailyReset(profile: UserProfile, currentDate?: string): UserProfile {
  const today = currentDate || new Date().toISOString().slice(0, 10);
  if (!profile.lastActiveDate) {
    return {
      ...profile,
      todayMinutesSpent: 0,
      lastActiveDate: today
    };
  }

  if (profile.lastActiveDate === today) {
    return profile;
  }

  const lastDate = new Date(profile.lastActiveDate);
  const curDate = new Date(today);
  const diffTime = curDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return {
      ...profile,
      todayMinutesSpent: 0,
      lastActiveDate: today
    };
  }

  return {
    ...profile,
    todayMinutesSpent: 0,
    currentStreak: 0,
    lastActiveDate: today
  };
}

export function buildCoursesWithProgress(
  baseCourses: Course[],
  progress: Record<string, { completedLessonIds?: string[]; completedCount?: number } | any> = {}
): Course[] {
  return baseCourses.map((course) => {
    const courseProg = progress[course.id];
    const completedIds = new Set<string>(courseProg?.completedLessonIds || []);

    const updatedModules = course.modules.map((mod) => {
      const updatedLessons = mod.lessons.map((les) => {
        const isCompleted = completedIds.has(les.id);
        const isUnlocked =
          !les.prerequisites ||
          les.prerequisites.length === 0 ||
          les.prerequisites.every((preId: string) => completedIds.has(preId));
        return {
          ...les,
          isCompleted,
          isLocked: !isUnlocked
        };
      });
      return {
        ...mod,
        lessons: updatedLessons
      };
    });

    return {
      ...course,
      completedLessons: completedIds.size,
      modules: updatedModules
    };
  });
}

export function buildVocabularyWithProgress(
  baseVocab: VocabularyItem[],
  userVocab: VocabularyItem[] | Record<string, any> = []
): VocabularyItem[] {
  if (Array.isArray(userVocab) && userVocab.length > 0) {
    const userMap = new Map(userVocab.map((v) => [v.id, v]));
    const merged = baseVocab.map((v) => userMap.get(v.id) || v);
    for (const [id, item] of userMap) {
      if (!merged.some((m) => m.id === id)) {
        merged.unshift(item);
      }
    }
    return merged;
  }
  return baseVocab.map((v) => ({
    ...v,
    status: 'unseen',
    reviewCount: 0,
    isFavorite: false
  }));
}

export function buildGrammarWithProgress(
  baseGrammar: GrammarTopic[],
  userGrammar: Record<string, number> = {}
): GrammarTopic[] {
  return baseGrammar.map((g) => ({
    ...g,
    masteryPercentage: userGrammar[g.id] !== undefined ? userGrammar[g.id] : 0
  }));
}

export function buildAchievementsWithProgress(
  baseAchievements: Achievement[],
  userAchievements: Record<string, any> = {}
): Achievement[] {
  return baseAchievements.map((ach) => {
    const saved = userAchievements[ach.id];
    return saved
      ? {
          ...ach,
          progress: saved.progress ?? ach.progress,
          unlocked: saved.unlocked ?? ach.unlocked,
          unlockedAt: saved.unlockedAt ?? ach.unlockedAt
        }
      : {
          ...ach,
          progress: 0,
          unlocked: false
        };
  });
}

export function calculateNextReviewInterval(
  status: 'unseen' | 'learning' | 'mastered',
  currentInterval = 1
): number {
  if (status === 'unseen') return 0;
  if (status === 'learning') return 1;
  if (status === 'mastered') {
    if (currentInterval <= 1) return 4;
    return currentInterval * 2;
  }
  return 1;
}

export function parseVocabularyCSV(csv: string): Partial<VocabularyItem>[] {
  if (!csv || !csv.trim()) return [];
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const items: Partial<VocabularyItem>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
    if (!matches) continue;

    const parts = matches.map((p) => {
      let cleaned = p.replace(/^,/, '').trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
      }
      return cleaned;
    });

    if (parts.length >= 4 && parts[0]) {
      items.push({
        word: parts[0],
        ipa: parts[1] || '',
        pos: parts[2] || 'noun',
        viMeaning: parts[3] || '',
        enDefinition: parts[4] || '',
        exampleEn: parts[5] || '',
        exampleVi: parts[6] || '',
        cefr: (parts[7] as any) || 'B1',
        status: 'learning',
        reviewCount: 0
      });
    }
  }
  return items;
}

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'unauthenticated' | 'error';

interface AppContextType {
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  courses: Course[];
  completeLesson: (courseId: string, lessonId: string) => void;
  vocabulary: VocabularyItem[];
  updateVocabStatus: (id: string, status: 'unseen' | 'learning' | 'mastered') => void;
  toggleVocabFavorite: (id: string) => void;
  deleteVocabulary: (id: string) => void;
  addCustomVocabulary: (item: Omit<VocabularyItem, 'id' | 'reviewCount'>) => void;
  exportVocabularyCSV: () => void;
  importVocabularyCSV: (csv: string) => number;
  grammarTopics: GrammarTopic[];
  updateGrammarMastery: (id: string, mastery: number) => void;
  practiceTests: PracticeTest[];
  testAttempts: TestAttempt[];
  recordTestAttempt: (attempt: TestAttempt) => void;
  achievements: Achievement[];
  addMinutesStudied: (minutes: number) => void;
  addXP: (amount: number) => void;
  resetAllData: () => void;
  resetLocalData: () => void;
  resetUserProgress: (options?: { cloud?: boolean }) => Promise<void>;
  language: 'vi' | 'en';
  toggleLanguage: () => void;
  selectedLesson: { courseId: string; lessonId: string } | null;
  setSelectedLesson: (val: { courseId: string; lessonId: string } | null) => void;
  activeExamId: string | null;
  setActiveExamId: (id: string | null) => void;
  // Firebase & Persistent Backend State
  firebaseUser: User | null;
  cloudSyncStatus: CloudSyncStatus;
  handleGoogleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  logSkillActivity: (skill: ActivityLogItem['skill'], title: string, minutes: number, xpEarned: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('unauthenticated');

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          // Sanitize old demo values if present in browser storage
          if (parsed.totalMinutesStudied === 214 && parsed.currentStreak === 12) {
            return DEFAULT_USER;
          }
          return { ...DEFAULT_USER, ...parsed };
        }
      }
    } catch {}
    return DEFAULT_USER;
  });

  const getInitialTab = (): string => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = [
        'dashboard', 'learning-path', 'courses', 'vocabulary', 'grammar',
        'listening', 'speaking', 'reading', 'writing', 'practice-tests',
        'ielts', 'toeic', 'ai-tutor', 'analytics', 'achievements', 'profile'
      ];
      if (validTabs.includes(hash)) return hash;
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);
  const [selectedLesson, setSelectedLesson] = useState<{ courseId: string; lessonId: string } | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };

  // Sync hashchange event for browser back and forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored courses contain old demo completion (completedLessons === 3 on course-daily-routine), discard
          if (parsed[0]?.completedLessons === 3 && parsed[0]?.modules?.[0]?.lessons?.[0]?.isCompleted === true) {
            return INITIAL_COURSES;
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_COURSES;
  });

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_vocab');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if stored vocab is old demo status
          if (parsed[0]?.status === 'learning' && parsed[0]?.reviewCount === 3) {
            return INITIAL_VOCABULARY;
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_VOCABULARY;
  });

  const [grammarTopics, setGrammarTopics] = useState<GrammarTopic[]>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_grammar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Discard old demo mastery percentages
          if (parsed[0]?.masteryPercentage === 75) {
            return INITIAL_GRAMMAR_TOPICS;
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_GRAMMAR_TOPICS;
  });

  const [practiceTests] = useState<PracticeTest[]>(INITIAL_PRACTICE_TESTS);

  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_attempts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Strip out sample attempt
          const realAttempts = parsed.filter((a: any) => a.id !== 'att-sample-1');
          return realAttempts;
        }
      }
    } catch {}
    return [];
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('lingopeak_achievements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Discard old achievements where ach-first-step was unlocked: true
          if (parsed[0]?.unlocked === true && parsed[0]?.progress === 1) {
            return INITIAL_ACHIEVEMENTS;
          }
          return parsed;
        }
      }
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  // Track recorded attempt IDs to prevent concurrent or duplicate score processing
  const processedAttemptIdsRef = useRef<Set<string>>(
    new Set(testAttempts.map((a) => a.id))
  );

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('lingopeak_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('lingopeak_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('lingopeak_vocab', JSON.stringify(vocabulary));
  }, [vocabulary]);

  useEffect(() => {
    localStorage.setItem('lingopeak_grammar', JSON.stringify(grammarTopics));
  }, [grammarTopics]);

  useEffect(() => {
    localStorage.setItem('lingopeak_attempts', JSON.stringify(testAttempts));
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem('lingopeak_achievements', JSON.stringify(achievements));
  }, [achievements]);

  /**
   * FIREBASE AUTH & FIRESTORE INITIALIZATION
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        setCloudSyncStatus('syncing');
        try {
          // Parallelize all 6 Firestore queries concurrently to eliminate sequential waterfall
          const [
            cloudProfile,
            courseProgress,
            cloudVocab,
            cloudGrammar,
            cloudAttempts,
            cloudAchievements
          ] = await Promise.all([
            loadUserProfileFromFirestore(currentUser.uid),
            loadCourseProgressFromFirestore(currentUser.uid),
            loadVocabularyFromFirestore(currentUser.uid),
            loadGrammarProgressFromFirestore(currentUser.uid),
            loadExamAttemptsFromFirestore(currentUser.uid),
            loadAchievementsFromFirestore(currentUser.uid)
          ]);

          // 1. User Profile
          if (cloudProfile) {
            setUser((prev) => ({
              ...prev,
              ...cloudProfile,
              id: currentUser.uid,
              name: currentUser.displayName || cloudProfile.name || prev.name,
              email: currentUser.email || cloudProfile.email || prev.email,
              avatar: currentUser.photoURL || cloudProfile.avatar || prev.avatar
            }));
          } else {
            // New user registration: initialize with clean zero statistics
            const initialDoc: Partial<UserProfile> = {
              id: currentUser.uid,
              name: currentUser.displayName || 'Học viên',
              email: currentUser.email || '',
              avatar: currentUser.photoURL || DEFAULT_USER.avatar,
              level: 'B1',
              targetExam: 'IELTS',
              targetScore: 'Band 7.0',
              dailyMinutesGoal: 30,
              todayMinutesSpent: 0,
              currentStreak: 0,
              totalMinutesStudied: 0,
              xp: 0,
              levelNumber: 1,
              language: 'vi',
              soundEnabled: true,
              onboardingCompleted: true,
            };
            await saveUserProfileToFirestore(currentUser.uid, initialDoc);
            setUser({ ...DEFAULT_USER, ...initialDoc } as UserProfile);
          }

          // 2. Course Progress
          if (courseProgress && Object.keys(courseProgress).length > 0) {
            setCourses((prev) =>
              prev.map((c) => {
                const prog = courseProgress[c.id];
                if (!prog) {
                  return {
                    ...c,
                    completedLessons: 0,
                    modules: c.modules.map((m) => ({
                      ...m,
                      lessons: m.lessons.map((les) => ({
                        ...les,
                        isCompleted: false,
                        isLocked: les.prerequisites.length > 0
                      }))
                    }))
                  };
                }
                const completedSet = new Set(prog.completedLessonIds);
                const updatedModules = c.modules.map((m) => ({
                  ...m,
                  lessons: m.lessons.map((les) => ({
                    ...les,
                    isCompleted: completedSet.has(les.id),
                    isLocked: les.prerequisites.length > 0 && !les.prerequisites.every((p) => completedSet.has(p))
                  }))
                }));
                return {
                  ...c,
                  completedLessons: prog.completedCount,
                  modules: updatedModules
                };
              })
            );
          } else {
            setCourses(INITIAL_COURSES);
          }

          // 3. Vocabulary
          if (cloudVocab && cloudVocab.length > 0) {
            setVocabulary((prev) => {
              const cloudMap = new Map(cloudVocab.map((v) => [v.id, v]));
              const merged = prev.map((v) => cloudMap.get(v.id) || v);
              for (const [id, item] of cloudMap) {
                if (!merged.some((m) => m.id === id)) {
                  merged.unshift(item);
                }
              }
              return merged;
            });
          } else {
            setVocabulary(INITIAL_VOCABULARY);
          }

          // 4. Grammar Progress
          if (cloudGrammar && Object.keys(cloudGrammar).length > 0) {
            setGrammarTopics((prev) =>
              prev.map((g) =>
                cloudGrammar[g.id] !== undefined
                  ? { ...g, masteryPercentage: cloudGrammar[g.id] }
                  : g
              )
            );
          } else {
            setGrammarTopics(INITIAL_GRAMMAR_TOPICS);
          }

          // 5. Exam Attempts
          if (cloudAttempts && cloudAttempts.length > 0) {
            setTestAttempts(cloudAttempts);
            cloudAttempts.forEach((a) => processedAttemptIdsRef.current.add(a.id));
          } else {
            setTestAttempts([]);
          }

          // 6. Achievements
          if (cloudAchievements && Object.keys(cloudAchievements).length > 0) {
            setAchievements((prev) =>
              prev.map((ach) => {
                const cloudAch = cloudAchievements[ach.id];
                return cloudAch
                  ? { ...ach, progress: cloudAch.progress, unlocked: cloudAch.unlocked }
                  : ach;
              })
            );
          } else {
            setAchievements(INITIAL_ACHIEVEMENTS);
          }

          setCloudSyncStatus('synced');
        } catch (err) {
          console.warn('Error hydrating from Firestore:', err);
          setCloudSyncStatus('offline');
        }
      } else {
        setCloudSyncStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setCloudSyncStatus('syncing');
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Failed to sign in with Google:', err);
      setCloudSyncStatus('unauthenticated');
      throw err;
    }
  };

  const handleSignOut = async () => {
    await logOut();
    setFirebaseUser(null);
    setCloudSyncStatus('unauthenticated');
    // Restore clean slate
    setUser(DEFAULT_USER);
    setCourses(INITIAL_COURSES);
    setVocabulary(INITIAL_VOCABULARY);
    setGrammarTopics(INITIAL_GRAMMAR_TOPICS);
    setTestAttempts([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    localStorage.removeItem('lingopeak_attempts');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      if (firebaseUser) {
        setCloudSyncStatus('syncing');
        saveUserProfileToFirestore(firebaseUser.uid, next)
          .then(() => setCloudSyncStatus('synced'))
          .catch(() => setCloudSyncStatus('offline'));
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    setUser((prev) => {
      const newLang: 'vi' | 'en' = prev.language === 'vi' ? 'en' : 'vi';
      const next: UserProfile = { ...prev, language: newLang };
      if (firebaseUser) {
        saveUserProfileToFirestore(firebaseUser.uid, { language: newLang });
      }
      return next;
    });
  };

  const addXP = (amount: number) => {
    setUser((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 500) + 1;
      const next = {
        ...prev,
        xp: newXp,
        levelNumber: newLevel
      };
      if (firebaseUser) {
        saveUserProfileToFirestore(firebaseUser.uid, { xp: newXp, levelNumber: newLevel });
      }
      return next;
    });
  };

  const addMinutesStudied = (minutes: number) => {
    setUser((prev) => {
      const next = {
        ...prev,
        todayMinutesSpent: prev.todayMinutesSpent + minutes,
        totalMinutesStudied: prev.totalMinutesStudied + minutes
      };
      if (firebaseUser) {
        saveUserProfileToFirestore(firebaseUser.uid, {
          todayMinutesSpent: next.todayMinutesSpent,
          totalMinutesStudied: next.totalMinutesStudied
        });
      }
      return next;
    });
  };

  const completeLesson = (courseId: string, lessonId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        let newlyCompleted = false;
        const newModules = c.modules.map((m) => {
          const lessonsCount = m.lessons.length;
          const updatedLessons = m.lessons.map((les) => {
            if (les.id === lessonId) {
              if (!les.isCompleted) newlyCompleted = true;
              return { ...les, isCompleted: true };
            }
            return les;
          });

          // Unlock next lesson
          const targetIndex = updatedLessons.findIndex((l) => l.id === lessonId);
          if (targetIndex !== -1 && targetIndex + 1 < lessonsCount) {
            updatedLessons[targetIndex + 1] = {
              ...updatedLessons[targetIndex + 1],
              isLocked: false
            };
          }

          return {
            ...m,
            lessons: updatedLessons
          };
        });

        const completedLessonIds = newModules
          .flatMap((m) => m.lessons)
          .filter((l) => l.isCompleted)
          .map((l) => l.id);
        const count = completedLessonIds.length;

        if (newlyCompleted) {
          addXP(50);
          addMinutesStudied(15);
          if (firebaseUser) {
            setCloudSyncStatus('syncing');
            saveCourseProgressToFirestore(firebaseUser.uid, courseId, completedLessonIds, count)
              .then(() => setCloudSyncStatus('synced'))
              .catch(() => setCloudSyncStatus('offline'));
            logSkillActivity('reading', `Hoàn thành bài học ${lessonId}`, 15, 50);
          }
        }
        return {
          ...c,
          completedLessons: count,
          modules: newModules
        };
      })
    );
  };

  const updateVocabStatus = (id: string, status: 'unseen' | 'learning' | 'mastered') => {
    let updatedItem: VocabularyItem | null = null;
    setVocabulary((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + (status === 'mastered' ? 4 : 1));
          updatedItem = {
            ...item,
            status,
            reviewCount: item.reviewCount + 1,
            lastReviewed: new Date().toISOString(),
            nextReviewDate: nextReview.toISOString()
          };
          return updatedItem;
        }
        return item;
      })
    );

    if (firebaseUser && updatedItem) {
      saveVocabularyItemToFirestore(firebaseUser.uid, updatedItem);
    }

    // Update vocab achievement progress
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'ach-vocab-50') {
          const masteredCount = vocabulary.filter((v) => v.status === 'mastered').length + (status === 'mastered' ? 1 : 0);
          const updated = {
            ...ach,
            progress: masteredCount,
            unlocked: masteredCount >= ach.maxProgress
          };
          if (firebaseUser) {
            saveAchievementsToFirestore(firebaseUser.uid, [updated]);
          }
          return updated;
        }
        return ach;
      })
    );
  };

  const toggleVocabFavorite = (id: string) => {
    let updatedItem: VocabularyItem | null = null;
    setVocabulary((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedItem = { ...item, isFavorite: !item.isFavorite };
          return updatedItem;
        }
        return item;
      })
    );
    if (firebaseUser && updatedItem) {
      saveVocabularyItemToFirestore(firebaseUser.uid, updatedItem);
    }
  };

  const deleteVocabulary = (id: string) => {
    setVocabulary((prev) => prev.filter((item) => item.id !== id));
    if (firebaseUser) {
      deleteVocabularyItemFromFirestore(firebaseUser.uid, id);
    }
  };

  const addCustomVocabulary = (item: Omit<VocabularyItem, 'id' | 'reviewCount'>) => {
    const newItem: VocabularyItem = {
      ...item,
      id: `voc-custom-${Date.now()}`,
      reviewCount: 0
    };
    setVocabulary((prev) => [newItem, ...prev]);
    if (firebaseUser) {
      saveVocabularyItemToFirestore(firebaseUser.uid, newItem);
    }
  };

  const exportVocabularyCSV = () => {
    const headers = ['Word', 'IPA', 'Part of Speech', 'Vietnamese Meaning', 'Definition', 'Example (EN)', 'Example (VI)', 'CEFR', 'Status'];
    const rows = vocabulary.map((v) => [
      `"${v.word.replace(/"/g, '""')}"`,
      `"${v.ipa.replace(/"/g, '""')}"`,
      `"${v.pos}"`,
      `"${v.viMeaning.replace(/"/g, '""')}"`,
      `"${v.enDefinition.replace(/"/g, '""')}"`,
      `"${v.exampleEn.replace(/"/g, '""')}"`,
      `"${v.exampleVi.replace(/"/g, '""')}"`,
      `"${v.cefr}"`,
      `"${v.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lingopeak_vocabulary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importVocabularyCSV = (csvText: string): number => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return 0;
    let count = 0;
    const newItems: VocabularyItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].replace(/\r$/, '');
      if (!line.trim()) continue;
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 4 && parts[0]) {
        newItems.push({
          id: `voc-imp-${Date.now()}-${i}`,
          word: parts[0],
          ipa: parts[1] || '',
          pos: parts[2] || 'n',
          viMeaning: parts[3] || '',
          enDefinition: parts[4] || '',
          exampleEn: parts[5] || '',
          exampleVi: parts[6] || '',
          collocations: [],
          synonyms: [],
          cefr: (parts[7] as any) || 'B1',
          topic: 'Imported',
          status: 'learning',
          reviewCount: 0
        });
        count++;
      }
    }

    if (newItems.length > 0) {
      setVocabulary((prev) => [...newItems, ...prev]);
      if (firebaseUser) {
        newItems.forEach((it) => saveVocabularyItemToFirestore(firebaseUser.uid, it));
      }
    }
    return count;
  };

  const updateGrammarMastery = (id: string, mastery: number) => {
    setGrammarTopics((prev) =>
      prev.map((g) => (g.id === id ? { ...g, masteryPercentage: mastery } : g))
    );
    if (firebaseUser) {
      saveGrammarProgressToFirestore(firebaseUser.uid, id, mastery);
      logSkillActivity('grammar', `Luyện tập chủ điểm ${id}`, 10, 25);
    }
  };

  const recordTestAttempt = (attempt: TestAttempt) => {
    if (processedAttemptIdsRef.current.has(attempt.id)) {
      return;
    }
    processedAttemptIdsRef.current.add(attempt.id);

    setTestAttempts((prev) => {
      const alreadyExists = prev.some((a) => a.id === attempt.id);
      if (alreadyExists) return prev;
      return [attempt, ...prev];
    });

    addXP(100);
    const minutes = Math.max(1, Math.round(attempt.timeSpentSeconds / 60));
    addMinutesStudied(minutes);

    if (firebaseUser) {
      setCloudSyncStatus('syncing');
      saveExamAttemptToFirestore(firebaseUser.uid, attempt)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
      logSkillActivity('test', `Hoàn thành bài thi ${attempt.testTitle}`, minutes, 100);
    }

    if (attempt.accuracy >= 85) {
      setAchievements((prev) => {
        const next = prev.map((a) => (a.id === 'ach-exam-ace' ? { ...a, unlocked: true } : a));
        if (firebaseUser) {
          saveAchievementsToFirestore(firebaseUser.uid, next);
        }
        return next;
      });
    }
  };

  const logSkillActivity = (skill: ActivityLogItem['skill'], title: string, minutes: number, xpEarned: number) => {
    const item: ActivityLogItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      skill,
      title,
      minutes,
      xpEarned,
      createdAt: new Date().toISOString()
    };
    if (firebaseUser) {
      logActivityToFirestore(firebaseUser.uid, item);
    }
  };

  const resetAllData = () => {
    localStorage.clear();
    processedAttemptIdsRef.current.clear();
    setUser(DEFAULT_USER);
    setCourses(INITIAL_COURSES);
    setVocabulary(INITIAL_VOCABULARY);
    setGrammarTopics(INITIAL_GRAMMAR_TOPICS);
    setTestAttempts([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
  };

  const resetLocalData = () => {
    resetAllData();
  };

  const resetUserProgress = async (_options?: { cloud?: boolean }) => {
    resetAllData();
  };

  const contextValue = React.useMemo<AppContextType>(
    () => ({
      user,
      updateUser,
      activeTab,
      setActiveTab,
      courses,
      completeLesson,
      vocabulary,
      updateVocabStatus,
      toggleVocabFavorite,
      deleteVocabulary,
      addCustomVocabulary,
      exportVocabularyCSV,
      importVocabularyCSV,
      grammarTopics,
      updateGrammarMastery,
      practiceTests,
      testAttempts,
      recordTestAttempt,
      achievements,
      addMinutesStudied,
      addXP,
      resetAllData,
      resetLocalData,
      resetUserProgress,
      language: user.language,
      toggleLanguage,
      selectedLesson,
      setSelectedLesson,
      activeExamId,
      setActiveExamId,
      firebaseUser,
      cloudSyncStatus,
      handleGoogleSignIn,
      handleSignOut,
      logSkillActivity
    }),
    [
      user,
      activeTab,
      courses,
      vocabulary,
      grammarTopics,
      practiceTests,
      testAttempts,
      achievements,
      selectedLesson,
      activeExamId,
      firebaseUser,
      cloudSyncStatus
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
