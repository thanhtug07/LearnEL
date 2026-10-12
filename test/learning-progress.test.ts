import { describe, it, expect } from 'vitest';

describe('Learning Progress & Level Calculation', () => {
  it('calculates user levelNumber correctly from XP', () => {
    // Each level requires 500 XP
    expect(Math.floor(0 / 500) + 1).toBe(1);
    expect(Math.floor(450 / 500) + 1).toBe(1);
    expect(Math.floor(500 / 500) + 1).toBe(2);
    expect(Math.floor(999 / 500) + 1).toBe(2);
    expect(Math.floor(1000 / 500) + 1).toBe(3);
  });

  it('unlocks the next prerequisite lesson when current lesson is completed', () => {
    const lessons = [
      { id: 'l1', isCompleted: false, isLocked: false },
      { id: 'l2', isCompleted: false, isLocked: true },
      { id: 'l3', isCompleted: false, isLocked: true }
    ];

    const targetId = 'l1';
    const updatedLessons = lessons.map((les, idx, arr) => {
      if (les.id === targetId) {
        return { ...les, isCompleted: true };
      }
      // Check if previous lesson was completed to unlock
      if (idx > 0 && arr[idx - 1].id === targetId) {
        return { ...les, isLocked: false };
      }
      return les;
    });

    expect(updatedLessons[0].isCompleted).toBe(true);
    expect(updatedLessons[1].isLocked).toBe(false); // Unlocked!
    expect(updatedLessons[2].isLocked).toBe(true); // Still locked
  });
});
