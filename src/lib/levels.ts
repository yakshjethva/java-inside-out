import type { ExplanationLevel } from '@/hooks/useLearningState';
import type { RichText } from '@/types/content';

/** One explanation written at up to three depths. */
export interface LeveledText {
  simple: RichText;
  /** Optional while content is being written; see `textAtLevel`. */
  developer?: RichText;
  deep: RichText;
}

export interface ResolvedText {
  text: RichText;
  /** The level the returned text was written for. */
  level: ExplanationLevel;
  /** True when the requested level has not been written yet and another level stands in. */
  fallback: boolean;
}

/**
 * The explanation for `level`. Every concept has a simple and a deep-dive
 * explanation; where the developer level has not been written yet, the deep
 * dive stands in and `fallback` says so, so the interface can tell the learner
 * instead of pretending the level exists.
 */
export function textAtLevel(content: LeveledText, level: ExplanationLevel): ResolvedText {
  if (level === 'developer') {
    return content.developer
      ? { text: content.developer, level: 'developer', fallback: false }
      : { text: content.deep, level: 'deep', fallback: true };
  }
  return { text: content[level], level, fallback: false };
}
