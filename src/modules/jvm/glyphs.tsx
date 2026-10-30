import type { ReactNode } from 'react';
import type { ComponentId } from '@/content/jvm/ids';
import type { Rect } from '@/lib/geometry';
import type { FrameSnapshot } from '@/types/content';

const mono = 'var(--font-mono)';
const faint = 'var(--color-fg-subtle)';

/** Main.main at pc 6, just before invokespecial: the state the anatomy view shows. */
export const DEFAULT_FRAME: FrameSnapshot = {
  method: 'main(String[])',
  pc: 6,
  locals: ['args', '—', '—'],
  stack: ['ref', 'ref', '"Alex"'],
};

/** Verified javap offsets of the methods the walkthroughs step through. */
const CODE: Record<string, [number, string][]> = {
  'main(String[])': [
    [0, 'new #7'],
    [3, 'dup'],
    [4, 'ldc #9'],
    [6, 'invokespecial'],
    [9, 'astore_1'],
    [10, 'aload_1'],
    [11, 'astore_2'],
    [12, 'getstatic #14'],
    [15, 'aload_2'],
    [16, 'invokevirtual'],
    [19, 'invokevirtual'],
    [22, 'aconst_null'],
    [23, 'astore_1'],
    [24, 'aconst_null'],
    [25, 'astore_2'],
    [26, 'return'],
  ],
  'Person.<init>(String)': [
    [0, 'aload_0'],
    [1, 'invokespecial'],
    [4, 'aload_0'],
    [5, 'aload_1'],
    [6, 'putfield #7'],
    [9, 'return'],
  ],
};

const FRAME_GLYPHS = new Set<ComponentId>(['local-variables', 'operand-stack', 'pc-register']);

/**
 * Small in-node illustrations. Each one shows real content from the running
 * example, not decoration. `frame` is the current frame to draw; `null` hides
 * the frame-dependent glyphs (an execution step that is not about one frame).
 */
export function glyphFor(
  id: ComponentId,
  rect: Rect,
  frame: FrameSnapshot | null = DEFAULT_FRAME,
): ReactNode {
  const { w, h } = rect;
  if (FRAME_GLYPHS.has(id) && !frame) return null;
  const current = frame ?? DEFAULT_FRAME;
  switch (id) {
    case 'local-variables': {
      const slots = current.locals.slice(0, 3);
      const cell = (w - 22) / 3;
      return (
        <g transform="translate(11 25)">
          {slots.map((value, i) => (
            <g key={i} transform={`translate(${i * cell} 0)`}>
              <rect
                width={cell - 3}
                height={20}
                rx={2}
                fill="var(--color-ink-750)"
                stroke="var(--color-rt-500)"
                strokeOpacity={0.5}
                strokeWidth={0.8}
              />
              <text x={3} y={8} fontSize={6.5} fontFamily={mono} fill={faint}>
                {i}
              </text>
              <text
                x={(cell - 3) / 2}
                y={16}
                textAnchor="middle"
                fontSize={7.5}
                fontFamily={mono}
                fill="var(--color-fg-muted)"
              >
                {value}
              </text>
            </g>
          ))}
        </g>
      );
    }
    case 'operand-stack': {
      const values = current.stack;
      if (values.length === 0) {
        return (
          <text x={w / 2} y={40} textAnchor="middle" fontSize={7.5} fontFamily={mono} fill={faint}>
            (empty)
          </text>
        );
      }
      return (
        <g transform={`translate(${w / 2 - 34} 27)`}>
          {values.map((value, i) => (
            <g key={i} transform={`translate(${i * 2} ${(values.length - 1 - i) * 7.5})`}>
              <rect
                width={64}
                height={9}
                rx={1.5}
                fill="var(--color-ink-750)"
                stroke="var(--color-rt-500)"
                strokeOpacity={0.55}
                strokeWidth={0.8}
              />
              <text
                x={32}
                y={6.8}
                textAnchor="middle"
                fontSize={6.5}
                fontFamily={mono}
                fill="var(--color-fg-muted)"
              >
                {value}
              </text>
            </g>
          ))}
          <text x={70} y={6} fontSize={6.5} fontFamily={mono} fill={faint}>
            ← top
          </text>
        </g>
      );
    }
    case 'frame-data':
      return (
        <g
          transform="translate(10 33)"
          fontSize={6.8}
          fontFamily={mono}
          fill="var(--color-fg-muted)"
        >
          <text y={0}>→ Main's RCP</text>
          <text y={8.5}>return to caller</text>
          <text y={17}>HS: Method*, bcp…</text>
        </g>
      );
    case 'pc-register': {
      const code = CODE[current.method] ?? [];
      const at = Math.max(
        0,
        code.findIndex(([pc]) => pc === current.pc),
      );
      const start = Math.max(0, Math.min(at - 2, code.length - 4));
      const window = code.slice(start, start + 4);
      return (
        <g transform="translate(9 40)" fontSize={7.4} fontFamily={mono}>
          {window.map(([pc, op], i) => (
            <text key={pc} y={i * 12} fill={pc === current.pc ? 'var(--color-exec-200)' : faint}>
              {pc === current.pc ? '▸' : ' '} {pc}: {op}
            </text>
          ))}
          {code.length === 0 && <text fill="var(--color-exec-200)">pc = {current.pc}</text>}
        </g>
      );
    }
    case 'native-method-stack':
      return (
        <g transform="translate(10 40)">
          {['Java frame', 'JNI stub', 'C frame'].map((label, i) => (
            <g key={label} transform={`translate(0 ${i * 15})`}>
              <rect
                width={w - 20}
                height={12}
                rx={2}
                fill="var(--color-ink-750)"
                stroke={i === 2 ? 'var(--color-plat-500)' : 'var(--color-rt-500)'}
                strokeOpacity={0.55}
                strokeWidth={0.8}
              />
              <text
                x={(w - 20) / 2}
                y={8.6}
                textAnchor="middle"
                fontSize={6.6}
                fontFamily={mono}
                fill="var(--color-fg-muted)"
              >
                {label}
              </text>
            </g>
          ))}
        </g>
      );
    case 'runtime-constant-pool':
      return (
        <g transform="translate(11 46)" fontFamily={mono} fontSize={8}>
          {[
            ['#7', 'Class', 'Person'],
            ['#9', 'String', '"Alex"'],
            ['#11', 'Methodref', 'Person.<init>'],
            ['#20', 'Methodref', 'Person.getName'],
          ].map(([index, kind, value], i) => (
            <text key={index} y={i * 13} fill="var(--color-fg-muted)">
              <tspan fill={faint}>{index}</tspan>
              <tspan x={30} fill="var(--color-rt-300)">
                {kind}
              </tspan>
              <tspan x={98}>{value}</tspan>
            </text>
          ))}
        </g>
      );
    case 'eden':
    case 'survivor':
    case 'old-generation': {
      const cols = id === 'survivor' ? 2 : id === 'eden' ? 4 : 4;
      const rows = id === 'old-generation' ? 5 : 3;
      const size = 8;
      const gap = 3;
      const gridW = cols * size + (cols - 1) * gap;
      const top = id === 'old-generation' ? 34 : h - rows * (size + gap) - 6;
      return (
        <g transform={`translate(${(w - gridW) / 2} ${top})`}>
          {Array.from({ length: rows * cols }, (_, i) => {
            const used = id === 'eden' ? i < 9 : id === 'survivor' ? i < 2 : (i * 7) % 10 < 7;
            return (
              <rect
                key={i}
                x={(i % cols) * (size + gap)}
                y={Math.floor(i / cols) * (size + gap)}
                width={size}
                height={size}
                rx={1}
                fill={used ? 'var(--color-rt-500)' : 'none'}
                fillOpacity={used ? 0.35 : 0}
                stroke="var(--color-rt-400)"
                strokeOpacity={0.5}
                strokeWidth={0.7}
              />
            );
          })}
        </g>
      );
    }
    case 'code-cache': {
      const segments: [string, number][] = [
        ['non-nmethods', 0.06],
        ['profiled', 0.47],
        ['non-profiled', 0.47],
      ];
      let x = 0;
      const width = w - 22;
      return (
        <g transform="translate(11 41)">
          {segments.map(([label, share]) => {
            const segment = (
              <g key={label} transform={`translate(${x} 0)`}>
                <rect
                  width={Math.max(6, width * share - 3)}
                  height={14}
                  rx={2}
                  fill="var(--color-exec-500)"
                  fillOpacity={0.14}
                  stroke="var(--color-exec-400)"
                  strokeOpacity={0.5}
                  strokeWidth={0.8}
                />
                {share > 0.1 && (
                  <text
                    x={(width * share - 3) / 2}
                    y={10}
                    textAnchor="middle"
                    fontSize={7.4}
                    fontFamily={mono}
                    fill="var(--color-exec-200)"
                  >
                    {label}
                  </text>
                )}
              </g>
            );
            x += width * share;
            return segment;
          })}
        </g>
      );
    }
    case 'interpreter':
      return (
        <g transform="translate(12 52)" fontSize={8} fontFamily={mono} fill="var(--color-exec-200)">
          <text>fetch opcode → dispatch table → template → next</text>
        </g>
      );
    case 'deoptimization':
      return (
        <g transform="translate(12 52)" fontSize={8} fontFamily={mono} fill="var(--color-warn-300)">
          <text>uncommon trap → rebuild interpreter frames</text>
        </g>
      );
    case 'jni':
      return (
        <g transform="translate(12 40)" fontFamily={mono} fontSize={8}>
          <text fill="var(--color-fg-muted)">
            <tspan fill="var(--color-rt-300)">jint</tspan> Java_NativeMath_add(
            <tspan fill="var(--color-rt-300)">JNIEnv*</tspan>, jclass, jint, jint)
          </text>
          <text y={14} fill={faint}>
            local refs · global refs · thread state: in Java ⇄ in native
          </text>
        </g>
      );
    case 'native-libraries':
      return (
        <g transform="translate(12 40)" fontFamily={mono} fontSize={8} fill={faint}>
          <text>libjava · libnio · libnet · libzip · libnativemath.so</text>
        </g>
      );
    default:
      return null;
  }
}
