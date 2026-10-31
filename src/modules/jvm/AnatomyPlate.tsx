import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { Lod } from '@/components/anatomy/AnatomyCanvas';
import { ArchitectureNode, type NodeLevel } from '@/components/anatomy/ArchitectureNode';
import { ConnectorLabel, RelationshipConnector } from '@/components/anatomy/RelationshipConnector';
import { COMPONENTS, isAncestor, type ComponentId } from '@/content/jvm';
import { center, roundedPath, type Point } from '@/lib/geometry';
import { toPlainText } from '@/lib/richText';
import type { FrameSnapshot, NodeState, ScenarioFlow } from '@/types/content';
import { glyphFor } from './glyphs';
import { PLATE_CAPTIONS } from './layout';
import {
  edgeTouches,
  relatedIds,
  routeEdge,
  type DiagramMode,
  type Scene,
  type SceneNode,
} from './scene';

export interface ExecutionOverlay {
  key: string;
  active: ReadonlySet<ComponentId>;
  states: Partial<Record<ComponentId, NodeState>>;
  flows: ScenarioFlow[];
  /** Current frame for this step, or null when the step is not about one frame. */
  frame: FrameSnapshot | null;
}

interface AnatomyPlateProps {
  scene: Scene;
  mode: DiagramMode;
  lod: Lod;
  selectedId: ComponentId | null;
  hoveredId: ComponentId | null;
  execution: ExecutionOverlay | null;
  animate: boolean;
  showEdges: boolean;
  showPartNumbers: boolean;
  /** Plain-language titles for collapsed regions (the overview map). */
  regions?: Partial<Record<ComponentId, { title: string; blurb: string }>>;
  onSelect: (id: ComponentId | null) => void;
  onHover: (id: ComponentId | null) => void;
  onActivate: (id: ComponentId) => void;
  onFocusNode: (id: ComponentId) => void;
}

const LIFECYCLE_STEPS: Partial<Record<ComponentId, string>> = {
  loading: '1',
  linking: '2',
  verification: '2a',
  preparation: '2b',
  resolution: '2c',
  initialization: '3',
  unloading: '4',
  'gc-roots': '1',
  marking: '2',
  sweeping: '3a',
  compaction: '3b',
};

function levelOf(node: SceneNode): NodeLevel {
  if (!node.container) return 'leaf';
  if (
    node.id === 'java-process' ||
    node.id === 'jvm' ||
    node.id === 'build-time' ||
    node.id === 'platform'
  )
    return 'frame';
  if (node.plate) return 'subsystem';
  return 'group';
}

type Direction = 'left' | 'right' | 'up' | 'down';

function nextInDirection(
  from: SceneNode,
  direction: Direction,
  nodes: SceneNode[],
): SceneNode | undefined {
  const a = center(from.rect);
  let best: SceneNode | undefined;
  let bestScore = Infinity;
  for (const node of nodes) {
    if (node.id === from.id) continue;
    const b = center(node.rect);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const [primary, secondary] =
      direction === 'right'
        ? [dx, dy]
        : direction === 'left'
          ? [-dx, dy]
          : direction === 'down'
            ? [dy, dx]
            : [-dy, dx];
    if (primary <= 2) continue;
    const score = primary + Math.abs(secondary) * 2.2 + (node.container ? 40 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = node;
    }
  }
  return best;
}

export function AnatomyPlate({
  scene,
  mode,
  lod,
  selectedId,
  hoveredId,
  execution,
  animate,
  showEdges,
  showPartNumbers,
  regions,
  onSelect,
  onHover,
  onActivate,
  onFocusNode,
}: AnatomyPlateProps) {
  const nodeRefs = useRef(new Map<ComponentId, SVGGElement>());
  const [focusedId, setFocusedId] = useState<ComponentId | null>(null);
  const rovingId =
    focusedId && scene.nodes.some((n) => n.id === focusedId) ? focusedId : (selectedId ?? 'jvm');

  const focusNode = selectedId ?? hoveredId;
  const related = useMemo(
    () => (focusNode ? relatedIds(focusNode, scene.edges) : null),
    [focusNode, scene.edges],
  );

  const isDimmed = (id: ComponentId, container: boolean): boolean => {
    if (execution) {
      if (execution.active.has(id)) return false;
      for (const active of execution.active) if (isAncestor(id, active)) return false;
      return !container;
    }
    if (!focusNode || !related) return false;
    if (related.has(id)) return false;
    if (isAncestor(focusNode, id) || isAncestor(id, focusNode)) return false;
    return !container;
  };

  const containers = scene.nodes.filter((n) => n.container);
  const leaves = scene.nodes.filter((n) => !n.container);

  const handleKey = (node: SceneNode) => (event: KeyboardEvent<SVGGElement>) => {
    const map: Record<string, Direction> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
    const direction = map[event.key];
    if (direction) {
      event.preventDefault();
      event.stopPropagation();
      const next = nextInDirection(node, direction, scene.nodes);
      if (next) {
        setFocusedId(next.id);
        nodeRefs.current.get(next.id)?.focus();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      const parent = COMPONENTS[node.id].parent;
      onSelect(parent ?? null);
      if (parent) {
        setFocusedId(parent);
        nodeRefs.current.get(parent)?.focus();
      }
    }
  };

  const renderNode = (node: SceneNode) => {
    const id = node.id;
    const doc = node.doc;
    const state = execution
      ? (execution.states[id] ?? (execution.active.has(id) ? 'active' : undefined))
      : undefined;
    const selected = selectedId === id;
    const dimmed = isDimmed(id, node.container);
    const region = node.collapsedCount !== undefined ? regions?.[id] : undefined;
    const words = [
      region ? `${region.title} (${doc.name})` : doc.name,
      doc.provenance === 'hotspot'
        ? 'HotSpot implementation'
        : doc.provenance === 'platform'
          ? 'outside the JVM'
          : 'JVM specification concept',
      selected ? 'selected' : '',
      state === 'ok'
        ? 'completed'
        : state === 'warn'
          ? 'exceptional condition'
          : state === 'active'
            ? 'active in this step'
            : '',
      dimmed ? 'inactive' : '',
      node.collapsedCount ? `collapsed, ${node.collapsedCount} parts hidden` : '',
    ].filter(Boolean);
    return (
      <ArchitectureNode
        key={id}
        id={id}
        nodeRef={(el) => {
          if (el) nodeRefs.current.set(id, el);
          else nodeRefs.current.delete(id);
        }}
        rect={node.rect}
        label={
          id === 'stack-frame' && execution?.frame
            ? `Frame · ${execution.frame.method}`
            : (doc.label ?? doc.name)
        }
        caption={doc.caption}
        family={node.family}
        provenance={doc.provenance}
        shape={node.shape}
        level={levelOf(node)}
        plate={node.plate}
        part={node.part}
        showPart={showPartNumbers && !node.container}
        step={LIFECYCLE_STEPS[id]}
        lod={lod}
        selected={selected}
        dimmed={dimmed}
        related={Boolean(related?.has(id)) && !selected}
        state={state}
        collapsedCount={node.collapsedCount}
        region={region}
        glyph={
          node.container ? null : glyphFor(id, node.rect, execution ? execution.frame : undefined)
        }
        ariaLabel={`${words.join(', ')}. ${region ? region.blurb : toPlainText(doc.summary)}`}
        tabIndex={id === rovingId ? 0 : -1}
        animate={animate}
        onSelect={() => onSelect(id)}
        onHover={(hovering) => onHover(hovering ? id : null)}
        onKeyDown={handleKey(node)}
        onFocus={() => {
          setFocusedId(id);
          onFocusNode(id);
        }}
        onDoubleClick={() => onActivate(id)}
      />
    );
  };

  const edgeEmphasis = (edgeId: string, touches: boolean): 'normal' | 'highlighted' | 'muted' => {
    if (execution) return 'muted';
    if (!focusNode) return 'normal';
    void edgeId;
    return touches ? 'highlighted' : 'muted';
  };

  const visibleEdges = mode === 'exploded' && !focusNode ? [] : scene.edges;

  return (
    <g>
      <SheetBackground scene={scene} />
      {mode === 'anatomy' && <TitleBlock />}
      {containers.map(renderNode)}
      {mode === 'anatomy' && lod !== 'overview' && <Captions scene={scene} />}

      {showEdges && (
        <motion.g
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: animate ? 0.35 : 0, delay: animate ? 0.45 : 0 }}
        >
          {visibleEdges.map((edge) => {
            const touches = focusNode ? edgeTouches(edge, focusNode) : false;
            if (mode === 'exploded' && !touches) return null;
            const emphasis = edgeEmphasis(edge.id, touches);
            return (
              <RelationshipConnector
                key={edge.id}
                id={edge.id}
                d={edge.d}
                kind={edge.rel.kind}
                emphasis={emphasis}
                flowing={animate && emphasis === 'highlighted'}
              />
            );
          })}
        </motion.g>
      )}

      {leaves.map(renderNode)}

      {showEdges && focusNode && !execution && lod !== 'overview' && (
        <g>
          {visibleEdges
            .filter((edge) => edgeTouches(edge, focusNode))
            .map((edge) => (
              <ConnectorLabel
                key={edge.id}
                points={edge.points}
                kind={edge.rel.kind}
                label={edge.rel.label}
              />
            ))}
        </g>
      )}

      <AnimatePresence>
        {execution && execution.flows.length > 0 && (
          <FlowLayer key={execution.key} scene={scene} flows={execution.flows} animate={animate} />
        )}
      </AnimatePresence>
    </g>
  );
}

function SheetBackground({ scene }: { scene: Scene }) {
  const b = scene.bounds;
  return (
    <rect
      x={b.x - 400}
      y={b.y - 400}
      width={b.w + 800}
      height={b.h + 800}
      fill="url(#ij-grid)"
      pointerEvents="none"
    />
  );
}

function TitleBlock() {
  return (
    <g transform="translate(1076 16)" pointerEvents="none">
      <rect
        width={504}
        height={104}
        rx={6}
        fill="var(--color-ink-900)"
        stroke="var(--color-ink-500)"
        strokeWidth={1}
      />
      <line x1={0} y1={34} x2={504} y2={34} stroke="var(--color-ink-500)" strokeWidth={0.8} />
      <line x1={252} y1={34} x2={252} y2={74} stroke="var(--color-ink-500)" strokeWidth={0.8} />
      <line x1={0} y1={74} x2={504} y2={74} stroke="var(--color-ink-500)" strokeWidth={0.8} />
      <text
        x={14}
        y={22}
        fontSize={10.5}
        fontFamily="var(--font-mono)"
        letterSpacing="0.14em"
        fill="var(--color-fg-subtle)"
      >
        PLATE 01
      </text>
      <text x={84} y={23} fontSize={15} fontFamily="var(--font-serif)" fill="var(--color-fg)">
        The Java Virtual Machine, assembled
      </text>
      <text
        x={14}
        y={50}
        fontSize={8.5}
        fontFamily="var(--font-mono)"
        letterSpacing="0.1em"
        fill="var(--color-fg-subtle)"
      >
        SPECIFICATION
      </text>
      <text x={14} y={65} fontSize={11.5} fill="var(--color-fg-muted)">
        Java SE 25 · JVMS / JLS
      </text>
      <text
        x={266}
        y={50}
        fontSize={8.5}
        fontFamily="var(--font-mono)"
        letterSpacing="0.1em"
        fill="var(--color-fg-subtle)"
      >
        IMPLEMENTATION
      </text>
      <text x={266} y={65} fontSize={11.5} fill="var(--color-fg-muted)">
        OpenJDK HotSpot · JDK 25 · x64
      </text>
      <g transform="translate(14 90)" fontSize={9.5} fill="var(--color-fg-subtle)">
        <line x1={0} y1={-3} x2={22} y2={-3} stroke="var(--color-fg-muted)" strokeWidth={1.3} />
        <text x={28}>JVMS concept</text>
        <line
          x1={112}
          y1={-3}
          x2={134}
          y2={-3}
          stroke="var(--color-fg-muted)"
          strokeWidth={1.3}
          strokeDasharray="6 3.5"
        />
        <text x={140}>HotSpot</text>
        <line
          x1={204}
          y1={-3}
          x2={226}
          y2={-3}
          stroke="var(--color-fg-muted)"
          strokeWidth={1.3}
          strokeDasharray="1.2 3.4"
          strokeLinecap="round"
        />
        <text x={232}>platform</text>
        <text x={310} fontFamily="var(--font-mono)" fontSize={8.5} letterSpacing="0.06em">
          SCHEMATIC · NOT TO SCALE
        </text>
      </g>
    </g>
  );
}

/** Plate captions, except those that would sit inside a collapsed part. */
function Captions({ scene }: { scene: Scene }) {
  const collapsed = scene.nodes.filter((node) => node.collapsedCount !== undefined);
  const visible = PLATE_CAPTIONS.filter(
    (caption) =>
      !collapsed.some(
        ({ rect }) =>
          caption.x >= rect.x &&
          caption.x <= rect.x + rect.w &&
          caption.y >= rect.y &&
          caption.y <= rect.y + rect.h,
      ),
  );
  return (
    <g
      pointerEvents="none"
      fontFamily="var(--font-mono)"
      fontSize={9}
      letterSpacing="0.12em"
      fill="var(--color-fg-subtle)"
    >
      {visible.map((caption) =>
        caption.vertical ? (
          <text
            key={caption.text}
            transform={`translate(${caption.x} ${caption.y}) rotate(-90)`}
            textAnchor="middle"
          >
            {caption.text}
          </text>
        ) : (
          <text
            key={caption.text}
            x={caption.x}
            y={caption.y}
            textAnchor={caption.anchor ?? 'start'}
            letterSpacing={caption.text === caption.text.toUpperCase() ? '0.12em' : '0.02em'}
          >
            {caption.text}
          </text>
        ),
      )}
    </g>
  );
}

function FlowLayer({
  scene,
  flows,
  animate,
}: {
  scene: Scene;
  flows: ScenarioFlow[];
  animate: boolean;
}) {
  const paths = flows
    .map((flow, index) => {
      const a = scene.rects[flow.from];
      const b = scene.rects[flow.to];
      if (!a || !b) return null;
      const existing = scene.edges.find(
        (edge) => edge.rel.from === flow.from && edge.rel.to === flow.to,
      );
      const reverse = existing
        ? null
        : scene.edges.find((edge) => edge.rel.from === flow.to && edge.rel.to === flow.from);
      let points: Point[];
      if (existing) points = existing.points;
      else if (reverse) points = [...reverse.points].reverse();
      else points = routeEdge(undefined, a, b, false);
      return {
        key: `${flow.from}-${flow.to}-${index}`,
        d: roundedPath(points, 7),
        label: flow.label,
      };
    })
    .filter((p): p is { key: string; d: string; label: string | undefined } => p !== null);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animate ? 0.25 : 0 }}
      pointerEvents="none"
    >
      {paths.map((path, index) => (
        <g key={path.key}>
          <path
            d={path.d}
            fill="none"
            stroke="var(--color-ink-950)"
            strokeWidth={7}
            strokeOpacity={0.85}
          />
          <path
            d={path.d}
            fill="none"
            stroke="var(--color-exec-300)"
            strokeWidth={2.4}
            markerEnd="url(#ij-arrow-flow)"
            className={animate ? 'ij-flowing' : undefined}
          />
          {animate && (
            <circle r={5} fill="var(--color-exec-200)" filter="url(#ij-glow)">
              <animateMotion
                dur="1.6s"
                repeatCount="indefinite"
                path={path.d}
                begin={`${index * 0.25}s`}
              />
            </circle>
          )}
        </g>
      ))}
    </motion.g>
  );
}
