import { childrenOf, getComponentDoc, type ComponentId } from '@/content/jvm';
import { relationshipsOf } from '@/content/jvm/relationships';
import { FAMILY_COLORS, PROVENANCE_DASH } from '@/components/anatomy/nodeStyles';
import { EDGE_STYLES } from '@/components/diagrams/edgeStyles';
import { roundedPath } from '@/lib/geometry';
import { toPlainText } from '@/lib/richText';
import { familyOf } from '../scene';

export const FOCUS_BOUNDS = { x: 0, y: 0, w: 1120, h: 660 };

/** Splits text into lines of at most `max` characters, on word boundaries. */
export function wrapText(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Generated internal view for any component: the component enlarged, its
 * parts (or internal structure) inside, and every connection laid out as
 * inputs on the left and outputs on the right. Built entirely from data.
 */
export function FocusDissection({
  id,
  onSelect,
}: {
  id: ComponentId;
  onSelect: (id: ComponentId) => void;
}) {
  const doc = getComponentDoc(id);
  const family = familyOf(id);
  const colors = FAMILY_COLORS[family];
  const parts = childrenOf(id);
  const { incoming, outgoing } = relationshipsOf(id);
  const box = { x: 330, y: 110, w: 460, h: 400 };

  const sideBoxes = (items: typeof incoming, side: 'left' | 'right') => {
    const count = items.length;
    const height = 62;
    const gap = count > 6 ? 8 : 16;
    const total = count * height + Math.max(0, count - 1) * gap;
    const top = box.y + box.h / 2 - total / 2;
    return items.map((rel, index) => {
      const otherId = side === 'left' ? rel.from : rel.to;
      const y = top + index * (height + gap);
      const x = side === 'left' ? 30 : 870;
      return { rel, otherId, rect: { x, y, w: 220, h: height } };
    });
  };

  const left = sideBoxes(incoming, 'left');
  const right = sideBoxes(outgoing, 'right');

  const strata = parts.length
    ? []
    : doc.internals.map((item) => wrapText(toPlainText(item), 58).slice(0, 2));

  return (
    <g>
      <text
        x={560}
        y={52}
        textAnchor="middle"
        fontSize={11}
        fontFamily="var(--font-mono)"
        letterSpacing="0.14em"
        fill="var(--color-fg-subtle)"
      >
        INTERNAL VIEW · GENERATED FROM THE ATLAS DATA
      </text>
      <text
        x={560}
        y={80}
        textAnchor="middle"
        fontSize={22}
        fontFamily="var(--font-serif)"
        fill="var(--color-fg)"
      >
        {doc.name}
      </text>

      {/* Connections */}
      {[...left, ...right].map(({ rel, otherId, rect }) => {
        const style = EDGE_STYLES[rel.kind];
        const fromLeft = rect.x < box.x;
        const start = fromLeft
          ? { x: rect.x + rect.w, y: rect.y + rect.h / 2 }
          : { x: box.x + box.w, y: rect.y + rect.h / 2 };
        const end = fromLeft
          ? { x: box.x, y: rect.y + rect.h / 2 }
          : { x: rect.x, y: rect.y + rect.h / 2 };
        const mid = (start.x + end.x) / 2;
        const clampY = Math.min(Math.max(rect.y + rect.h / 2, box.y + 16), box.y + box.h - 16);
        const points = fromLeft
          ? [start, { x: mid, y: start.y }, { x: mid, y: clampY }, { x: end.x, y: clampY }]
          : [{ x: start.x, y: clampY }, { x: mid, y: clampY }, { x: mid, y: end.y }, end];
        const other = getComponentDoc(otherId);
        const otherColors = FAMILY_COLORS[familyOf(otherId)];
        return (
          <g key={rel.id}>
            <path
              d={roundedPath(points, 8)}
              fill="none"
              stroke={style.color}
              strokeWidth={1.4}
              strokeDasharray={style.dash}
              markerEnd={`url(#${style.marker})`}
            />
            <g
              role="button"
              tabIndex={0}
              aria-label={`${fromLeft ? `${other.name} ${rel.label} ${doc.name}` : `${doc.name} ${rel.label} ${other.name}`}. Open ${other.name}.`}
              className="ij-node cursor-pointer outline-none"
              onClick={() => onSelect(otherId)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(otherId);
                }
              }}
              transform={`translate(${rect.x} ${rect.y})`}
            >
              <rect width={rect.w} height={rect.h} rx={7} fill="var(--color-ink-850)" />
              <rect
                width={rect.w}
                height={rect.h}
                rx={7}
                fill={otherColors.tint}
                stroke={otherColors.stroke}
                strokeWidth={1.2}
                strokeDasharray={PROVENANCE_DASH[other.provenance]}
                className="ij-node-frame"
              />
              <rect
                x={-4}
                y={-4}
                width={rect.w + 8}
                height={rect.h + 8}
                rx={10}
                fill="none"
                stroke="var(--color-exec-300)"
                strokeWidth={2}
                className="ij-focus-ring"
              />
              <text x={12} y={21} fontSize={13.5} fontWeight={600} fill="var(--color-fg)">
                {other.name.length > 26 ? `${other.name.slice(0, 25)}…` : other.name}
              </text>
              {wrapText(fromLeft ? `${rel.label} ${doc.name}` : `${doc.name} ${rel.label}`, 38)
                .slice(0, 2)
                .map((line, i) => (
                  <text key={i} x={12} y={38 + i * 13} fontSize={10} fill={style.color}>
                    {line}
                  </text>
                ))}
            </g>
          </g>
        );
      })}

      {/* The component */}
      <g transform={`translate(${box.x} ${box.y})`}>
        <rect width={box.w} height={box.h} rx={12} fill="var(--color-ink-850)" />
        <rect
          width={box.w}
          height={box.h}
          rx={12}
          fill={colors.tint}
          stroke={colors.stroke}
          strokeWidth={1.6}
          strokeDasharray={PROVENANCE_DASH[doc.provenance]}
        />
        <text
          x={18}
          y={28}
          fontSize={10.5}
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          fill={colors.text}
        >
          {parts.length ? 'PARTS' : 'INTERNAL STRUCTURE'}
        </text>
        {parts.length > 0
          ? parts.map((part, index) => {
              const cols = parts.length > 4 ? 2 : 1;
              const rows = Math.ceil(parts.length / cols);
              const cellW = (box.w - 36 - (cols - 1) * 12) / cols;
              const cellH = Math.min(74, (box.h - 60 - (rows - 1) * 10) / rows);
              const x = 18 + (index % cols) * (cellW + 12);
              const y = 44 + Math.floor(index / cols) * (cellH + 10);
              const partColors = FAMILY_COLORS[familyOf(part.id)];
              return (
                <g
                  key={part.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${part.name}: ${toPlainText(part.summary)}`}
                  className="ij-node cursor-pointer outline-none"
                  transform={`translate(${x} ${y})`}
                  onClick={() => onSelect(part.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(part.id);
                    }
                  }}
                >
                  <rect
                    width={cellW}
                    height={cellH}
                    rx={7}
                    fill="var(--color-ink-800)"
                    stroke={partColors.stroke}
                    strokeWidth={1.2}
                    strokeDasharray={PROVENANCE_DASH[part.provenance]}
                    className="ij-node-frame"
                  />
                  <rect
                    x={-4}
                    y={-4}
                    width={cellW + 8}
                    height={cellH + 8}
                    rx={10}
                    fill="none"
                    stroke="var(--color-exec-300)"
                    strokeWidth={2}
                    className="ij-focus-ring"
                  />
                  <text x={12} y={21} fontSize={13.5} fontWeight={600} fill="var(--color-fg)">
                    {part.name}
                  </text>
                  {wrapText(toPlainText(part.summary), cols === 2 ? 30 : 64)
                    .slice(0, cellH > 60 ? 2 : 1)
                    .map((line, i) => (
                      <text
                        key={i}
                        x={12}
                        y={38 + i * 13}
                        fontSize={10}
                        fill="var(--color-fg-subtle)"
                      >
                        {line}
                      </text>
                    ))}
                </g>
              );
            })
          : strata.map((lines, index) => {
              const bandH = (box.h - 60) / Math.max(strata.length, 1);
              const y = 44 + index * bandH;
              return (
                <g key={index} transform={`translate(18 ${y})`}>
                  <rect
                    width={box.w - 36}
                    height={bandH - 8}
                    rx={5}
                    fill="rgb(255 255 255 / 0.02)"
                    stroke={colors.stroke}
                    strokeOpacity={0.35}
                  />
                  <circle
                    cx={16}
                    cy={(bandH - 8) / 2}
                    r={9}
                    fill="none"
                    stroke={colors.stroke}
                    strokeOpacity={0.7}
                  />
                  <text
                    x={16}
                    y={(bandH - 8) / 2 + 3.5}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontFamily="var(--font-mono)"
                    fill={colors.text}
                  >
                    {index + 1}
                  </text>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={34}
                      y={(bandH - 8) / 2 + 4 - (lines.length - 1) * 7 + i * 14}
                      fontSize={12}
                      fill="var(--color-fg-muted)"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
      </g>

      {/* Inputs and outputs */}
      <g fontSize={11} fill="var(--color-fg-muted)">
        <text
          x={330}
          y={548}
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          letterSpacing="0.12em"
          fill="var(--color-fg-subtle)"
        >
          INPUTS
        </text>
        {doc.inputs.slice(0, 3).flatMap((input, i) =>
          wrapText(toPlainText(input), 34)
            .slice(0, 2)
            .map((line, j) => (
              <text key={`${i}-${j}`} x={330} y={568 + i * 30 + j * 13}>
                {j === 0 ? '→ ' : '   '}
                {line}
              </text>
            )),
        )}
        <text
          x={570}
          y={548}
          fontFamily="var(--font-mono)"
          fontSize={9.5}
          letterSpacing="0.12em"
          fill="var(--color-fg-subtle)"
        >
          OUTPUTS
        </text>
        {doc.outputs.slice(0, 3).flatMap((output, i) =>
          wrapText(toPlainText(output), 34)
            .slice(0, 2)
            .map((line, j) => (
              <text key={`${i}-${j}`} x={570} y={568 + i * 30 + j * 13}>
                {j === 0 ? '← ' : '   '}
                {line}
              </text>
            )),
        )}
      </g>
      {incoming.length === 0 && (
        <text x={140} y={310} textAnchor="middle" fontSize={11} fill="var(--color-fg-subtle)">
          no drawn incoming connections
        </text>
      )}
      {outgoing.length === 0 && (
        <text x={980} y={310} textAnchor="middle" fontSize={11} fill="var(--color-fg-subtle)">
          no drawn outgoing connections
        </text>
      )}
    </g>
  );
}
