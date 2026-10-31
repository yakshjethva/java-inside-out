/**
 * A teaching model of reachability, the rule every tracing garbage collector
 * applies (JLS §12.6): an object stays alive while a chain of references from
 * a GC root (here, local variables of a running method) leads to it.
 *
 * It keeps three states apart on purpose:
 *  - reachable: some path from a root leads to the object;
 *  - unreachable, so eligible for collection: no path does, but the object is
 *    still in the heap;
 *  - reclaimed: a collection has run and freed it. When that happens is up to
 *    the collector, not to the program.
 */

export interface RootVariable {
  id: string;
  /** Object the variable refers to, or null. A variable holds one reference at a time. */
  target: string | null;
}

export interface HeapObject {
  id: string;
  label: string;
}

export interface ObjectReference {
  from: string;
  to: string;
}

export interface Heap {
  roots: RootVariable[];
  objects: HeapObject[];
  references: ObjectReference[];
  /** Objects freed by the most recent collection. */
  reclaimed: string[];
}

export function createHeap(rootIds: string[]): Heap {
  return {
    roots: rootIds.map((id) => ({ id, target: null })),
    objects: [],
    references: [],
    reclaimed: [],
  };
}

/** Allocates an object and stores a reference to it in a variable or in another object. */
export function newObject(
  heap: Heap,
  id: string,
  label: string,
  referencedBy: { root: string } | { object: string },
): Heap {
  const withObject = { ...heap, objects: [...heap.objects, { id, label }] };
  return 'root' in referencedBy
    ? assignRoot(withObject, referencedBy.root, id)
    : addReference(withObject, referencedBy.object, id);
}

export function assignRoot(heap: Heap, rootId: string, target: string | null): Heap {
  return {
    ...heap,
    roots: heap.roots.map((root) => (root.id === rootId ? { ...root, target } : root)),
  };
}

export const clearRoot = (heap: Heap, rootId: string): Heap => assignRoot(heap, rootId, null);

export function addReference(heap: Heap, from: string, to: string): Heap {
  if (heap.references.some((ref) => ref.from === from && ref.to === to)) return heap;
  return { ...heap, references: [...heap.references, { from, to }] };
}

export function removeReference(heap: Heap, from: string, to: string): Heap {
  return {
    ...heap,
    references: heap.references.filter((ref) => !(ref.from === from && ref.to === to)),
  };
}

/** Every object a chain of references from a root reaches (a graph traversal from the roots). */
export function reachableIds(heap: Heap): Set<string> {
  const reached = new Set<string>();
  const pending = heap.roots.flatMap((root) => (root.target ? [root.target] : []));
  while (pending.length > 0) {
    const id = pending.pop()!;
    if (reached.has(id)) continue;
    reached.add(id);
    for (const ref of heap.references) if (ref.from === id) pending.push(ref.to);
  }
  return reached;
}

export const isReachable = (heap: Heap, id: string) => reachableIds(heap).has(id);

/** Runs a collection: unreachable objects, and the references they held, are freed. */
export function collect(heap: Heap): Heap {
  const live = reachableIds(heap);
  return {
    roots: heap.roots,
    objects: heap.objects.filter((object) => live.has(object.id)),
    references: heap.references.filter((ref) => live.has(ref.from)),
    reclaimed: heap.objects.filter((object) => !live.has(object.id)).map((object) => object.id),
  };
}
