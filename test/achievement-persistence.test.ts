import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { saveNamespacedStorage, loadNamespacedStorage } from '../src/context/AppContext';
import { INITIAL_ACHIEVEMENTS } from '../src/data/seedData';
import { Achievement } from '../src/types';

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

describe('Achievement progress survives a page refresh', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('keeps a legitimately earned ach-first-step (progress 1, unlocked true) after reload', () => {
    const uid = 'learner_thanhtung_lingopeak_io';
    const earned: Achievement[] = INITIAL_ACHIEVEMENTS.map((a, i) =>
      i === 0 ? { ...a, progress: a.maxProgress, unlocked: true, unlockedAt: '2026-01-01T00:00:00.000Z' } : a
    );

    saveNamespacedStorage(uid, 'achievements', earned);
    const reloaded = loadNamespacedStorage<Achievement[]>(uid, 'achievements', INITIAL_ACHIEVEMENTS);

    expect(reloaded[0].id).toBe('ach-first-step');
    expect(reloaded[0].progress).toBe(1);
    expect(reloaded[0].unlocked).toBe(true);
  });

  it('preserves earned vocab/grammar/course progress instead of discarding it as demo data', () => {
    const uid = 'learner_thanhtung_lingopeak_io';

    saveNamespacedStorage(uid, 'vocab', [{ id: 'voc-1', status: 'learning', reviewCount: 3 }]);
    saveNamespacedStorage(uid, 'grammar', [{ id: 'gr-1', masteryPercentage: 75 }]);
    saveNamespacedStorage(uid, 'courses', [
      { id: 'course-daily-routine', completedLessons: 3, modules: [{ lessons: [{ isCompleted: true }] }] }
    ]);

    expect(loadNamespacedStorage<any[]>(uid, 'vocab', [])[0].reviewCount).toBe(3);
    expect(loadNamespacedStorage<any[]>(uid, 'grammar', [])[0].masteryPercentage).toBe(75);
    expect(loadNamespacedStorage<any[]>(uid, 'courses', [])[0].completedLessons).toBe(3);
  });

  it('AppContext does not contain destructive demo-cleanup resets that wipe earned progress', () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), 'src/context/AppContext.tsx'), 'utf-8');

    expect(src).not.toMatch(/parsed\[0\]\?\.unlocked === true && parsed\[0\]\?\.progress === 1/);
    expect(src).not.toMatch(/parsed\[0\]\?\.status === 'learning' && parsed\[0\]\?\.reviewCount === 3/);
    expect(src).not.toMatch(/parsed\[0\]\?\.masteryPercentage === 75/);
    expect(src).not.toMatch(/parsed\[0\]\?\.completedLessons === 3/);
  });
});
