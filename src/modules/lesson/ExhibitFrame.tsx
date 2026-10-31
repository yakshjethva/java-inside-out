import type { ReactNode } from 'react';
import { AccuracyNote } from '@/components/learning/AccuracyNote';
import { cn } from '@/lib/cn';

/**
 * The dark "exhibit case" that holds an interactive model of part of the JVM.
 * The caption is a live region: when the learner acts, it says what changed.
 * The accuracy note shares the figcaption but is not announced on every change.
 */
export function ExhibitFrame({
  title,
  children,
  caption,
  controls,
  note,
  className,
}: {
  title: string;
  children: ReactNode;
  /** What is happening now, in a sentence or two. Announced to screen readers. */
  caption?: ReactNode;
  controls?: ReactNode;
  /** What the model simplifies. */
  note?: string;
  className?: string;
}) {
  return (
    <figure aria-label={title} className={cn('exhibit p-3.5 sm:p-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="text-[13px] font-medium text-fg-muted">{title}</p>
        {controls}
      </div>
      <div className="mt-3">{children}</div>
      {/* One figcaption, last in the figure: the live caption, then the accuracy note. */}
      <figcaption className="mt-4 border-t border-ink-700 pt-3">
        <div aria-live="polite" className="min-h-[3em] text-[15px] leading-relaxed text-fg">
          {caption}
        </div>
        {note && <AccuracyNote compact text={note} className="mt-3 bg-ink-900/80" />}
      </figcaption>
    </figure>
  );
}
