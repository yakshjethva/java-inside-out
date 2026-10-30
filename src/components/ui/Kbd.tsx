import type { ReactNode } from 'react';

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.5em] items-center justify-center rounded border border-ink-500 border-b-2 bg-ink-800 px-1 font-mono text-[11px] leading-[1.5] text-fg-muted">
      {children}
    </kbd>
  );
}
