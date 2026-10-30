import type { Dissection, DissectionProps } from '../types';
import { Arrow, Box, Kicker, Part, Text, TONE, type Tone } from '../kit';

type RegionType = 'E' | 'S' | 'O' | 'H' | 'h' | 'F';

// Illustrative G1 region map (12 × 6). 'h' continues a humongous object.
const MAP = [
  'EEOOFESOOFOO',
  'OEEFOOEHhhFO',
  'FOEEOSFOEOOF',
  'EOFOEOOFEEOS',
  'OOEFOEFOOEFO',
  'FEOOFOEOFFOE',
];

const TYPE: Record<
  RegionType,
  { part: string; tone: Tone; letter: string; label: string; fill: number }
> = {
  E: { part: 'eden', tone: 'rt', letter: 'E', label: 'Eden', fill: 0.45 },
  S: { part: 'survivor', tone: 'exec', letter: 'S', label: 'Survivor', fill: 0.4 },
  O: { part: 'old', tone: 'idle', letter: 'O', label: 'Old', fill: 0.35 },
  H: { part: 'humongous', tone: 'warn', letter: 'H', label: 'Humongous', fill: 0.35 },
  h: { part: 'humongous', tone: 'warn', letter: '', label: 'Humongous', fill: 0.35 },
  F: { part: 'free', tone: 'idle', letter: '', label: 'Free', fill: 0 },
};

const CELL = 34;
const GAP = 6;
const BYTE = 21;

function ByteBar({
  x,
  y,
  title,
  segments,
  active,
  onPart,
}: {
  x: number;
  y: number;
  title: string;
  segments: { part: string; label: string; bytes: number; tone: Tone; hatch?: boolean }[];
  active: string | null;
  onPart: (id: string) => void;
}) {
  const starts = segments.map((_, i) =>
    segments.slice(0, i).reduce((sum, segment) => sum + segment.bytes, 0),
  );
  const total = segments.reduce((sum, segment) => sum + segment.bytes, 0);
  return (
    <g>
      <Text x={x} y={y - 10} size={12} color="var(--color-fg-muted)">
        {title}
      </Text>
      {segments.map((segment, i) => {
        const start = starts[i]!;
        const sx = x + start * BYTE;
        const w = segment.bytes * BYTE;
        return (
          <Part
            key={`${segment.part}-${start}`}
            id={segment.part}
            label={`${segment.label}: ${segment.bytes} bytes at offset ${start}`}
            active={active === segment.part}
            onPart={onPart}
          >
            <Box
              x={sx}
              y={y}
              w={w}
              h={34}
              tone={segment.tone}
              radius={3}
              active={active === segment.part}
              dash={segment.hatch ? 'ghost' : 'solid'}
            />
            <Text x={sx + w / 2} y={y + 15} size={11} anchor="middle" weight={600}>
              {segment.label}
            </Text>
            <Text
              x={sx + w / 2}
              y={y + 28}
              size={9.5}
              mono
              anchor="middle"
              color="var(--color-fg-subtle)"
            >
              {segment.bytes} B
            </Text>
            <Text x={sx} y={y + 48} size={9.5} mono anchor="middle" color="var(--color-fg-subtle)">
              {start}
            </Text>
          </Part>
        );
      })}
      <Text
        x={x + total * BYTE}
        y={y + 48}
        size={9.5}
        mono
        anchor="middle"
        color="var(--color-fg-subtle)"
      >
        {total}
      </Text>
    </g>
  );
}

function HeapPlate({ activePart, onPart }: DissectionProps) {
  const activeType = (Object.keys(TYPE) as RegionType[]).find((t) => TYPE[t].part === activePart);
  return (
    <g>
      <Kicker x={0} y={10}>
        G1 HEAP · EQUAL-SIZED REGIONS, ROLES CHANGE AT EVERY COLLECTION
      </Kicker>
      <g aria-hidden transform="translate(0 26)">
        {MAP.flatMap((row, r) =>
          [...row].map((code, c) => {
            const type = TYPE[code as RegionType];
            const t = TONE[type.tone];
            const lit = !activeType || type.part === TYPE[activeType].part;
            const wide = code === 'H';
            return (
              <g
                key={`${r}-${c}`}
                transform={`translate(${c * (CELL + GAP)} ${r * (CELL + GAP)})`}
                opacity={lit ? 1 : 0.25}
                onClick={(event) => {
                  event.stopPropagation();
                  onPart(type.part);
                }}
                className="cursor-pointer"
              >
                <rect
                  width={wide ? CELL * 3 + GAP * 2 : code === 'h' ? 0 : CELL}
                  height={CELL}
                  rx={3}
                  fill={type.fill ? t.stroke : 'none'}
                  fillOpacity={type.fill}
                  stroke={t.stroke}
                  strokeOpacity={code === 'F' ? 0.45 : 0.9}
                  strokeDasharray={code === 'F' ? '2 2' : undefined}
                />
                {type.letter && (
                  <text
                    x={wide ? (CELL * 3 + GAP * 2) / 2 : CELL / 2}
                    y={CELL / 2 + 4}
                    textAnchor="middle"
                    fontSize={11.5}
                    fontWeight={600}
                    fill="var(--color-fg)"
                  >
                    {wide ? 'H · one large object' : type.letter}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </g>

      <g transform="translate(0 286)">
        {(['E', 'S', 'O', 'H', 'F'] as RegionType[]).map((code, i) => {
          const type = TYPE[code];
          return (
            <Part
              key={code}
              id={type.part}
              label={`${type.label} regions`}
              active={activePart === type.part}
              onPart={onPart}
            >
              <Box
                x={i * 96}
                y={0}
                w={88}
                h={30}
                tone={type.tone}
                dash={code === 'F' ? 'ghost' : 'hotspot'}
                active={activePart === type.part}
                radius={5}
              />
              <Text x={i * 96 + 44} y={19} size={11.5} anchor="middle" weight={600}>
                {type.label}
              </Text>
            </Part>
          );
        })}
      </g>

      {/* TLAB zoom */}
      <Arrow
        points={[
          { x: 17, y: 26 },
          { x: 17, y: 14 },
          { x: 540, y: 14 },
          { x: 540, y: 36 },
        ]}
        tone="idle"
        dashed="3 3"
        marker="ij-arrow-data"
      />
      <Kicker x={540} y={10}>
        ONE EDEN REGION, ZOOMED · TLABS
      </Kicker>
      <Part
        id="tlab"
        label="Thread-local allocation buffers"
        active={activePart === 'tlab'}
        onPart={onPart}
      >
        <Box
          x={540}
          y={40}
          w={460}
          h={120}
          tone="rt"
          dash="hotspot"
          active={activePart === 'tlab'}
        />
        <Text x={556} y={62} size={11} mono color="var(--color-fg-subtle)">
          TLAB · thread main
        </Text>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={556 + i * 58}
            y={70}
            width={52}
            height={30}
            rx={3}
            fill="var(--color-rt-500)"
            fillOpacity={0.35}
            stroke="var(--color-rt-400)"
          />
        ))}
        <rect
          x={730}
          y={70}
          width={70}
          height={30}
          rx={3}
          fill="var(--color-ok-500)"
          fillOpacity={0.25}
          stroke="var(--color-ok-400)"
        />
        <Text x={765} y={89} size={10} mono anchor="middle" color="var(--color-ok-300)">
          Person 16 B
        </Text>
        <rect
          x={806}
          y={70}
          width={176}
          height={30}
          rx={3}
          fill="none"
          stroke="var(--color-idle-400)"
          strokeDasharray="3 3"
        />
        <Text x={894} y={89} size={10} mono anchor="middle" color="var(--color-fg-subtle)">
          free in this TLAB
        </Text>
        <Arrow
          points={[
            { x: 806, y: 128 },
            { x: 806, y: 104 },
          ]}
          tone="ok"
        />
        <Text x={806} y={142} size={10} mono anchor="middle" color="var(--color-ok-300)">
          top (bump pointer)
        </Text>
        <Text x={982} y={142} size={10} mono anchor="end" color="var(--color-fg-subtle)">
          end
        </Text>
      </Part>
      <Part
        id="tlab-other"
        label="Another thread's TLAB"
        active={activePart === 'tlab-other'}
        onPart={onPart}
      >
        <Box
          x={540}
          y={172}
          w={460}
          h={70}
          tone="rt"
          dash="hotspot"
          active={activePart === 'tlab-other'}
        />
        <Text x={556} y={194} size={11} mono color="var(--color-fg-subtle)">
          TLAB · another thread
        </Text>
        {[0, 1].map((i) => (
          <rect
            key={i}
            x={556 + i * 58}
            y={202}
            width={52}
            height={28}
            rx={3}
            fill="var(--color-rt-500)"
            fillOpacity={0.35}
            stroke="var(--color-rt-400)"
          />
        ))}
        <rect
          x={672}
          y={202}
          width={310}
          height={28}
          rx={3}
          fill="none"
          stroke="var(--color-idle-400)"
          strokeDasharray="3 3"
        />
      </Part>

      {/* Object layout */}
      <Kicker x={0} y={372}>
        OBJECT LAYOUT · MEASURED ON OPENJDK 25.0.4 X64 · OFFSETS IN BYTES
      </Kicker>
      <ByteBar
        x={0}
        y={410}
        title="Person instance · default flags (compressed class pointers and oops) = 16 bytes"
        active={activePart}
        onPart={onPart}
        segments={[
          { part: 'mark-word', label: 'mark word', bytes: 8, tone: 'rt' },
          { part: 'klass', label: 'class ptr', bytes: 4, tone: 'exec' },
          { part: 'fields', label: 'name', bytes: 4, tone: 'ok' },
        ]}
      />
      <ByteBar
        x={0}
        y={500}
        title="Person with -XX:+UseCompactObjectHeaders (JEP 519) = 16 bytes"
        active={activePart}
        onPart={onPart}
        segments={[
          { part: 'compact', label: 'header (mark + class)', bytes: 8, tone: 'rt' },
          { part: 'fields', label: 'name', bytes: 4, tone: 'ok' },
          { part: 'padding', label: 'pad', bytes: 4, tone: 'idle', hatch: true },
        ]}
      />
      <ByteBar
        x={0}
        y={590}
        title="new int[3] · default flags = 32 bytes"
        active={activePart}
        onPart={onPart}
        segments={[
          { part: 'mark-word', label: 'mark word', bytes: 8, tone: 'rt' },
          { part: 'klass', label: 'class ptr', bytes: 4, tone: 'exec' },
          { part: 'array-length', label: 'length', bytes: 4, tone: 'exec' },
          { part: 'fields', label: '3 × int', bytes: 12, tone: 'ok' },
          { part: 'padding', label: 'pad', bytes: 4, tone: 'idle', hatch: true },
        ]}
      />

      <Part
        id="mark-word"
        label="Mark word bit layout"
        active={activePart === 'mark-word'}
        onPart={onPart}
      >
        <Box x={720} y={400} w={280} h={156} tone="rt" active={activePart === 'mark-word'} />
        <Text x={736} y={424} size={12} weight={600}>
          Mark word, 64 bits (JDK 25)
        </Text>
        {[
          ['unused', 22],
          ['identity hash', 31],
          ['gap', 4],
          ['age', 4],
          ['fwd', 1],
          ['lock', 2],
        ].map(([label, bits], i, all) => {
          const before = all.slice(0, i).reduce((sum, [, b]) => sum + (b as number), 0);
          const x = 736 + (before / 64) * 248;
          const w = ((bits as number) / 64) * 248;
          return (
            <g key={label as string}>
              <rect
                x={x}
                y={438}
                width={w}
                height={22}
                fill="var(--color-rt-500)"
                fillOpacity={0.12 + i * 0.07}
                stroke="var(--color-rt-400)"
                strokeWidth={0.7}
              />
              {(bits as number) >= 20 && (
                <text
                  x={x + w / 2}
                  y={453}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontFamily="var(--font-mono)"
                  fill="var(--color-fg-muted)"
                >
                  {label} {bits}
                </text>
              )}
            </g>
          );
        })}
        <Text x={984} y={474} size={8.5} mono anchor="end" color="var(--color-fg-subtle)">
          gap 4 · age 4 · fwd 1 · lock 2 →
        </Text>
        <Text x={736} y={474} size={8.5} mono color="var(--color-fg-subtle)">
          bit 63
        </Text>
        <Text x={736} y={514} size={10.5} color="var(--color-fg-muted)">
          age = survived young GCs (max 15) · lock bits:
        </Text>
        <Text x={736} y={530} size={10.5} color="var(--color-fg-muted)">
          unlocked / locked / monitor · fwd = self-forwarded
        </Text>
        <Text x={736} y={546} size={10.5} color="var(--color-fg-subtle)">
          With compact headers, 22 bits hold the class pointer.
        </Text>
      </Part>
    </g>
  );
}

export const heapDissection: Dissection = {
  id: 'heap',
  title: 'Inside the heap',
  subtitle: 'G1 regions · TLAB allocation · object layout (HotSpot, JDK 25)',
  bounds: { x: -24, y: -10, w: 1050, h: 680 },
  accuracyNote:
    'The region map is illustrative: a real G1 heap has hundreds or thousands of regions (2 MB each in our measured run) and their roles change at every collection. Object sizes and offsets were measured with `Unsafe.objectFieldOffset` and `arrayBaseOffset` on OpenJDK 25.0.4 x64; other JVMs, flags and platforms lay objects out differently.',
  parts: [
    {
      id: 'eden',
      label: 'Eden regions',
      componentId: 'eden',
      description:
        'Where new objects are allocated, inside per-thread TLABs. A young collection evacuates their live objects and frees the regions whole.',
    },
    {
      id: 'survivor',
      label: 'Survivor regions',
      componentId: 'survivor',
      description:
        'Objects that survived at least one young collection while they age (age is kept in the mark word).',
    },
    {
      id: 'old',
      label: 'Old regions',
      componentId: 'old-generation',
      description:
        'Long-lived, promoted objects. G1 reclaims them incrementally in mixed collections after concurrent marking.',
    },
    {
      id: 'humongous',
      label: 'Humongous regions',
      description:
        'An object of at least half a region is allocated directly in one or more contiguous humongous regions, which belong to the old generation.',
    },
    {
      id: 'free',
      label: 'Free regions',
      description: 'Empty regions available to become eden, survivor, old or humongous regions.',
    },
    {
      id: 'tlab',
      label: 'Thread-local allocation buffer (TLAB)',
      description:
        'A chunk of eden owned by one thread. Allocation is a pointer bump (`top += size`) with no locking; when the TLAB is full the thread gets a new one.',
    },
    {
      id: 'tlab-other',
      label: "Another thread's TLAB",
      description:
        'Each thread allocates in its own TLAB, so threads do not contend on allocation. TLAB sizes adapt per thread (`ResizeTLAB`).',
    },
    {
      id: 'mark-word',
      label: 'Mark word',
      description:
        '8 bytes of per-object runtime state: identity hash code, GC age, lock state and a forwarding bit. Layout from `markWord.hpp` in JDK 25.',
    },
    {
      id: 'klass',
      label: 'Compressed class pointer',
      description:
        "A 4-byte encoded pointer to the class's `Klass` in the compressed class space (Metaspace). Without compressed class pointers it is 8 bytes.",
    },
    {
      id: 'fields',
      label: 'Instance fields / elements',
      description:
        '`Person.name` is a 4-byte compressed reference at offset 12 (offset 8 with compact headers). Array elements start at offset 16 (12 with compact headers).',
    },
    {
      id: 'padding',
      label: 'Alignment padding',
      description:
        'Objects are aligned to `ObjectAlignmentInBytes` = 8, so sizes round up to a multiple of 8.',
    },
    {
      id: 'compact',
      label: 'Compact object header (JEP 519)',
      description:
        'With `-XX:+UseCompactObjectHeaders` (a product option in JDK 25, off by default) the class pointer is folded into the mark word, giving an 8-byte header.',
    },
    {
      id: 'array-length',
      label: 'Array length',
      description:
        'Arrays carry a 4-byte length after the header, so `int[3]` has 16 bytes of header and length before its first element.',
    },
  ],
  references: [
    { source: 'src-markword' },
    { source: 'src-tlab' },
    { source: 'jep-519' },
    { source: 'guide-gc' },
    { source: 'jvms-2.7' },
  ],
  Plate: HeapPlate,
};
