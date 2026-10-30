import { describe, expect, it } from 'vitest';
import { progressActions, progressStore, preferencesStore } from '@/hooks/useLearningState';
import { createPersistentStore, isRecord, readJson, storageKey } from '@/lib/storage';

describe('persistent store', () => {
  it('falls back to defaults for missing, corrupt or invalid data', () => {
    const isNumbers = (v: unknown): v is number[] =>
      Array.isArray(v) && v.every((n) => typeof n === 'number');
    expect(readJson('missing', isNumbers, [1])).toEqual([1]);
    localStorage.setItem(storageKey('corrupt'), '{not json');
    expect(readJson('corrupt', isNumbers, [2])).toEqual([2]);
    localStorage.setItem(storageKey('invalid'), JSON.stringify(['a']));
    expect(readJson('invalid', isNumbers, [3])).toEqual([3]);
  });

  it('persists updates and notifies subscribers', () => {
    const store = createPersistentStore(
      'counter',
      (v): v is { n: number } => isRecord(v) && typeof v.n === 'number',
      { n: 0 },
    );
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    store.set((s) => ({ n: s.n + 1 }));
    expect(store.get()).toEqual({ n: 1 });
    expect(JSON.parse(localStorage.getItem(storageKey('counter'))!)).toEqual({ n: 1 });
    expect(calls).toBe(1);
    unsubscribe();
    store.reset();
    expect(store.get()).toEqual({ n: 0 });
  });
});

describe('progress actions', () => {
  it('records explored components once and keeps recent items unique and bounded', () => {
    progressStore.reset();
    for (let i = 0; i < 12; i++) {
      progressActions.markExplored(
        { key: `anatomy:c${i}`, title: `C${i}`, href: `/anatomy?c=c${i}` },
        `c${i}`,
      );
    }
    progressActions.markExplored({ key: 'anatomy:c3', title: 'C3', href: '/anatomy?c=c3' }, 'c3');
    const state = progressStore.get();
    expect(Object.keys(state.explored)).toHaveLength(12);
    expect(state.recent).toHaveLength(8);
    expect(state.recent[0]!.key).toBe('anatomy:c3');
    expect(new Set(state.recent.map((r) => r.key)).size).toBe(8);
    expect(state.lastVisited?.key).toBe('anatomy:c3');
  });

  it('toggles bookmarks and understood flags', () => {
    progressStore.reset();
    const item = { key: 'anatomy:heap', title: 'Heap', href: '/anatomy?c=heap' };
    progressActions.toggleBookmark(item);
    expect(progressStore.get().bookmarks.map((b) => b.key)).toEqual(['anatomy:heap']);
    progressActions.toggleBookmark(item);
    expect(progressStore.get().bookmarks).toEqual([]);
    progressActions.toggleUnderstood('heap');
    expect('heap' in progressStore.get().understood).toBe(true);
    progressActions.toggleUnderstood('heap');
    expect('heap' in progressStore.get().understood).toBe(false);
  });

  it('stores quiz results and only moves scenario progress forward', () => {
    progressStore.reset();
    progressActions.saveQuiz('q', { answers: { a: 'x' }, correct: 1, total: 3 });
    expect(progressStore.get().quizzes.q).toMatchObject({
      answers: { a: 'x' },
      correct: 1,
      total: 3,
    });
    progressActions.recordScenarioStep('s', 4);
    progressActions.recordScenarioStep('s', 2);
    expect(progressStore.get().scenarios.s).toBe(4);
  });

  it('has safe default preferences', () => {
    expect(preferencesStore.get()).toEqual({ level: 'beginner', motion: 'system' });
  });
});
