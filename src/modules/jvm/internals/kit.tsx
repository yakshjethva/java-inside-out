import type { KeyboardEvent, ReactNode } from 'react';
import { roundedPath, type Point } from '@/lib/geometry';

/** Shared drawing primitives for the hand-drawn dissection plates. */

export type Tone = 'rt' | 'exec' | 'ok' | 'warn' | 'plat' | 'idle';

export const TONE: Record<Tone, { stroke: string; fill: string; text: string }> = {
  rt: {
    stroke: 'var(--color-rt-500)',
    fill: 'rgb(148 121 242 / 0.09)',
    text: 'var(--color-rt-200)',
  },
  exec: {
    stroke: 'var(--color-exec-500)',
    fill: 'rgb(79 155 245 / 0.09)',
    text: 'var(--color-exec-200)',
  },
  ok: { stroke: 'var(--color-ok-500)', fill: 'rgb(52 194 122 / 0.1)', text: 'var(--color-ok-300)' },
  warn: {
    stroke: 'var(--color-warn-500)',
    fill: 'rgb(242 140 40 / 0.1)',
    text: 'var(--color-warn-300)',
  },
  plat: { stroke: 'var(--color-plat-500)', fill: 'rgb(95 138 131 / 0.08)', text: '#c4dcd7' },
  idle: {
    stroke: 'var(--color-idle-400)',
    fill: 'rgb(120 130 150 / 0.06)',
    text: 'var(--color-fg-muted)',
  },
};

const DASH = { solid: undefined, hotspot: '6 3.5', platform: '1.2 3.4', ghost: '3 3' } as const;
export type Dash = keyof typeof DASH;

/** A selectable region of a dissection. Keyboard: Enter/Space. */
export function Part({
  id,
  label,
  active,
  onPart,
  children,
}: {
  id: string;
  label: string;
  active: boolean;
  onPart: (id: string) => void;
  children: ReactNode;
}) {
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPart(id);
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        onPart(id);
      }}
      onKeyDown={onKeyDown}
      className="ij-node ij-part cursor-pointer outline-none"
      data-part={id}
      data-active={active || undefined}
    >
      {children}
    </g>
  );
}

export function Box({
  x,
  y,
  w,
  h,
  tone = 'rt',
  dash = 'solid',
  active,
  radius = 7,
  opaque = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: Tone;
  dash?: Dash;
  active?: boolean;
  radius?: number;
  opaque?: boolean;
}) {
  const t = TONE[tone];
  return (
    <g>
      {opaque && <rect x={x} y={y} width={w} height={h} rx={radius} fill="var(--color-ink-850)" />}
      {active && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={radius}
          fill="none"
          stroke={t.stroke}
          strokeOpacity={0.5}
          strokeWidth={7}
          filter="url(#ij-glow)"
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        fill={t.fill}
        stroke={active ? t.text : t.stroke}
        strokeWidth={active ? 2.2 : 1.3}
        strokeDasharray={DASH[dash]}
        strokeLinecap={dash === 'platform' ? 'round' : undefined}
        className="ij-node-frame"
      />
      <rect
        x={x - 4}
        y={y - 4}
        width={w + 8}
        height={h + 8}
        rx={radius + 3}
        fill="none"
        stroke="var(--color-exec-300)"
        strokeWidth={2}
        className="ij-focus-ring"
      />
    </g>
  );
}

export function Text({
  x,
  y,
  children,
  size = 12,
  mono,
  weight,
  color = 'var(--color-fg)',
  anchor = 'start',
  spacing,
  italic,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  mono?: boolean;
  weight?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  spacing?: string;
  italic?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontFamily={mono ? 'var(--font-mono)' : undefined}
      fontWeight={weight}
      fill={color}
      textAnchor={anchor}
      letterSpacing={spacing}
      fontStyle={italic ? 'italic' : undefined}
      pointerEvents="none"
    >
      {children}
    </text>
  );
}

/** Small uppercase heading, as used on engineering drawings. */
export function Kicker({
  x,
  y,
  children,
  anchor,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <Text
      x={x}
      y={y}
      size={10}
      mono
      spacing="0.14em"
      color="var(--color-fg-subtle)"
      anchor={anchor}
    >
      {children}
    </Text>
  );
}

export function Arrow({
  points,
  tone = 'exec',
  dashed,
  width = 1.5,
  marker = 'ij-arrow-control',
}: {
  points: Point[];
  tone?: Tone;
  dashed?: string;
  width?: number;
  marker?: string;
}) {
  return (
    <path
      d={roundedPath(points, 7)}
      fill="none"
      stroke={TONE[tone].stroke}
      strokeWidth={width}
      strokeDasharray={dashed}
      markerEnd={marker ? `url(#${marker})` : undefined}
      pointerEvents="none"
    />
  );
}

export function Title({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <g pointerEvents="none">
      <Text x={0} y={-36} size={22} color="var(--color-fg)">
        <tspan fontFamily="var(--font-serif)">{title}</tspan>
      </Text>
      <Kicker x={0} y={-14}>
        {subtitle}
      </Kicker>
    </g>
  );
}
