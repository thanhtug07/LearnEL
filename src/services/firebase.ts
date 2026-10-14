import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  getDocFromServer,
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  VocabularyItem,
  TestAttempt,
  Achievement
} from '../types';

// Operation types conforming to Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with configured databaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Standard error handler conforming to skill specification
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test helper per skill specification
export async function testFirestoreConnection(): Promise<boolean> {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn('Firebase client is offline. Operating with local cache.');
      return false;
    }
    // Any other response (such as permission denied on unauth or not-found) indicates live server reachable
    return true;
  }
}

// Execute connection test on startup
testFirestoreConnection().catch(() => {});

/**
 * AUTHENTICATION ACTIONS
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * REAL FIRESTORE PERSISTENCE API
 */

// 1. User Profile
export async function saveUserProfileToFirestore(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        ...profile,
        uid: userId,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserProfileFromFirestore(userId: string): Promise<Partial<UserProfile> | null> {
  if (!userId) return null;
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<UserProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// 2. Course Progress
export async function saveCourseProgressToFirestore(
  userId: string,
  courseId: string,
  completedLessonIds: string[],
  completedCount: number
): Promise<void> {
  if (!userId || !courseId) return;
  const path = `users/${userId}/courseProgress/${courseId}`;
  try {
    const progressRef = doc(db, 'users', userId, 'courseProgress', courseId);
    await setDoc(
      progressRef,
      {
        courseId,
        completedLessonIds,
        completedCount,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadCourseProgressFromFirestore(
  userId: string
): Promise<Record<string, { completedLessonIds: string[]; completedCount: number }>> {
  if (!userId) return {};
  const path = `users/${userId}/courseProgress`;
  const result: Record<string, { completedLessonIds: string[]; completedCount: number }> = {};
  try {
    const colRef = collection(db, 'users', userId, 'courseProgress');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      const data = d.data();
      result[d.id] = {
        completedLessonIds: Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [],
        completedCount: typeof data.completedCount === 'number' ? data.completedCount : 0
      };
    });
    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

// 3. Vocabulary Tracking
export async function saveVocabularyItemToFirestore(userId: string, item: VocabularyItem): Promise<void> {
  if (!userId || !item.id) return;
  const path = `users/${userId}/vocabulary/${item.id}`;
  try {
    const vocabRef = doc(db, 'users', userId, 'vocabulary', item.id);
    await setDoc(vocabRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveVocabularyToFirestore(userId: string, items: VocabularyItem[]): Promise<void> {
  if (!userId || items.length === 0) return;
  const path = `users/${userId}/vocabulary`;
  try {
    const batch = writeBatch(db);
    // Write up to 450 items to stay safely within Firestore 500 limit
    for (const item of items.slice(0, 450)) {
      if (item.id) {
        const ref = doc(db, 'users', userId, 'vocabulary', item.id);
        batch.set(ref, item, { merge: true });
      }
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteVocabularyItemFromFirestore(userId: string, vocabId: string): Promise<void> {
  if (!userId || !vocabId) return;
  const path = `users/${userId}/vocabulary/${vocabId}`;
  try {
    const vocabRef = doc(db, 'users', userId, 'vocabulary', vocabId);
    await deleteDoc(vocabRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadVocabularyFromFirestore(userId: string): Promise<VocabularyItem[]> {
  if (!userId) return [];
  const path = `users/${userId}/vocabulary`;
  const items: VocabularyItem[] = [];
  try {
    const colRef = collection(db, 'users', userId, 'vocabulary');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      items.push(d.data() as VocabularyItem);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 4. Grammar Progress
export async function saveGrammarProgressToFirestore(
  userId: string,
  topicId: string,
  masteryPercentage: number
): Promise<void> {
  if (!userId || !topicId) return;
  const path = `users/${userId}/grammarProgress/${topicId}`;
  try {
    const grammarRef = doc(db, 'users', userId, 'grammarProgress', topicId);
    await setDoc(
      grammarRef,
      {
        topicId,
        masteryPercentage,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadGrammarProgressFromFirestore(
  userId: string
): Promise<Record<string, number>> {
  if (!userId) return {};
  const path = `users/${userId}/grammarProgress`;
  const result: Record<string, number> = {};
  try {
    const colRef = collection(db, 'users', userId, 'grammarProgress');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      const data = d.data();
      if (typeof data.masteryPercentage === 'number') {
        result[d.id] = data.masteryPercentage;
      }
    });
    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

// 5. Exam Attempts
export async function saveExamAttemptToFirestore(userId: string, attempt: TestAttempt): Promise<void> {
  if (!userId || !attempt.id) return;
  const path = `users/${userId}/examAttempts/${attempt.id}`;
  try {
    const attemptRef = doc(db, 'users', userId, 'examAttempts', attempt.id);
    await setDoc(attemptRef, attempt, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadExamAttemptsFromFirestore(userId: string, maxLimit: number = 50): Promise<TestAttempt[]> {
  if (!userId) return [];
  const path = `users/${userId}/examAttempts`;
  const list: TestAttempt[] = [];
  try {
    const colRef = collection(db, 'users', userId, 'examAttempts');
    const q = maxLimit > 0 ? query(colRef, limit(maxLimit)) : colRef;
    const snap = await getDocs(q);
    snap.forEach((d) => {
      list.push(d.data() as TestAttempt);
    });
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// 6. Achievements
export async function saveAchievementsToFirestore(userId: string, achievements: Achievement[]): Promise<void> {
  if (!userId || achievements.length === 0) return;
  const path = `users/${userId}/achievements`;
  try {
    const batch = writeBatch(db);
    for (const ach of achievements) {
      const ref = doc(db, 'users', userId, 'achievements', ach.id);
      batch.set(
        ref,
        {
          achievementId: ach.id,
          progress: ach.progress,
          unlocked: ach.unlocked,
          unlockedAt: ach.unlocked ? (ach.unlockedAt || new Date().toISOString()) : null
        },
        { merge: true }
      );
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadAchievementsFromFirestore(userId: string): Promise<Record<string, { progress: number; unlocked: boolean }>> {
  if (!userId) return {};
  const path = `users/${userId}/achievements`;
  const result: Record<string, { progress: number; unlocked: boolean }> = {};
  try {
    const colRef = collection(db, 'users', userId, 'achievements');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      const data = d.data();
      result[d.id] = {
        progress: Number(data.progress) || 0,
        unlocked: Boolean(data.unlocked)
      };
    });
    return result;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

// 7. Activity Logs
export interface ActivityLogItem {
  id: string;
  skill: 'listening' | 'speaking' | 'reading' | 'writing' | 'grammar' | 'vocabulary' | 'test';
  title: string;
  minutes: number;
  xpEarned: number;
  createdAt: string;
}

export async function logActivityToFirestore(userId: string, activity: ActivityLogItem): Promise<void> {
  if (!userId || !activity.id) return;
  const path = `users/${userId}/activityLogs/${activity.id}`;
  try {
    const ref = doc(db, 'users', userId, 'activityLogs', activity.id);
    await setDoc(ref, activity, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadActivityLogsFromFirestore(userId: string): Promise<ActivityLogItem[]> {
  if (!userId) return [];
  const path = `users/${userId}/activityLogs`;
  const list: ActivityLogItem[] = [];
  try {
    const colRef = collection(db, 'users', userId, 'activityLogs');
    const snap = await getDocs(colRef);
    snap.forEach((d) => {
      list.push(d.data() as ActivityLogItem);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

/**
 * Resets user learning progress in Firestore (zeroes stats, clears courseProgress)
 * Enforces ownership check against auth.currentUser.uid
 */
export async function resetUserProgressInFirestore(userId: string): Promise<void> {
  if (!userId || auth.currentUser?.uid !== userId) {
    throw new Error('Unauthorized: Cannot reset data for another user.');
  }
  const path = `users/${userId}`;
  try {
    // 1. Reset user statistics
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        xp: 0,
        levelNumber: 1,
        currentStreak: 0,
        todayMinutesSpent: 0,
        totalMinutesStudied: 0,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    // 2. Clear course progress documents
    const progressCol = collection(db, 'users', userId, 'courseProgress');
    const progressSnap = await getDocs(progressCol);
    const batch = writeBatch(db);
    progressSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
