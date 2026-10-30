import { describe, expect, it } from 'vitest';
import {
  anchorPoint,
  autoAnchors,
  fitTransform,
  labelPoint,
  orthogonalRoute,
  roundedPath,
  simplify,
  unionRect,
  zoomAt,
  type Point,
} from '@/lib/geometry';

const isOrthogonal = (points: Point[]) =>
  points.every((p, i) => i === 0 || p.x === points[i - 1]!.x || p.y === points[i - 1]!.y);

describe('anchors', () => {
  const r = { x: 10, y: 20, w: 100, h: 40 };
  it('places anchors on the requested side', () => {
    expect(anchorPoint(r, { side: 'top' })).toEqual({ x: 60, y: 20 });
    expect(anchorPoint(r, { side: 'right', at: 0.25 })).toEqual({ x: 110, y: 30 });
    expect(anchorPoint(r, { side: 'bottom', at: 0 })).toEqual({ x: 10, y: 60 });
    expect(anchorPoint(r, { side: 'left', at: 1 })).toEqual({ x: 10, y: 60 });
  });

  it('chooses facing sides automatically', () => {
    expect(autoAnchors({ x: 0, y: 0, w: 10, h: 10 }, { x: 100, y: 0, w: 10, h: 10 })).toEqual([
      { side: 'right' },
      { side: 'left' },
    ]);
    expect(autoAnchors({ x: 0, y: 100, w: 10, h: 10 }, { x: 0, y: 0, w: 10, h: 10 })).toEqual([
      { side: 'top' },
      { side: 'bottom' },
    ]);
  });
});

describe('orthogonalRoute', () => {
  it('routes every combination of sides with horizontal and vertical segments only', () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    for (const a of sides) {
      for (const b of sides) {
        const points = orthogonalRoute({ x: 0, y: 0 }, a, { x: 37, y: 91 }, b);
        expect(isOrthogonal(points)).toBe(true);
        expect(points[0]).toEqual({ x: 0, y: 0 });
        expect(points.at(-1)).toEqual({ x: 37, y: 91 });
      }
    }
  });

  it('inserts elbows between diagonal via points', () => {
    const points = orthogonalRoute({ x: 0, y: 0 }, 'right', { x: 100, y: 100 }, 'left', [
      { x: 50, y: 40 },
    ]);
    expect(isOrthogonal(points)).toBe(true);
  });

  it('simplifies duplicate and collinear points', () => {
    expect(
      simplify([
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 5 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 5 },
    ]);
  });

  it('draws rounded paths that start and end at the endpoints', () => {
    const d = roundedPath([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
    ]);
    expect(d.startsWith('M 0 0')).toBe(true);
    expect(d.endsWith('L 50 50')).toBe(true);
    expect(d).toContain('Q 50 0');
  });

  it('places labels on the longest segment', () => {
    expect(
      labelPoint([
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 100 },
      ]),
    ).toEqual({ x: 10, y: 50, horizontal: false });
  });
});

describe('camera maths', () => {
  it('fits a rectangle into the viewport, centred', () => {
    const t = fitTransform({ x: 0, y: 0, w: 1600, h: 1100 }, { w: 800, h: 800 }, 0);
    expect(t.k).toBeCloseTo(0.5);
    expect(t.x).toBeCloseTo(0);
    expect(t.y).toBeCloseTo(400 - 550 * 0.5);
  });

  it('keeps the focus point fixed while zooming and respects limits', () => {
    const t = { x: 10, y: 20, k: 1 };
    const focus = { x: 300, y: 200 };
    const z = zoomAt(t, 2, focus);
    // The diagram point under the focus is unchanged.
    expect((focus.x - z.x) / z.k).toBeCloseTo((focus.x - t.x) / t.k);
    expect((focus.y - z.y) / z.k).toBeCloseTo((focus.y - t.y) / t.k);
    expect(zoomAt(t, 100, focus, { min: 0.1, max: 4 }).k).toBe(4);
  });

  it('unions rectangles', () => {
    expect(unionRect([])).toBeUndefined();
    expect(
      unionRect([
        { x: 0, y: 0, w: 10, h: 10 },
        { x: 5, y: -5, w: 10, h: 5 },
      ]),
    ).toEqual({ x: 0, y: -5, w: 15, h: 15 });
  });
});
