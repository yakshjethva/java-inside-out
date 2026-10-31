import { Ruler } from 'lucide-react';
import { cn } from '@/lib/cn';
import { RichText } from './RichText';

/**
 * Visible statement of what a visualization simplifies. Required on every
 * diagram and simulation (see docs/IMPLEMENTATION_PLAN.md, accuracy policy).
 */
export function AccuracyNote({
  text,
  title = 'Accuracy note',
  className,
  compact,
}: {
  text: string;
  title?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <aside
      aria-label={title}
      className={cn(
        'rounded-md border border-dashed border-ink-500 bg-ink-850/70',
        compact ? 'p-2.5' : 'p-3.5',
        className,
      )}
    >
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-fg-muted">
        <Ruler size={13} aria-hidden className="text-exec-300" />
        {title}
      </p>
      <RichText
        className={cn('prose-ij mt-1.5', compact ? 'text-[13px]' : 'text-[13.5px]')}
        text={text}
      />
    </aside>
  );
}
