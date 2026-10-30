import { useSyncExternalStore } from 'react';
import { createPersistentStore, isRecord } from '@/lib/storage';

export type ExplanationLevel = 'beginner' | 'technical';
export type MotionPreference = 'system' | 'reduce' | 'allow';

export interface Preferences {
  level: ExplanationLevel;
  motion: MotionPreference;
}

export interface QuizResult {
  answers: Record<string, string>;
  correct: number;
  total: number;
  updatedAt: number;
}

export interface VisitedItem {
  /** e.g. "anatomy:heap" or "page:/glossary" */
  key: string;
  title: string;
  href: string;
  at: number;
}

export interface Progress {
  /** Component ids opened in the inspector → first time explored. */
  explored: Record<string, number>;
  /** Component ids the learner marked as understood. */
  understood: Record<string, number>;
  /** Bookmarked items, newest first. */
  bookmarks: VisitedItem[];
  /** Most recently explored items, newest first (max 8). */
  recent: VisitedItem[];
  quizzes: Record<string, QuizResult>;
  /** Scenario id → number of the furthest step reached. */
  scenarios: Record<string, number>;
  lastVisited?: VisitedItem;
}

const DEFAULT_PREFERENCES: Preferences = { level: 'beginner', motion: 'system' };

const EMPTY_PROGRESS: Progress = {
  explored: {},
  understood: {},
  bookmarks: [],
  recent: [],
  quizzes: {},
  scenarios: {},
};

const isVisited = (v: unknown): v is VisitedItem =>
  isRecord(v) &&
  typeof v.key === 'string' &&
  typeof v.title === 'string' &&
  typeof v.href === 'string' &&
  typeof v.at === 'number';

const isNumberRecord = (v: unknown): v is Record<string, number> =>
  isRecord(v) && Object.values(v).every((n) => typeof n === 'number');

function isPreferences(v: unknown): v is Preferences {
  return (
    isRecord(v) &&
    (v.level === 'beginner' || v.level === 'technical') &&
    (v.motion === 'system' || v.motion === 'reduce' || v.motion === 'allow')
  );
}

function isProgress(v: unknown): v is Progress {
  return (
    isRecord(v) &&
    isNumberRecord(v.explored) &&
    isNumberRecord(v.understood) &&
    Array.isArray(v.bookmarks) &&
    v.bookmarks.every(isVisited) &&
    Array.isArray(v.recent) &&
    v.recent.every(isVisited) &&
    isRecord(v.quizzes) &&
    isNumberRecord(v.scenarios) &&
    (v.lastVisited === undefined || isVisited(v.lastVisited))
  );
}

export const preferencesStore = createPersistentStore(
  'preferences',
  isPreferences,
  DEFAULT_PREFERENCES,
);
export const progressStore = createPersistentStore('progress', isProgress, EMPTY_PROGRESS);

export function usePreferences() {
  const preferences = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.get,
    preferencesStore.get,
  );
  return {
    preferences,
    setLevel: (level: ExplanationLevel) => preferencesStore.set((p) => ({ ...p, level })),
    setMotion: (motion: MotionPreference) => preferencesStore.set((p) => ({ ...p, motion })),
  };
}

export function useProgress() {
  return useSyncExternalStore(progressStore.subscribe, progressStore.get, progressStore.get);
}

const RECENT_LIMIT = 8;

export const progressActions = {
  markExplored(item: Omit<VisitedItem, 'at'>, componentId?: string) {
    const visited: VisitedItem = { ...item, at: Date.now() };
    progressStore.set((p) => {
      const recent = [visited, ...p.recent.filter((r) => r.key !== visited.key)].slice(
        0,
        RECENT_LIMIT,
      );
      const explored =
        componentId && !(componentId in p.explored)
          ? { ...p.explored, [componentId]: visited.at }
          : p.explored;
      return { ...p, recent, explored, lastVisited: visited };
    });
  },
  setLastVisited(item: VisitedItem) {
    progressStore.set((p) => ({ ...p, lastVisited: item }));
  },
  toggleUnderstood(componentId: string) {
    progressStore.set((p) => {
      const understood = { ...p.understood };
      if (componentId in understood) delete understood[componentId];
      else understood[componentId] = Date.now();
      return { ...p, understood };
    });
  },
  toggleBookmark(item: Omit<VisitedItem, 'at'>) {
    progressStore.set((p) => {
      const exists = p.bookmarks.some((b) => b.key === item.key);
      return {
        ...p,
        bookmarks: exists
          ? p.bookmarks.filter((b) => b.key !== item.key)
          : [{ ...item, at: Date.now() }, ...p.bookmarks],
      };
    });
  },
  saveQuiz(quizId: string, result: Omit<QuizResult, 'updatedAt'>) {
    progressStore.set((p) => ({
      ...p,
      quizzes: { ...p.quizzes, [quizId]: { ...result, updatedAt: Date.now() } },
    }));
  },
  recordScenarioStep(scenarioId: string, step: number) {
    progressStore.set((p) => {
      const previous = p.scenarios[scenarioId] ?? 0;
      if (step <= previous) return p;
      return { ...p, scenarios: { ...p.scenarios, [scenarioId]: step } };
    });
  },
  reset() {
    progressStore.reset();
  },
};
