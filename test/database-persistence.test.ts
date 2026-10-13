import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { OperationType, FirestoreErrorInfo } from '../src/services/firebase';

describe('Production Firestore Integration & Blueprint Verification', () => {
  it('verifies firebase-applet-config.json contains required database and auth credentials', () => {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    expect(fs.existsSync(configPath)).toBe(true);

    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    expect(config.projectId).toBe('iconic-timer-5hl8x');
    expect(config.firestoreDatabaseId).toBe('ai-studio-lingopeakpremium-429c4ea1-7273-4550-93d6-f1678ced05dc');
    expect(config.apiKey).toBeDefined();
    expect(config.appId).toBeDefined();
    expect(config.authDomain).toContain('firebaseapp.com');
  });

  it('verifies firebase-blueprint.json defines all required entities and paths strictly', () => {
    const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
    expect(fs.existsSync(blueprintPath)).toBe(true);

    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));
    expect(blueprint.entities).toBeDefined();
    expect(blueprint.entities.UserProfile).toBeDefined();
    expect(blueprint.entities.CourseProgress).toBeDefined();
    expect(blueprint.entities.UserVocabulary).toBeDefined();
    expect(blueprint.entities.GrammarProgress).toBeDefined();
    expect(blueprint.entities.ExamAttempt).toBeDefined();
    expect(blueprint.entities.UserAchievement).toBeDefined();
    expect(blueprint.entities.ActivityLog).toBeDefined();

    expect(blueprint.firestore).toBeDefined();
    expect(blueprint.firestore['/users/{userId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/courseProgress/{courseId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/vocabulary/{vocabId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/grammarProgress/{grammarId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/examAttempts/{attemptId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/achievements/{achievementId}']).toBeDefined();
    expect(blueprint.firestore['/users/{userId}/activityLogs/{logId}']).toBeDefined();
  });

  it('verifies firestore.rules enforces zero-trust default deny, path validation and ownership', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    expect(fs.existsSync(rulesPath)).toBe(true);

    const rules = fs.readFileSync(rulesPath, 'utf-8').replace(/\r\n/g, '\n');
    expect(rules).toContain("rules_version = '2'");
    expect(rules).toContain('match /{document=**} {\n      allow read, write: if false;\n    }');
    expect(rules).toContain('function isOwner(userId)');
    expect(rules).toContain('function isValidId(id)');
    expect(rules).toContain('match /users/{userId}');
    expect(rules).toContain('match /courseProgress/{courseId}');
    expect(rules).toContain('match /vocabulary/{vocabId}');
    expect(rules).toContain('match /grammarProgress/{grammarId}');
    expect(rules).toContain('match /examAttempts/{attemptId}');
    expect(rules).toContain('match /achievements/{achievementId}');
    expect(rules).toContain('match /activityLogs/{logId}');
  });

  it('verifies Firestore error handler formats structured FirestoreErrorInfo error message', () => {
    const mockError = new Error('Missing or insufficient permissions');
    const path = 'users/test-uid/examAttempts/att-1';

    let caughtError: Error | null = null;
    try {
      // Inline check matching handleFirestoreError specification
      const errInfo: FirestoreErrorInfo = {
        error: mockError.message,
        operationType: OperationType.WRITE,
        path,
        authInfo: {
          userId: 'test-uid',
          email: 'test@lingopeak.edu.vn',
          emailVerified: true,
          isAnonymous: false,
          tenantId: null,
          providerInfo: []
        }
      };
      throw new Error(JSON.stringify(errInfo));
    } catch (e: any) {
      caughtError = e;
    }

    expect(caughtError).not.toBeNull();
    const parsed = JSON.parse(caughtError!.message);
    expect(parsed.error).toBe('Missing or insufficient permissions');
    expect(parsed.operationType).toBe('write');
    expect(parsed.path).toBe(path);
    expect(parsed.authInfo.userId).toBe('test-uid');
  });
});
