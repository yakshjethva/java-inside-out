/**
 * Safe JSON persistence on top of localStorage.
 *
 * Storage can be unavailable (private windows, blocked site data, quota) or
 * hold data written by an older version. Every read is validated and falls
 * back to defaults; every write swallows errors. Nothing here is required for
 * the site to work: persistence is a convenience.
 */

const PREFIX = 'inside-java:v1:';

export function readJson<T>(key: string, validate: (value: unknown) => value is T, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Persistence is optional; ignore quota and access errors.
  }
}

export function removeKey(key: string): void {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export const storageKey = (key: string) => PREFIX + key;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Minimal observable store persisted under `key`. Components subscribe via
 * useSyncExternalStore; other tabs are kept in sync through the storage event.
 */
export function createPersistentStore<T>(
  key: string,
  validate: (value: unknown) => value is T,
  defaults: T,
) {
  let state = readJson(key, validate, defaults);
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === storageKey(key)) {
        state = readJson(key, validate, defaults);
        emit();
      }
    });
  }

  return {
    get: () => state,
    set(update: T | ((previous: T) => T)) {
      const next = typeof update === 'function' ? (update as (p: T) => T)(state) : update;
      if (Object.is(next, state)) return;
      state = next;
      writeJson(key, state);
      emit();
    },
    reset() {
      state = defaults;
      removeKey(key);
      emit();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
