import { motion } from 'motion/react';
import { EDGE_STYLES } from '@/components/diagrams/edgeStyles';
import { labelPoint, type Point } from '@/lib/geometry';
import type { RelationshipKind } from '@/types/content';

export interface RelationshipConnectorProps {
  id: string;
  d: string;
  points: Point[];
  kind: RelationshipKind;
  label: string;
  /** emphasis: highlighted (part of the selection), muted (unrelated to the selection) or normal. */
  emphasis: 'normal' | 'highlighted' | 'muted';
  showLabel: boolean;
  flowing: boolean;
}

/**
 * A directed connector between two components. Each connector paints a dark
 * halo first, so a later connector visibly passes over an earlier one.
 */
export function RelationshipConnector({
  id,
  d,
  kind,
  emphasis,
  flowing,
}: Omit<RelationshipConnectorProps, 'showLabel' | 'label' | 'points'>) {
  const style = EDGE_STYLES[kind];
  const highlighted = emphasis === 'highlighted';
  const opacity = highlighted ? 1 : emphasis === 'muted' ? 0.1 : 0.5;

  return (
    <g data-edge={id} pointerEvents="none">
      <path
        d={d}
        fill="none"
        stroke="var(--color-ink-900)"
        strokeWidth={highlighted ? 6 : 4.5}
        strokeOpacity={0.9}
        strokeLinejoin="round"
      />
      <motion.path
        d={d}
        fill="none"
        stroke={style.color}
        strokeWidth={highlighted ? 2 : 1.25}
        strokeDasharray={style.dash}
        strokeLinejoin="round"
        markerEnd={`url(#${style.marker})`}
        initial={false}
        animate={{ opacity }}
        transition={{ duration: 0.25 }}
      />
      {highlighted && flowing && (
        <path
          d={d}
          fill="none"
          stroke="var(--color-fg)"
          strokeOpacity={0.55}
          strokeWidth={1.2}
          className="ij-flowing"
        />
      )}
    </g>
  );
}

/**
 * Connector label, drawn in a layer above the components. Labels are only
 * drawn where the longest straight segment can hold most of the text, so they
 * never sit on top of a component; the inspector always lists every relationship.
 */
export function ConnectorLabel({
  points,
  kind,
  label,
}: {
  points: Point[];
  kind: RelationshipKind;
  label: string;
}) {
  const style = EDGE_STYLES[kind];
  const at = labelPoint(points);
  const text = label.length > 40 ? `${label.slice(0, 39)}…` : label;
  const width = text.length * 5.7 + 12;
  const segment = longestSegment(points);
  const fits = at.horizontal ? segment >= width * 0.75 : segment >= 46;
  if (!fits) return null;
  return (
    <g transform={`translate(${at.x} ${at.y})`} pointerEvents="none">
      <rect
        x={-width / 2}
        y={-8}
        width={width}
        height={16}
        rx={4}
        fill="var(--color-ink-900)"
        stroke={style.color}
        strokeOpacity={0.6}
        strokeWidth={0.8}
      />
      <text
        y={3.4}
        textAnchor="middle"
        fontSize={9.5}
        fontFamily="var(--font-mono)"
        fill="var(--color-fg)"
      >
        {text}
      </text>
    </g>
  );
}

function longestSegment(points: Point[]): number {
  let best = 0;
  for (let i = 1; i < points.length; i++) {
    best = Math.max(
      best,
      Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y),
    );
  }
  return best;
}
