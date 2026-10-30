import { describe, expect, it } from 'vitest';
import { childrenOf, COMPONENT_IDS, type ComponentId } from '@/content/jvm';
import { contains, type Rect } from '@/lib/geometry';
import { NODE_RECTS } from '@/modules/jvm/layout';
import { explodedRects } from '@/modules/jvm/scene';

const overlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe('exploded layout', () => {
  const rects = explodedRects();

  it('keeps every leaf the same size and every child inside its parent', () => {
    for (const id of COMPONENT_IDS) {
      const kids = childrenOf(id);
      if (kids.length === 0) {
        expect(rects[id].w).toBeCloseTo(NODE_RECTS[id].w);
        expect(rects[id].h).toBeCloseTo(NODE_RECTS[id].h);
      }
      for (const kid of kids)
        expect(contains(rects[id], rects[kid.id]), `${kid.id} inside ${id}`).toBe(true);
    }
  });

  it('never overlaps siblings', () => {
    const groups: (ComponentId | undefined)[] = [undefined, ...COMPONENT_IDS];
    for (const parent of groups) {
      const kids = childrenOf(parent);
      for (let i = 0; i < kids.length; i++)
        for (let j = i + 1; j < kids.length; j++)
          expect(
            overlap(rects[kids[i]!.id], rects[kids[j]!.id]),
            `${kids[i]!.id} / ${kids[j]!.id}`,
          ).toBe(false);
    }
  });

  it('spreads parts further apart than the anatomy layout', () => {
    const anatomyGap = NODE_RECTS.marking.x - (NODE_RECTS['gc-roots'].x + NODE_RECTS['gc-roots'].w);
    const explodedGap = rects.marking.x - (rects['gc-roots'].x + rects['gc-roots'].w);
    expect(explodedGap).toBeGreaterThan(anatomyGap);
  });
});
