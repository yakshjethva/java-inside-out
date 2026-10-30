import { COMPONENTS, type ComponentId } from '@/content/jvm';
import { codeCacheDissection, interpreterDissection, jitDissection } from './plates/engine';
import { heapDissection } from './plates/heap';
import { methodAreaDissection, rcpDissection } from './plates/metadata';
import { classLoaderDissection, gcDissection, jniDissection } from './plates/runtime';
import { frameDissection, pcDissection, stackDissection } from './plates/stacks';
import type { Dissection } from './types';

const LIST: Dissection[] = [
  classLoaderDissection,
  methodAreaDissection,
  rcpDissection,
  heapDissection,
  stackDissection,
  frameDissection,
  pcDissection,
  interpreterDissection,
  jitDissection,
  codeCacheDissection,
  gcDissection,
  jniDissection,
];

/** Hand-drawn dissections, keyed by the component they dissect. */
export const DISSECTIONS: Partial<Record<ComponentId, Dissection>> = Object.fromEntries(
  LIST.map((dissection) => [dissection.id, dissection]),
);

/** The dissection for a component: its own, or none (the generated focus view is used). */
export function dissectionFor(id: ComponentId): Dissection | undefined {
  return DISSECTIONS[id];
}

/** Nearest ancestor-or-self with a hand-drawn dissection. */
export function nearestDissection(id: ComponentId): Dissection | undefined {
  let current: ComponentId | undefined = id;
  while (current) {
    const found = DISSECTIONS[current];
    if (found) return found;
    current = COMPONENTS[current].parent;
  }
  return undefined;
}
