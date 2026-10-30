import type { Provenance } from '@/types/content';

/** Colour family of a diagram node; see the colour semantics in src/styles/index.css. */
export type NodeFamily = 'exec' | 'rt' | 'plat' | 'warn';

export const FAMILY_COLORS: Record<
  NodeFamily,
  { stroke: string; bright: string; tint: string; text: string }
> = {
  exec: {
    stroke: 'var(--color-exec-500)',
    bright: 'var(--color-exec-300)',
    tint: 'rgb(79 155 245 / 0.075)',
    text: 'var(--color-exec-200)',
  },
  rt: {
    stroke: 'var(--color-rt-500)',
    bright: 'var(--color-rt-300)',
    tint: 'rgb(148 121 242 / 0.075)',
    text: 'var(--color-rt-200)',
  },
  plat: {
    stroke: 'var(--color-plat-500)',
    bright: 'var(--color-plat-400)',
    tint: 'rgb(95 138 131 / 0.07)',
    text: '#c4dcd7',
  },
  warn: {
    stroke: 'var(--color-warn-500)',
    bright: 'var(--color-warn-300)',
    tint: 'rgb(242 140 40 / 0.08)',
    text: 'var(--color-warn-300)',
  },
};

export const PROVENANCE_DASH: Record<Provenance, string | undefined> = {
  spec: undefined,
  hotspot: '6 3.5',
  platform: '1.2 3.4',
};
