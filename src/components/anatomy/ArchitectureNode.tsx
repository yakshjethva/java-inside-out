import { motion } from 'motion/react';
import type { KeyboardEvent, ReactNode, Ref } from 'react';
import type { Lod } from './AnatomyCanvas';
import type { Rect } from '@/lib/geometry';
import type { NodeState, Provenance } from '@/types/content';
import { FAMILY_COLORS, PROVENANCE_DASH, type NodeFamily } from './nodeStyles';

export type { NodeFamily } from './nodeStyles';

export type NodeShape = 'box' | 'rail' | 'phase' | 'chip' | 'memory';
export type NodeLevel = 'frame' | 'subsystem' | 'group' | 'leaf';

const STATE_COLORS: Record<NodeState, string> = {
  active: 'var(--color-exec-300)',
  ok: 'var(--color-ok-400)',
  warn: 'var(--color-warn-400)',
};

const STATE_GLYPH: Record<NodeState, string> = { active: '▶', ok: '✓', warn: '!' };

export interface ArchitectureNodeProps {
  id: string;
  rect: Rect;
  label: string;
  caption?: string;
  family: NodeFamily;
  provenance: Provenance;
  shape: NodeShape;
  level: NodeLevel;
  plate?: string;
  part?: number;
  showPart?: boolean;
  step?: string;
  lod: Lod;
  selected?: boolean;
  dimmed?: boolean;
  related?: boolean;
  state?: NodeState;
  collapsedCount?: number;
  glyph?: ReactNode;
  ariaLabel: string;
  tabIndex: number;
  animate: boolean;
  nodeRef?: Ref<SVGGElement>;
  onSelect: () => void;
  onHover?: (hovering: boolean) => void;
  onKeyDown?: (event: KeyboardEvent<SVGGElement>) => void;
  onFocus?: () => void;
  onDoubleClick?: () => void;
}

/** Estimated rendered width of a label, for fitting text into a box. */
function fitFont(text: string, width: number, base: number, min: number, perChar = 0.57) {
  return Math.max(min, Math.min(base, width / Math.max(1, text.length * perChar)));
}

/**
 * One selectable component of an anatomy plate. Purely presentational: the
 * plate decides state (selected, dimmed, execution state) and handles events.
 */
export function ArchitectureNode(props: ArchitectureNodeProps) {
  const {
    rect,
    label,
    caption,
    family,
    provenance,
    shape,
    level,
    plate,
    part,
    showPart,
    step,
    lod,
    selected,
    dimmed,
    related,
    state,
    collapsedCount,
    glyph,
    ariaLabel,
    tabIndex,
    animate,
    nodeRef,
    onSelect,
    onHover,
    onKeyDown,
    onFocus,
    onDoubleClick,
  } = props;
  const colors = FAMILY_COLORS[family];
  const isContainer = level !== 'leaf';
  const dash = PROVENANCE_DASH[provenance];
  const stateColor = state ? STATE_COLORS[state] : undefined;
  const stroke = stateColor ?? (selected ? colors.bright : colors.stroke);
  const radius = shape === 'chip' ? 6 : level === 'frame' ? 10 : 7;
  const transition = animate
    ? { type: 'spring' as const, stiffness: 140, damping: 22, mass: 0.9 }
    : { duration: 0 };
  const opacity = dimmed ? 0.28 : 1;

  const handleKey = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onSelect();
      return;
    }
    onKeyDown?.(event);
  };

  const strokeOpacity = isContainer
    ? level === 'frame'
      ? 0.5
      : level === 'subsystem'
        ? 0.6
        : 0.55
    : 0.95;
  const strokeWidth = selected
    ? 2.4
    : state
      ? 2
      : isContainer
        ? level === 'frame'
          ? 1
          : 1.2
        : 1.3;

  return (
    <motion.g
      ref={nodeRef}
      data-node={props.id}
      role="button"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-pressed={selected ?? false}
      initial={false}
      animate={{ x: rect.x, y: rect.y, opacity }}
      transition={transition}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onDoubleClick?.();
      }}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      onKeyDown={handleKey}
      onFocus={onFocus}
      className="ij-node cursor-pointer outline-none"
    >
      {/* Opaque backing so connectors behind leaves do not show through. */}
      {!isContainer && (
        <motion.rect
          initial={false}
          animate={{ width: rect.w, height: rect.h }}
          transition={transition}
          rx={radius}
          fill="var(--color-ink-850)"
        />
      )}
      {(selected || state) && !isContainer && (
        <motion.rect
          initial={false}
          animate={{ width: rect.w, height: rect.h }}
          transition={transition}
          rx={radius}
          fill="none"
          stroke={stroke}
          strokeOpacity={0.45}
          strokeWidth={6}
          filter="url(#ij-glow)"
          className={state === 'active' ? 'ij-pulse' : undefined}
        />
      )}
      <motion.rect
        initial={false}
        animate={{ width: rect.w, height: rect.h }}
        transition={transition}
        rx={radius}
        fill={level === 'frame' ? 'rgb(255 255 255 / 0.012)' : colors.tint}
        stroke={stroke}
        strokeOpacity={selected || state ? 1 : related ? 1 : strokeOpacity}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap={provenance === 'platform' ? 'round' : undefined}
        className="ij-node-frame"
      />
      {shape === 'memory' && !isContainer && (
        <motion.rect
          initial={false}
          animate={{ width: rect.w, height: rect.h }}
          transition={transition}
          rx={radius}
          fill="url(#ij-hatch)"
          pointerEvents="none"
        />
      )}
      {shape === 'phase' && (
        <rect
          x={0}
          y={4}
          width={3}
          height={Math.max(0, rect.h - 8)}
          rx={1.5}
          fill={stroke}
          opacity={0.9}
        />
      )}

      {/* Focus ring (keyboard). */}
      <rect
        x={-4}
        y={-4}
        width={rect.w + 8}
        height={rect.h + 8}
        rx={radius + 3}
        fill="none"
        stroke="var(--color-exec-300)"
        strokeWidth={2}
        className="ij-focus-ring"
        pointerEvents="none"
      />

      <NodeText
        {...{ rect, label, caption, level, shape, plate, step, lod, colors, isContainer }}
        hasGlyph={Boolean(glyph)}
      />

      {glyph && lod !== 'overview' && !isContainer && <g pointerEvents="none">{glyph}</g>}

      {provenance === 'hotspot' && lod !== 'overview' && level !== 'frame' && rect.w >= 50 && (
        <g
          transform={
            isContainer ? `translate(${rect.w - 30} 8)` : `translate(${rect.w - 23} ${rect.h - 15})`
          }
          pointerEvents="none"
        >
          <rect
            width={isContainer ? 24 : 19}
            height={11}
            rx={2}
            fill="var(--color-ink-900)"
            stroke={colors.stroke}
            strokeOpacity={0.6}
            strokeWidth={0.8}
            strokeDasharray="2 1.5"
          />
          <text
            x={isContainer ? 12 : 9.5}
            y={8.2}
            textAnchor="middle"
            fontSize={7}
            fontFamily="var(--font-mono)"
            fill={colors.text}
            letterSpacing="0.04em"
          >
            HS
          </text>
        </g>
      )}

      {state && (
        <g transform={`translate(${rect.w - 9} 9)`} pointerEvents="none">
          <circle r={8} fill="var(--color-ink-900)" stroke={stateColor} strokeWidth={1.4} />
          <text y={3.4} textAnchor="middle" fontSize={9} fontWeight={700} fill={stateColor}>
            {STATE_GLYPH[state]}
          </text>
        </g>
      )}

      {collapsedCount !== undefined && (
        <g transform={`translate(${rect.w - 44} ${rect.h - 20})`} pointerEvents="none">
          <rect
            width={36}
            height={14}
            rx={7}
            fill="var(--color-ink-700)"
            stroke={colors.stroke}
            strokeWidth={0.8}
          />
          <text
            x={18}
            y={10.2}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={colors.text}
          >
            +{collapsedCount}
          </text>
        </g>
      )}

      {selected && <Reticle w={rect.w} h={rect.h} color={colors.bright} />}

      {showPart && part !== undefined && (
        <g pointerEvents="none">
          <line
            x1={-2}
            y1={-2}
            x2={-12}
            y2={-12}
            stroke="var(--color-fg-subtle)"
            strokeWidth={0.8}
          />
          <circle
            cx={-18}
            cy={-18}
            r={9}
            fill="var(--color-ink-900)"
            stroke="var(--color-fg-subtle)"
            strokeWidth={0.9}
          />
          <text
            x={-18}
            y={-14.6}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-fg)"
          >
            {part}
          </text>
        </g>
      )}
    </motion.g>
  );
}

function Reticle({ w, h, color }: { w: number; h: number; color: string }) {
  const o = 6;
  const l = Math.min(12, w / 4, h / 4);
  const path = [
    `M ${-o} ${-o + l} V ${-o} H ${-o + l}`,
    `M ${w + o - l} ${-o} H ${w + o} V ${-o + l}`,
    `M ${w + o} ${h + o - l} V ${h + o} H ${w + o - l}`,
    `M ${-o + l} ${h + o} H ${-o} V ${h + o - l}`,
  ].join(' ');
  return <path d={path} fill="none" stroke={color} strokeWidth={1.6} pointerEvents="none" />;
}

function NodeText({
  rect,
  label,
  caption,
  level,
  shape,
  plate,
  step,
  lod,
  colors,
  isContainer,
  hasGlyph,
}: {
  rect: Rect;
  label: string;
  caption?: string;
  level: NodeLevel;
  shape: NodeShape;
  plate?: string;
  step?: string;
  lod: Lod;
  colors: { text: string };
  isContainer: boolean;
  hasGlyph: boolean;
}) {
  if (shape === 'rail') {
    return (
      <text
        transform={`translate(${rect.w / 2 + 3.5} ${rect.h / 2}) rotate(-90)`}
        textAnchor="middle"
        fontSize={9.5}
        fontFamily="var(--font-mono)"
        letterSpacing="0.14em"
        fill={colors.text}
        pointerEvents="none"
      >
        {lod === 'overview' ? '' : '▲ PARENT DELEGATION'}
      </text>
    );
  }

  if (isContainer) {
    const big = level === 'subsystem';
    const size = level === 'frame' ? 10.5 : big ? 11.5 : 9.5;
    const text = label.toUpperCase();
    return (
      <g pointerEvents="none">
        {lod === 'overview' && big ? (
          <text
            x={rect.w / 2}
            y={rect.h / 2}
            textAnchor="middle"
            fill="var(--color-fg)"
            fontWeight={600}
            style={{ fontSize: 'calc(11px / var(--k, 1))' }}
            stroke="var(--color-ink-950)"
            strokeWidth="calc(4px / var(--k, 1))"
            paintOrder="stroke"
          >
            {overviewLines(label).map((line, i, all) => (
              <tspan
                key={i}
                x={rect.w / 2}
                dy={i === 0 ? `${-(all.length - 1) * 0.55 + 0.35}em` : '1.1em'}
              >
                {line}
              </tspan>
            ))}
          </text>
        ) : lod === 'overview' ? null : (
          <>
            {plate && (
              <>
                <rect
                  x={10}
                  y={8}
                  width={22}
                  height={15}
                  rx={3}
                  fill={colors.text}
                  opacity={0.14}
                />
                <text
                  x={21}
                  y={19.3}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={colors.text}
                >
                  {plate}
                </text>
              </>
            )}
            <text
              x={plate ? 40 : 12}
              y={level === 'group' ? 15.5 : 19.5}
              fontSize={size}
              fontFamily="var(--font-mono)"
              letterSpacing="0.1em"
              fill={big ? colors.text : 'var(--color-fg-muted)'}
              fontWeight={big ? 600 : 500}
            >
              {fitText(text, rect.w - (plate ? 70 : 40), size * 0.68)}
            </text>
            {caption && lod === 'detail' && level !== 'group' && (
              <text
                x={
                  plate ? 40 + text.length * size * 0.68 + 12 : 12 + text.length * size * 0.68 + 12
                }
                y={19.5}
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="var(--color-fg-subtle)"
              >
                {caption}
              </text>
            )}
          </>
        )}
      </g>
    );
  }

  if (lod === 'overview') return null;

  const narrow = rect.w < 70 && rect.h > rect.w;
  if (narrow) {
    return (
      <text
        transform={`translate(${rect.w / 2 + 4.5} ${rect.h / 2}) rotate(-90)`}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="var(--color-fg)"
        pointerEvents="none"
      >
        {label}
      </text>
    );
  }

  const lines = label.split('\n');
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '');
  const roomy = rect.h >= 50 && (rect.w >= 130 || hasGlyph);
  const fontSize = fitFont(
    longest,
    rect.w - (shape === 'phase' ? 26 : 20),
    roomy ? 14.5 : 13.5,
    9.5,
  );
  const lineHeight = fontSize * 1.15;
  const showCaption = caption && lod === 'detail' && rect.h >= 30;
  const stepLabel = step ? `${step}  ` : '';
  const x0 = shape === 'phase' ? 14 : 11;

  if (roomy) {
    return (
      <g pointerEvents="none">
        {lines.map((line, i) => (
          <text
            key={i}
            x={x0}
            y={20 + i * lineHeight}
            fontSize={fontSize}
            fontWeight={600}
            fill="var(--color-fg)"
          >
            {i === 0 && stepLabel && (
              <tspan fontFamily="var(--font-mono)" fontSize={10} fill={colors.text}>
                {stepLabel}
              </tspan>
            )}
            {line}
          </text>
        ))}
        {showCaption && !hasGlyph && (
          <text
            x={x0}
            y={20 + (lines.length - 1) * lineHeight + 15}
            fontSize={9.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-fg-subtle)"
          >
            {fitText(caption, rect.w - 22, 5.6)}
          </text>
        )}
        {showCaption && hasGlyph && rect.w >= 200 && (
          <text
            x={x0}
            y={35}
            fontSize={9.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-fg-subtle)"
          >
            {fitText(caption, rect.w - 22, 5.6)}
          </text>
        )}
      </g>
    );
  }

  const blockHeight = lines.length * lineHeight;
  const cy = (showCaption ? rect.h / 2 - 3 : rect.h / 2 + 4.5) - (blockHeight - lineHeight) / 2;
  return (
    <g pointerEvents="none">
      {lines.map((line, i) => (
        <text
          key={i}
          x={rect.w / 2 + (shape === 'phase' ? 3 : 0)}
          y={cy + i * lineHeight}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={600}
          fill="var(--color-fg)"
        >
          {i === 0 && stepLabel && (
            <tspan fontFamily="var(--font-mono)" fontSize={9.5} fill={colors.text}>
              {stepLabel}
            </tspan>
          )}
          {line}
        </text>
      ))}
      {showCaption && (
        <text
          x={rect.w / 2}
          y={cy + (lines.length - 1) * lineHeight + 13}
          textAnchor="middle"
          fontSize={8.5}
          fontFamily="var(--font-mono)"
          fill="var(--color-fg-subtle)"
        >
          {fitText(caption, rect.w - 12, 5.1)}
        </text>
      )}
    </g>
  );
}

/** Splits a long label into two balanced lines for the zoomed-out overview. */
function overviewLines(label: string): string[] {
  const words = label.split(/\s+/);
  if (label.length <= 12 || words.length < 2) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/** Truncates text that would not fit in `width` at `charWidth` per character. */
function fitText(text: string, width: number, charWidth: number) {
  const max = Math.floor(width / charWidth);
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 1))}…`;
}
