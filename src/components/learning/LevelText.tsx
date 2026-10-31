import type { ExplanationLevel } from '@/hooks/useLearningState';
import { textAtLevel, type LeveledText } from '@/lib/levels';
import { RichText } from './RichText';

/**
 * An explanation at the chosen level. When that level has not been written
 * yet the deep dive stands in, and a note says so: a level that is not
 * available is different from a missing explanation.
 */
export function LevelText({
  content,
  level,
  className = 'prose-ij',
  fallbackStyle = 'note',
}: {
  content: LeveledText;
  level: ExplanationLevel;
  className?: string;
  /** "note" explains the fallback in a sentence; "tag" marks it with a short label (for long lists). */
  fallbackStyle?: 'note' | 'tag';
}) {
  const resolved = textAtLevel(content, level);
  return (
    <>
      {resolved.fallback &&
        (fallbackStyle === 'note' ? (
          <p className="mb-2 rounded-md border border-ink-600 bg-ink-850 px-3 py-2 text-[13px] text-fg-muted">
            The developer explanation for this has not been written yet, so the deep dive is shown
            instead.
          </p>
        ) : (
          <p className="mb-1 text-[12px] text-fg-subtle">
            Deep dive shown: no developer version yet
          </p>
        ))}
      <RichText className={className} text={resolved.text} />
    </>
  );
}
