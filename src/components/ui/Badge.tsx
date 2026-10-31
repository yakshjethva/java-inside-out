import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'exec' | 'rt' | 'ok' | 'warn' | 'plat';

const tones: Record<BadgeTone, string> = {
  neutral: 'border-ink-500 text-fg-muted bg-ink-800',
  exec: 'border-exec-500/50 text-exec-200 bg-exec-900/60',
  rt: 'border-rt-500/50 text-rt-200 bg-rt-900/60',
  ok: 'border-ok-500/50 text-ok-300 bg-ok-900/60',
  warn: 'border-warn-500/50 text-warn-300 bg-warn-900/60',
  plat: 'border-plat-500/50 text-[#bfd8d3] bg-[#0d2220]',
};

export function Badge({
  tone = 'neutral',
  dashed,
  className,
  children,
  title,
}: {
  tone?: BadgeTone;
  dashed?: boolean;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-[1px] text-[12px] leading-[1.5] font-medium',
        dashed && 'border-dashed',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
