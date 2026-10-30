/** Level of detail: what a diagram should draw at the current zoom. */
export type Lod = 'overview' | 'normal' | 'detail';

/** Zoom thresholds (screen pixels per diagram unit). */
export const lodFor = (k: number): Lod => (k < 0.42 ? 'overview' : k < 0.8 ? 'normal' : 'detail');
