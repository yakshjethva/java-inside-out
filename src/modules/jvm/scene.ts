import { COMPONENT_IDS, COMPONENTS, childrenOf, isAncestor, type ComponentId } from '@/content/jvm';
import { RELATIONSHIPS } from '@/content/jvm/relationships';
import { explodeLayout } from '@/lib/explode';
import {
  anchorPoint,
  autoAnchors,
  inflate,
  orthogonalRoute,
  roundedPath,
  unionRect,
  type Point,
  type Rect,
} from '@/lib/geometry';
import type { ComponentDoc, Provenance, Relationship } from '@/types/content';
import { EDGE_ROUTES, NODE_RECTS, NODE_SHAPES, PLATE_NUMBERS, type NodeShape } from './layout';

export type DiagramMode = 'anatomy' | 'exploded';

/** Colour family; see the colour semantics in src/styles/index.css. */
export type Family = 'exec' | 'rt' | 'plat' | 'warn';

export interface SceneNode {
  id: ComponentId;
  doc: ComponentDoc;
  rect: Rect;
  depth: number;
  container: boolean;
  shape: NodeShape;
  family: Family;
  /** Item number in the parts list (exploded view). */
  part: number;
  plate?: string;
  /** Set when the node is collapsed: how many descendants are hidden. */
  collapsedCount?: number;
}

export interface SceneEdge {
  id: string;
  rel: Relationship;
  /** Visible endpoints (may be an ancestor when a container is collapsed). */
  from: ComponentId;
  to: ComponentId;
  points: Point[];
  d: string;
  remapped: boolean;
}

export interface Scene {
  nodes: SceneNode[];
  edges: SceneEdge[];
  rects: Record<ComponentId, Rect>;
  bounds: Rect;
}

export interface SceneOptions {
  mode: DiagramMode;
  collapsed: ReadonlySet<ComponentId>;
  hiddenProvenance: ReadonlySet<Provenance>;
}

export const PART_NUMBER = new Map(COMPONENT_IDS.map((id, index) => [id, index + 1]));

export function depthOf(id: ComponentId): number {
  let depth = 0;
  let current = COMPONENTS[id].parent;
  while (current) {
    depth += 1;
    current = COMPONENTS[current].parent;
  }
  return depth;
}

export function familyOf(id: ComponentId): Family {
  if (id === 'deoptimization') return 'warn';
  if (id === 'execution-engine' || isAncestor('execution-engine', id)) return 'exec';
  const doc = COMPONENTS[id];
  if (doc.provenance === 'platform' || id === 'class-file') return 'plat';
  return 'rt';
}

const childIds = (id: ComponentId | undefined) => childrenOf(id).map((doc) => doc.id);

let explodedCache: Record<ComponentId, Rect> | null = null;

/** Exploded-view rectangles (computed once; the layout is static). */
export function explodedRects(): Record<ComponentId, Rect> {
  explodedCache ??= explodeLayout(NODE_RECTS, childIds, { spread: 1.22, rootGap: 72 });
  return explodedCache;
}

function isHiddenByLayer(id: ComponentId, hidden: ReadonlySet<Provenance>): boolean {
  let current: ComponentId | undefined = id;
  while (current) {
    if (hidden.has(COMPONENTS[current].provenance)) return true;
    current = COMPONENTS[current].parent;
  }
  return false;
}

/** Nearest ancestor-or-self that is not inside a collapsed container. */
function visibleRepresentative(id: ComponentId, collapsed: ReadonlySet<ComponentId>): ComponentId {
  let representative = id;
  let current = COMPONENTS[id].parent;
  while (current) {
    if (collapsed.has(current)) representative = current;
    current = COMPONENTS[current].parent;
  }
  return representative;
}

export function buildScene({ mode, collapsed, hiddenProvenance }: SceneOptions): Scene {
  const rects = mode === 'exploded' ? explodedRects() : NODE_RECTS;

  const nodes: SceneNode[] = [];
  for (const id of COMPONENT_IDS) {
    if (isHiddenByLayer(id, hiddenProvenance)) continue;
    if (visibleRepresentative(id, collapsed) !== id) continue;
    const kids = childIds(id).filter((kid) => !isHiddenByLayer(kid, hiddenProvenance));
    const isCollapsed = collapsed.has(id) && kids.length > 0;
    nodes.push({
      id,
      doc: COMPONENTS[id],
      rect: rects[id],
      depth: depthOf(id),
      container: kids.length > 0 && !isCollapsed,
      shape: NODE_SHAPES[id] ?? 'box',
      family: familyOf(id),
      part: PART_NUMBER.get(id) ?? 0,
      plate: PLATE_NUMBERS[id],
      collapsedCount: isCollapsed ? countDescendants(id) : undefined,
    });
  }
  // Containers first (outermost to innermost), then leaves, so children paint on top.
  nodes.sort((a, b) => Number(b.container) - Number(a.container) || a.depth - b.depth);

  const visible = new Set(nodes.map((node) => node.id));
  const seen = new Set<string>();
  const edges: SceneEdge[] = [];
  for (const rel of RELATIONSHIPS) {
    if (isHiddenByLayer(rel.from, hiddenProvenance) || isHiddenByLayer(rel.to, hiddenProvenance))
      continue;
    const from = visibleRepresentative(rel.from, collapsed);
    const to = visibleRepresentative(rel.to, collapsed);
    if (from === to || !visible.has(from) || !visible.has(to)) continue;
    const remapped = from !== rel.from || to !== rel.to;
    const key = `${from}->${to}`;
    if (remapped && seen.has(key)) continue;
    seen.add(key);
    const points = routeEdge(rel.id, rects[from], rects[to], mode === 'anatomy' && !remapped);
    edges.push({ id: rel.id, rel, from, to, points, d: roundedPath(points, 7), remapped });
  }

  const roots = nodes.filter((node) => !COMPONENTS[node.id].parent).map((node) => node.rect);
  const bounds = inflate(unionRect(roots) ?? { x: 0, y: 0, w: 1600, h: 1100 }, 16);
  return { nodes, edges, rects, bounds };
}

function countDescendants(id: ComponentId): number {
  return childIds(id).reduce((total, kid) => total + 1 + countDescendants(kid), 0);
}

export function routeEdge(
  relId: string | undefined,
  a: Rect,
  b: Rect,
  useHandRoute: boolean,
): Point[] {
  const route = relId ? EDGE_ROUTES[relId] : undefined;
  if (route && useHandRoute) {
    const start = anchorPoint(a, route.from);
    const end = anchorPoint(b, route.to);
    return orthogonalRoute(start, route.from.side, end, route.to.side, route.via);
  }
  const [fromAnchor, toAnchor] = autoAnchors(a, b);
  return orthogonalRoute(
    anchorPoint(a, fromAnchor),
    fromAnchor.side,
    anchorPoint(b, toAnchor),
    toAnchor.side,
  );
}

/** Ids related to `id` through drawn relationships (including its descendants' relationships). */
export function relatedIds(id: ComponentId, edges: SceneEdge[]): Set<ComponentId> {
  const related = new Set<ComponentId>([id]);
  for (const edge of edges) {
    const touches = (end: ComponentId) => end === id || isAncestor(id, end);
    if (touches(edge.rel.from) || touches(edge.from)) related.add(edge.to);
    if (touches(edge.rel.to) || touches(edge.to)) related.add(edge.from);
  }
  return related;
}

export function edgeTouches(edge: SceneEdge, id: ComponentId): boolean {
  const touches = (end: ComponentId) => end === id || isAncestor(id, end);
  return touches(edge.rel.from) || touches(edge.rel.to) || edge.from === id || edge.to === id;
}
