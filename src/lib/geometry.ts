export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface Anchor {
  side: Side;
  /** Position along the side, 0..1 (default 0.5). */
  at?: number;
}

/** Pan/zoom transform: screen = diagram * k + (x, y). */
export interface ViewTransform {
  x: number;
  y: number;
  k: number;
}

export const center = (r: Rect): Point => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

export const isHorizontalSide = (side: Side) => side === 'left' || side === 'right';

export function anchorPoint(r: Rect, anchor: Anchor): Point {
  const t = anchor.at ?? 0.5;
  switch (anchor.side) {
    case 'top':
      return { x: r.x + r.w * t, y: r.y };
    case 'bottom':
      return { x: r.x + r.w * t, y: r.y + r.h };
    case 'left':
      return { x: r.x, y: r.y + r.h * t };
    case 'right':
      return { x: r.x + r.w, y: r.y + r.h * t };
  }
}

/** Picks facing sides for an automatic connector between two rectangles. */
export function autoAnchors(a: Rect, b: Rect): [Anchor, Anchor] {
  const ca = center(a);
  const cb = center(b);
  const gapX = cb.x > ca.x ? b.x - (a.x + a.w) : a.x - (b.x + b.w);
  const gapY = cb.y > ca.y ? b.y - (a.y + a.h) : a.y - (b.y + b.h);
  if (gapX >= gapY) {
    return cb.x >= ca.x
      ? [{ side: 'right' }, { side: 'left' }]
      : [{ side: 'left' }, { side: 'right' }];
  }
  return cb.y >= ca.y
    ? [{ side: 'bottom' }, { side: 'top' }]
    : [{ side: 'top' }, { side: 'bottom' }];
}

/**
 * Builds an orthogonal polyline from `start` (leaving `startSide`) through
 * optional `via` corners to `end` (entering `endSide`). Missing elbows are
 * inserted so every segment is horizontal or vertical.
 */
export function orthogonalRoute(
  start: Point,
  startSide: Side,
  end: Point,
  endSide: Side,
  via: Point[] = [],
): Point[] {
  if (via.length === 0) {
    const h0 = isHorizontalSide(startSide);
    const h1 = isHorizontalSide(endSide);
    if (h0 && h1) {
      if (start.y === end.y) return [start, end];
      const mx = (start.x + end.x) / 2;
      return [start, { x: mx, y: start.y }, { x: mx, y: end.y }, end];
    }
    if (!h0 && !h1) {
      if (start.x === end.x) return [start, end];
      const my = (start.y + end.y) / 2;
      return [start, { x: start.x, y: my }, { x: end.x, y: my }, end];
    }
    if (h0) return [start, { x: end.x, y: start.y }, end];
    return [start, { x: start.x, y: end.y }, end];
  }

  const targets = [...via, end];
  const points: Point[] = [start];
  let horizontal = isHorizontalSide(startSide);
  for (const q of targets) {
    const p = points[points.length - 1]!;
    if (p.x !== q.x && p.y !== q.y) {
      points.push(horizontal ? { x: q.x, y: p.y } : { x: p.x, y: q.y });
    }
    points.push(q);
    const a = points[points.length - 2]!;
    const b = points[points.length - 1]!;
    horizontal = a.y !== b.y;
  }
  return simplify(points);
}

/** Removes duplicate and collinear interior points. */
export function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && last.x === p.x && last.y === p.y) continue;
    out.push(p);
    while (out.length >= 3) {
      const [a, b, c] = out.slice(-3) as [Point, Point, Point];
      const collinear = (a.x === b.x && b.x === c.x) || (a.y === b.y && b.y === c.y);
      if (!collinear) break;
      out.splice(out.length - 2, 1);
    }
  }
  return out;
}

/** SVG path for a polyline with rounded corners. */
export function roundedPath(points: Point[], radius = 8): string {
  if (points.length === 0) return '';
  const first = points[0]!;
  let d = `M ${fmt(first.x)} ${fmt(first.y)}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    const prev = points[i - 1]!;
    const next = points[i + 1];
    if (!next) {
      d += ` L ${fmt(p.x)} ${fmt(p.y)}`;
      break;
    }
    const inLen = Math.hypot(p.x - prev.x, p.y - prev.y);
    const outLen = Math.hypot(next.x - p.x, next.y - p.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inDir = { x: (p.x - prev.x) / (inLen || 1), y: (p.y - prev.y) / (inLen || 1) };
    const outDir = { x: (next.x - p.x) / (outLen || 1), y: (next.y - p.y) / (outLen || 1) };
    const a = { x: p.x - inDir.x * r, y: p.y - inDir.y * r };
    const b = { x: p.x + outDir.x * r, y: p.y + outDir.y * r };
    d += ` L ${fmt(a.x)} ${fmt(a.y)} Q ${fmt(p.x)} ${fmt(p.y)} ${fmt(b.x)} ${fmt(b.y)}`;
  }
  return d;
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

export function polylineLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  }
  return total;
}

/** Midpoint of the longest segment: a stable place for a connector label. */
export function labelPoint(points: Point[]): Point & { horizontal: boolean } {
  let best = { x: 0, y: 0, horizontal: true };
  let bestLen = -1;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len > bestLen) {
      bestLen = len;
      best = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, horizontal: a.y === b.y };
    }
  }
  return best;
}

export function unionRect(rects: Rect[]): Rect | undefined {
  if (rects.length === 0) return undefined;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const r of rects) {
    x0 = Math.min(x0, r.x);
    y0 = Math.min(y0, r.y);
    x1 = Math.max(x1, r.x + r.w);
    y1 = Math.max(y1, r.y + r.h);
  }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

export function inflate(r: Rect, by: number): Rect {
  return { x: r.x - by, y: r.y - by, w: r.w + by * 2, h: r.h + by * 2 };
}

export function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Transform that fits `target` (diagram units) into a viewport (pixels). */
export function fitTransform(
  target: Rect,
  viewport: { w: number; h: number },
  padding = 24,
  limits: { min: number; max: number } = { min: 0.1, max: 4 },
): ViewTransform {
  const availW = Math.max(1, viewport.w - padding * 2);
  const availH = Math.max(1, viewport.h - padding * 2);
  const k = clamp(Math.min(availW / target.w, availH / target.h), limits.min, limits.max);
  return {
    k,
    x: viewport.w / 2 - (target.x + target.w / 2) * k,
    y: viewport.h / 2 - (target.y + target.h / 2) * k,
  };
}

/** Zooms by `factor` keeping the screen point `focus` fixed. */
export function zoomAt(
  t: ViewTransform,
  factor: number,
  focus: Point,
  limits: { min: number; max: number } = { min: 0.1, max: 4 },
): ViewTransform {
  const k = clamp(t.k * factor, limits.min, limits.max);
  const applied = k / t.k;
  return {
    k,
    x: focus.x - (focus.x - t.x) * applied,
    y: focus.y - (focus.y - t.y) * applied,
  };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpTransform(a: ViewTransform, b: ViewTransform, t: number): ViewTransform {
  // Interpolate scale geometrically so zooming feels uniform.
  const k = a.k * Math.pow(b.k / a.k, t);
  return { k, x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}
