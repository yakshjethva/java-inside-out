import { describe, expect, it } from 'vitest';
import { helloClassSize, modifiedUtf8Length, sanitizeMessage } from '@/simulators/journey';
import { stepDuration } from '@/simulators/playback';
import {
  addReference,
  assignRoot,
  clearRoot,
  collect,
  createHeap,
  isReachable,
  newObject,
  removeReference,
  reachableIds,
} from '@/simulators/reachability';
import { callMethod, INITIAL_TIERING } from '@/simulators/tiering';

describe('journey: Hello.class', () => {
  // Sizes measured with javac 25.0.4 on Hello.java with the message substituted.
  it.each([
    ['Hello!', 410],
    ['A', 405],
    ['Hello, world', 416],
    ['Hi from Mia', 415],
    ['Ünïcode', 413],
    ['Hi 👋', 413],
    ['', 404],
  ])('a class printing %j is %i bytes', (message, size) => {
    expect(helloClassSize(message)).toBe(size);
  });

  it('counts characters the way class files store them (modified UTF-8)', () => {
    expect(modifiedUtf8Length('abc')).toBe(3);
    expect(modifiedUtf8Length('é')).toBe(2);
    expect(modifiedUtf8Length('€')).toBe(3);
    expect(modifiedUtf8Length('👋')).toBe(6);
    expect(modifiedUtf8Length('\u0000')).toBe(2);
  });

  it('keeps messages that are valid inside a Java string literal', () => {
    expect(sanitizeMessage('Say "hi" \\ now')).toBe('Say hi  now');
    expect(sanitizeMessage('tab\there')).toBe('tabhere');
    expect(sanitizeMessage('x'.repeat(50))).toHaveLength(32);
    expect([...sanitizeMessage('👋'.repeat(40))]).toHaveLength(32);
  });
});

describe('playback timing', () => {
  it('uses the timeline’s own step length when one is given', () => {
    expect(stepDuration(1)).toBe(4200);
    expect(stepDuration(2, 1600)).toBe(800);
  });
});

describe('tiering: a method becoming hot', () => {
  it('starts in the interpreter', () => {
    expect(INITIAL_TIERING).toMatchObject({ calls: 0, tier: 0, events: [] });
    expect(callMethod(INITIAL_TIERING, 199).tier).toBe(0);
  });

  it('is compiled by C1 with profiling after about 200 calls', () => {
    const state = callMethod(INITIAL_TIERING, 200);
    expect(state.tier).toBe(3);
    expect(state.events.map((e) => e.kind)).toEqual(['tier3']);
    expect(state.events[0]!.atCall).toBe(200);
  });

  it('is compiled by C2 after about 5,000 calls in its C1 code', () => {
    expect(callMethod(INITIAL_TIERING, 5_199).tier).toBe(3);
    const state = callMethod(INITIAL_TIERING, 5_200);
    expect(state.tier).toBe(4);
    expect(state.events.map((e) => e.kind)).toEqual(['tier3', 'tier4', 'retired']);
  });

  it('reaches the same state in one big batch or many small ones', () => {
    let small = INITIAL_TIERING;
    for (let i = 0; i < 100; i++) small = callMethod(small, 100);
    const big = callMethod(INITIAL_TIERING, 10_000);
    expect(small).toEqual(big);
  });
});

describe('reachability: what the garbage collector may reclaim', () => {
  const start = () => {
    let heap = createHeap(['person', 'other']);
    heap = newObject(heap, 'p', 'Person "Mia"', { root: 'person' });
    heap = newObject(heap, 's', 'String "Mia"', { object: 'p' });
    return heap;
  };

  it('treats objects reached from a root, directly or through other objects, as reachable', () => {
    const heap = start();
    expect(reachableIds(heap)).toEqual(new Set(['p', 's']));
  });

  it('makes an object and everything only it references eligible when the last reference goes', () => {
    const heap = clearRoot(start(), 'person');
    expect(isReachable(heap, 'p')).toBe(false);
    expect(isReachable(heap, 's')).toBe(false);
    // Eligible is not reclaimed: the objects are still in the heap.
    expect(heap.objects.map((o) => o.id)).toEqual(['p', 's']);
  });

  it('keeps an object alive while any path from a root reaches it', () => {
    let heap = assignRoot(start(), 'other', 's');
    heap = clearRoot(heap, 'person');
    expect(isReachable(heap, 'p')).toBe(false);
    expect(isReachable(heap, 's')).toBe(true);
  });

  it('collects unreachable cycles: references between garbage objects do not keep them alive', () => {
    let heap = start();
    heap = addReference(heap, 's', 'p');
    heap = clearRoot(heap, 'person');
    expect(reachableIds(heap)).toEqual(new Set());
    const after = collect(heap);
    expect(after.objects).toEqual([]);
    expect(after.references).toEqual([]);
    expect(after.reclaimed).toEqual(['p', 's']);
  });

  it('reclaims only unreachable objects when a collection runs', () => {
    let heap = newObject(start(), 'q', 'Person "Ada"', { root: 'other' });
    heap = assignRoot(heap, 'other', 'p');
    const after = collect(heap);
    expect(after.objects.map((o) => o.id)).toEqual(['p', 's']);
    expect(after.reclaimed).toEqual(['q']);
  });

  it('lets a variable hold one reference at a time', () => {
    const heap = assignRoot(start(), 'person', 's');
    expect(heap.roots.find((r) => r.id === 'person')!.target).toBe('s');
    expect(isReachable(heap, 'p')).toBe(false);
  });

  it('removes a single reference between objects', () => {
    const heap = removeReference(start(), 'p', 's');
    expect(isReachable(heap, 's')).toBe(false);
    expect(isReachable(heap, 'p')).toBe(true);
  });
});
