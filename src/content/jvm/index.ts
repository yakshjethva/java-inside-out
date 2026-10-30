import type { ComponentDoc } from '@/types/content';
import { classLoadingComponents } from './components/classLoading';
import { executionComponents } from './components/execution';
import { gcComponents } from './components/gc';
import { nativePlatformComponents } from './components/nativePlatform';
import { processComponents } from './components/process';
import { runtimeDataComponents } from './components/runtimeData';
import { COMPONENT_IDS, type ComponentId } from './ids';

const ALL: ComponentDoc[] = [
  ...processComponents,
  ...classLoadingComponents,
  ...runtimeDataComponents,
  ...executionComponents,
  ...gcComponents,
  ...nativePlatformComponents,
];

export const COMPONENTS = Object.fromEntries(ALL.map((doc) => [doc.id, doc])) as Record<
  ComponentId,
  ComponentDoc
>;

/** Components in canonical (inventory) order. */
export const COMPONENT_LIST: ComponentDoc[] = COMPONENT_IDS.map((id) => COMPONENTS[id]).filter(
  (doc): doc is ComponentDoc => Boolean(doc),
);

export function getComponentDoc(id: ComponentId): ComponentDoc {
  return COMPONENTS[id];
}

export function childrenOf(id: ComponentId | undefined): ComponentDoc[] {
  return COMPONENT_LIST.filter((doc) => doc.parent === id);
}

/** Root first, the component itself last. */
export function ancestry(id: ComponentId): ComponentDoc[] {
  const chain: ComponentDoc[] = [];
  let current: ComponentDoc | undefined = COMPONENTS[id];
  while (current) {
    chain.unshift(current);
    current = current.parent ? COMPONENTS[current.parent] : undefined;
  }
  return chain;
}

export function isAncestor(ancestor: ComponentId, id: ComponentId): boolean {
  let current = COMPONENTS[id]?.parent;
  while (current) {
    if (current === ancestor) return true;
    current = COMPONENTS[current]?.parent;
  }
  return false;
}

/** Number of components below `id` (all depths). */
export function descendantCount(id: ComponentId): number {
  return childrenOf(id).reduce((total, child) => total + 1 + descendantCount(child.id), 0);
}

export const ROOT_COMPONENTS: ComponentId[] = ['build-time', 'java-process', 'platform'];

export { COMPONENT_IDS, isComponentId, type ComponentId } from './ids';
