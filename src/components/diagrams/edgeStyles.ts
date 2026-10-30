import type { RelationshipKind } from '@/types/content';

/** Visual grammar for connectors: colour is always paired with a line style and arrowhead. */
export const EDGE_STYLES: Record<
  RelationshipKind,
  { color: string; dash?: string; marker: string; label: string; description: string }
> = {
  control: {
    color: 'var(--color-exec-400)',
    marker: 'ij-arrow-control',
    label: 'Control flow',
    description: 'solid line, filled arrow',
  },
  lifecycle: {
    color: 'var(--color-exec-300)',
    marker: 'ij-arrow-lifecycle',
    label: 'Lifecycle order',
    description: 'solid line, filled arrow',
  },
  data: {
    color: 'var(--color-idle-300)',
    dash: '5 4',
    marker: 'ij-arrow-data',
    label: 'Data / creates / reads',
    description: 'dashed line, open arrow',
  },
  delegation: {
    color: 'var(--color-rt-400)',
    dash: '1.5 3.5',
    marker: 'ij-arrow-delegation',
    label: 'Delegation',
    description: 'dotted line, filled arrow',
  },
  exception: {
    color: 'var(--color-warn-400)',
    dash: '9 3 2 3',
    marker: 'ij-arrow-exception',
    label: 'Exceptional path',
    description: 'dash-dot line, filled arrow',
  },
  native: {
    color: 'var(--color-plat-400)',
    dash: '3 3',
    marker: 'ij-arrow-native',
    label: 'Native / OS boundary',
    description: 'short dashes, filled arrow',
  },
};
