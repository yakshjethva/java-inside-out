import { center, type Rect } from './geometry';

export interface ExplodeOptions {
  /** Factor applied to every child's offset from its parent's centre. */
  spread: number;
  /** Vertical gap between root groups after explosion. */
  rootGap: number;
}

/**
 * Computes an "exploded view" of a nested layout: every child is pushed away
 * from its parent's centre by `spread`, containers grow to keep their original
 * margins around the separated children, and root groups are re-stacked
 * vertically so they cannot overlap. Leaves keep their size.
 */
export function explodeLayout<Id extends string>(
  rects: Record<Id, Rect>,
  childrenOf: (id: Id | undefined) => Id[],
  options: ExplodeOptions,
): Record<Id, Rect> {
  const local = new Map<Id, { dx: number; dy: number; w: number; h: number }>();

  // Bottom-up: exploded size of each node, and children's offsets relative to the parent's centre.
  const measure = (id: Id): { w: number; h: number } => {
    const rect = rects[id];
    const kids = childrenOf(id);
    if (kids.length === 0) return { w: rect.w, h: rect.h };

    const pc = center(rect);
    const marginLeft = Math.min(...kids.map((k) => rects[k].x - rect.x));
    const marginTop = Math.min(...kids.map((k) => rects[k].y - rect.y));
    const marginRight = Math.min(...kids.map((k) => rect.x + rect.w - (rects[k].x + rects[k].w)));
    const marginBottom = Math.min(...kids.map((k) => rect.y + rect.h - (rects[k].y + rects[k].h)));

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const kid of kids) {
      const size = measure(kid);
      const kc = center(rects[kid]);
      const dx = (kc.x - pc.x) * options.spread;
      const dy = (kc.y - pc.y) * options.spread;
      local.set(kid, { dx, dy, w: size.w, h: size.h });
      minX = Math.min(minX, dx - size.w / 2);
      maxX = Math.max(maxX, dx + size.w / 2);
      minY = Math.min(minY, dy - size.h / 2);
      maxY = Math.max(maxY, dy + size.h / 2);
    }
    const left = minX - marginLeft;
    const right = maxX + marginRight;
    const top = minY - marginTop;
    const bottom = maxY + marginBottom;
    // Children offsets are relative to the old centre; re-centre on the new box.
    const shiftX = (left + right) / 2;
    const shiftY = (top + bottom) / 2;
    for (const kid of kids) {
      const entry = local.get(kid)!;
      entry.dx -= shiftX;
      entry.dy -= shiftY;
    }
    return { w: right - left, h: bottom - top };
  };

  const out = {} as Record<Id, Rect>;

  const place = (id: Id, cx: number, cy: number, size: { w: number; h: number }) => {
    out[id] = { x: cx - size.w / 2, y: cy - size.h / 2, w: size.w, h: size.h };
    for (const kid of childrenOf(id)) {
      const entry = local.get(kid)!;
      place(kid, cx + entry.dx, cy + entry.dy, { w: entry.w, h: entry.h });
    }
  };

  // Roots keep their left edge and are re-stacked vertically in their original order.
  const roots = [...childrenOf(undefined)].sort((a, b) => rects[a].y - rects[b].y);
  let cursor = Math.min(...roots.map((r) => rects[r].y));
  for (const root of roots) {
    const size = measure(root);
    place(root, rects[root].x + size.w / 2, cursor + size.h / 2, size);
    cursor += size.h + options.rootGap;
  }

  return out;
}
