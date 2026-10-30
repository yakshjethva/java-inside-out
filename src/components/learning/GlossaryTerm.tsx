import { BookOpen, Crosshair, X } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { getGlossaryEntry } from '@/glossary';
import { getComponentDoc } from '@/content/jvm';
import { usePreferences } from '@/hooks/useLearningState';
import { Popover } from './Popover';
import { RichText } from './RichText';

/**
 * A clickable technical term. Opens a contextual explanation without leaving
 * the page, at the learner's chosen explanation level.
 */
export function GlossaryTerm({ id, label }: { id: string; label?: string }) {
  const entry = getGlossaryEntry(id);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(id);

  if (!entry) {
    return <span>{label ?? id}</span>;
  }

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setCurrentId(id);
          setOpen((value) => !value);
        }}
        className="cursor-help rounded-[2px] text-inherit underline decoration-rt-400/70 decoration-dotted decoration-[1.5px] underline-offset-[3px] hover:text-rt-200 hover:decoration-rt-300"
      >
        {label ?? entry.term}
      </button>
      <Popover anchor={anchor} open={open} onClose={() => setOpen(false)} labelledBy={`${id}-term`}>
        <GlossaryCard
          termId={currentId}
          titleId={`${id}-term`}
          onNavigate={setCurrentId}
          onClose={() => setOpen(false)}
        />
      </Popover>
    </>
  );
}

function GlossaryCard({
  termId,
  titleId,
  onNavigate,
  onClose,
}: {
  termId: string;
  titleId: string;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const entry = getGlossaryEntry(termId);
  const { preferences, setLevel } = usePreferences();
  const levelId = useId();
  if (!entry) return null;
  const component = entry.componentId ? getComponentDoc(entry.componentId) : undefined;
  const technical = preferences.level === 'technical';

  return (
    <div className="p-4 text-[14px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kicker">Glossary</p>
          <h2 id={titleId} className="mt-0.5 font-serif text-[20px] leading-tight text-fg">
            {entry.term}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close explanation"
          className="rounded p-1 text-fg-subtle hover:bg-ink-700 hover:text-fg"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2" role="group" aria-labelledby={levelId}>
        <span id={levelId} className="sr-only">
          Explanation level
        </span>
        {(['beginner', 'technical'] as const).map((level) => (
          <button
            key={level}
            type="button"
            aria-pressed={preferences.level === level}
            onClick={() => setLevel(level)}
            className={
              preferences.level === level
                ? 'rounded border border-exec-500/60 bg-exec-900/70 px-2 py-0.5 text-[12px] text-exec-200'
                : 'rounded border border-ink-600 px-2 py-0.5 text-[12px] text-fg-subtle hover:text-fg'
            }
          >
            {level === 'beginner' ? 'Beginner' : 'Technical'}
          </button>
        ))}
      </div>

      <RichText
        className="prose-ij mt-3 text-[14px]"
        text={technical ? entry.technical : entry.beginner}
      />

      {technical && (
        <div className="mt-3 border-t border-ink-600 pt-3">
          <p className="kicker">Why it exists</p>
          <RichText className="prose-ij mt-1 text-[13.5px]" text={entry.whyItExists} />
        </div>
      )}

      {entry.misconception && (
        <div className="mt-3 rounded-md border border-warn-500/30 bg-warn-900/30 p-2.5">
          <p className="text-[12.5px] text-warn-300">
            <span aria-hidden>⚠ </span>
            <span className="font-medium">Misconception:</span> {entry.misconception.myth}
          </p>
          <RichText className="prose-ij mt-1 text-[13px]" text={entry.misconception.truth} />
        </div>
      )}

      {entry.related && entry.related.length > 0 && (
        <div className="mt-3">
          <p className="kicker">Related</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {entry.related.map((relatedId) => {
              const related = getGlossaryEntry(relatedId);
              if (!related) return null;
              return (
                <li key={relatedId}>
                  <button
                    type="button"
                    onClick={() => onNavigate(relatedId)}
                    className="rounded border border-ink-600 bg-ink-800 px-2 py-0.5 text-[12.5px] text-fg-muted hover:border-rt-500/60 hover:text-rt-200"
                  >
                    {related.term}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-600 pt-3 text-[12.5px]">
        <Link
          to={`/glossary#${entry.id}`}
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-exec-300 hover:bg-ink-700"
        >
          <BookOpen size={14} aria-hidden /> Open in glossary
        </Link>
        {component && (
          <Link
            to={`/anatomy?c=${component.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-exec-300 hover:bg-ink-700"
          >
            <Crosshair size={14} aria-hidden /> Show {component.name} in the anatomy
          </Link>
        )}
      </div>
    </div>
  );
}
