import type { Dissection, DissectionProps } from '../types';
import { Arrow, Box, Kicker, Part, Text, type Tone } from '../kit';

/* ───────────────────────── Interpreter dispatch ───────────────────────── */

const BYTES = [
  'bb',
  '00',
  '07',
  '59',
  '12',
  '09',
  'b7',
  '00',
  '0b',
  '4c',
  '2b',
  '4d',
  'b2',
  '00',
  '0e',
  '2c',
];
const TABLE: [string, string][] = [
  ['0x12', 'ldc'],
  ['0x2b', 'aload_1'],
  ['0x4c', 'astore_1'],
  ['0x59', 'dup'],
  ['0xb2', 'getstatic'],
  ['0xb6', 'invokevirtual'],
  ['0xb7', 'invokespecial'],
  ['0xbb', 'new'],
];

function InterpreterPlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <Kicker x={0} y={10}>
        BYTECODE OF MAIN() IN MEMORY · FIRST 16 OF 27 BYTES
      </Kicker>
      <Part id="bytes" label="Bytecode bytes" active={activePart === 'bytes'} onPart={onPart}>
        <Box x={0} y={22} w={680} h={52} tone="rt" active={activePart === 'bytes'} />
        {BYTES.map((byte, i) => (
          <g key={i}>
            <rect
              x={12 + i * 41}
              y={32}
              width={36}
              height={30}
              rx={3}
              fill={i === 0 ? 'var(--color-exec-500)' : 'var(--color-ink-750)'}
              fillOpacity={i === 0 ? 0.3 : 1}
              stroke={i === 0 ? 'var(--color-exec-300)' : 'var(--color-ink-500)'}
            />
            <Text
              x={30 + i * 41}
              y={52}
              size={12}
              mono
              anchor="middle"
              color={i === 0 ? 'var(--color-exec-200)' : 'var(--color-fg-muted)'}
            >
              {byte}
            </Text>
          </g>
        ))}
      </Part>
      <Part id="bcp" label="Bytecode pointer" active={activePart === 'bcp'} onPart={onPart}>
        <Box
          x={0}
          y={104}
          w={170}
          h={48}
          tone="exec"
          dash="hotspot"
          active={activePart === 'bcp'}
        />
        <Text x={14} y={124} size={12} weight={600}>
          bcp (r13)
        </Text>
        <Text x={14} y={142} size={10} mono color="var(--color-fg-subtle)">
          → offset 0
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 30, y: 104 },
          { x: 30, y: 64 },
        ]}
        tone="exec"
      />

      <Part id="fetch" label="Fetch the opcode" active={activePart === 'fetch'} onPart={onPart}>
        <Box
          x={210}
          y={104}
          w={200}
          h={48}
          tone="exec"
          dash="hotspot"
          active={activePart === 'fetch'}
        />
        <Text x={224} y={124} size={12} weight={600}>
          1 · fetch byte at bcp
        </Text>
        <Text x={224} y={142} size={10} mono color="var(--color-fg-subtle)">
          0xbb
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 170, y: 128 },
          { x: 208, y: 128 },
        ]}
        tone="exec"
      />

      <Part id="table" label="Dispatch table" active={activePart === 'table'} onPart={onPart}>
        <Box
          x={0}
          y={190}
          w={300}
          h={296}
          tone="exec"
          dash="hotspot"
          active={activePart === 'table'}
        />
        <Text x={14} y={212} size={12} weight={600}>
          2 · dispatch table (256 entries)
        </Text>
        {TABLE.map(([code, name], i) => (
          <g key={code}>
            {code === '0xbb' && (
              <rect
                x={10}
                y={224 + i * 30}
                width={280}
                height={24}
                rx={3}
                fill="var(--color-exec-500)"
                fillOpacity={0.22}
              />
            )}
            <Text x={22} y={241 + i * 30} size={11} mono color="var(--color-fg-subtle)">
              {code}
            </Text>
            <Text
              x={78}
              y={241 + i * 30}
              size={11}
              mono
              color={code === '0xbb' ? 'var(--color-exec-200)' : 'var(--color-fg-muted)'}
            >
              {name}
            </Text>
            <Text
              x={280}
              y={241 + i * 30}
              size={10}
              mono
              anchor="end"
              color="var(--color-fg-subtle)"
            >
              → template
            </Text>
          </g>
        ))}
      </Part>
      <Arrow
        points={[
          { x: 310, y: 152 },
          { x: 310, y: 170 },
          { x: 150, y: 170 },
          { x: 150, y: 188 },
        ]}
        tone="exec"
      />

      <Part
        id="template"
        label="Machine-code template for new"
        active={activePart === 'template'}
        onPart={onPart}
      >
        <Box
          x={360}
          y={190}
          w={330}
          h={180}
          tone="exec"
          dash="hotspot"
          active={activePart === 'template'}
        />
        <Text x={376} y={212} size={12} weight={600}>
          3 · template for new (machine code)
        </Text>
        {[
          'class #7 resolved and initialized?',
          '  yes → bump pointer in the TLAB',
          '        write header, zero fields',
          '  no  → call into the runtime (slow path)',
          'push reference (top of stack in rax)',
          'advance bcp by 3',
        ].map((line, i) => (
          <Text key={i} x={376} y={238 + i * 20} size={10.5} mono color="var(--color-fg-muted)">
            {line}
          </Text>
        ))}
      </Part>
      <Arrow
        points={[
          { x: 300, y: 391 },
          { x: 330, y: 391 },
          { x: 330, y: 280 },
          { x: 358, y: 280 },
        ]}
        tone="exec"
      />

      <Part
        id="next"
        label="Dispatch the next instruction"
        active={activePart === 'next'}
        onPart={onPart}
      >
        <Box
          x={360}
          y={392}
          w={330}
          h={94}
          tone="exec"
          dash="hotspot"
          active={activePart === 'next'}
        />
        <Text x={376} y={414} size={12} weight={600}>
          4 · dispatch next
        </Text>
        <Text x={376} y={436} size={10.5} mono color="var(--color-fg-muted)">
          load byte at bcp (0x59 dup)
        </Text>
        <Text x={376} y={456} size={10.5} mono color="var(--color-fg-muted)">
          jump through table[0x59]
        </Text>
        <Text x={376} y={474} size={10} mono color="var(--color-fg-subtle)">
          no central loop: templates chain
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 525, y: 370 },
          { x: 525, y: 390 },
        ]}
        tone="exec"
      />

      <Part
        id="counters"
        label="Counters and profiling"
        active={activePart === 'counters'}
        onPart={onPart}
      >
        <Box
          x={730}
          y={190}
          w={270}
          h={110}
          tone="exec"
          dash="hotspot"
          active={activePart === 'counters'}
        />
        <Text x={744} y={212} size={12} weight={600}>
          Counters &amp; profiles
        </Text>
        <Text x={744} y={234} size={10.5} color="var(--color-fg-muted)">
          Method entry and loop back-edges
        </Text>
        <Text x={744} y={250} size={10.5} color="var(--color-fg-muted)">
          increment counters; the policy
        </Text>
        <Text x={744} y={266} size={10.5} color="var(--color-fg-muted)">
          decides when to compile.
        </Text>
      </Part>
      <Part
        id="safepoint"
        label="Safepoint polls"
        active={activePart === 'safepoint'}
        onPart={onPart}
      >
        <Box
          x={730}
          y={316}
          w={270}
          h={80}
          tone="warn"
          dash="hotspot"
          active={activePart === 'safepoint'}
        />
        <Text x={744} y={338} size={12} weight={600}>
          Safepoint polls
        </Text>
        <Text x={744} y={360} size={10.5} color="var(--color-fg-muted)">
          At returns and back-edges the thread
        </Text>
        <Text x={744} y={376} size={10.5} color="var(--color-fg-muted)">
          checks whether the VM asked it to stop.
        </Text>
      </Part>
      <Part
        id="generated"
        label="Generated at start-up"
        active={activePart === 'generated'}
        onPart={onPart}
      >
        <Box x={730} y={412} w={270} h={74} tone="idle" active={activePart === 'generated'} />
        <Text x={744} y={434} size={12} weight={600}>
          Generated at JVM start-up
        </Text>
        <Text x={744} y={456} size={10.5} color="var(--color-fg-muted)">
          into the code cache (non-nmethods).
        </Text>
      </Part>
    </g>
  );
}

export const interpreterDissection: Dissection = {
  id: 'interpreter',
  title: 'How the template interpreter runs new',
  subtitle: 'Fetch, dispatch through a table, run a machine-code template (HotSpot, JDK 25)',
  bounds: { x: -20, y: -10, w: 1040, h: 510 },
  accuracyNote:
    "Bytes are the real first 16 bytes of `Main.main` read from the class file. The template steps are a simplified description of HotSpot's x86-64 `new` template; the real code also handles uncommon cases such as classes that need initialization, finalizers and allocation outside TLABs.",
  parts: [
    {
      id: 'bytes',
      label: 'Bytecode bytes',
      componentId: 'method-area',
      description:
        "`bb 00 07` is `new #7`, `59` is `dup`, `12 09` is `ldc #9`, `b7 00 0b` is `invokespecial #11`. The bytecode lives in the method's `ConstMethod`.",
    },
    {
      id: 'bcp',
      label: 'Bytecode pointer',
      componentId: 'pc-register',
      description: 'On x86-64 HotSpot keeps the bytecode pointer in `r13` while interpreting.',
    },
    {
      id: 'fetch',
      label: 'Fetch',
      description: 'The interpreter reads the opcode byte at bcp: 0xbb.',
    },
    {
      id: 'table',
      label: 'Dispatch table',
      description:
        'An array of addresses, one per opcode (and per top-of-stack state). Indexing it with 0xbb gives the address of the `new` template.',
    },
    {
      id: 'template',
      label: 'Template',
      description:
        'Machine code generated once per bytecode at start-up. The fast path of `new` allocates in the TLAB without calling into C++.',
    },
    {
      id: 'next',
      label: 'Dispatch next',
      description:
        'Each template ends by loading the next opcode and jumping through the table, so control flows from template to template.',
    },
    {
      id: 'counters',
      label: 'Counters',
      componentId: 'profiler',
      description: 'Invocation and back-edge counters feed the tiered compilation policy.',
    },
    {
      id: 'safepoint',
      label: 'Safepoint polls',
      description:
        'Polls let the VM stop all Java threads for GC or other VM operations at well-defined points.',
    },
    {
      id: 'generated',
      label: 'Generated code',
      componentId: 'code-cache',
      description:
        "The interpreter is itself machine code produced at start-up and stored in the code cache's non-nmethods segment.",
    },
  ],
  references: [
    { source: 'jvms-2.11' },
    { source: 'src-template-interpreter' },
    { source: 'src-template-table' },
    { source: 'src-interp-masm-x86' },
    { source: 'jvms-6.5-new' },
  ],
  Plate: InterpreterPlate,
};

/* ───────────────────────── Tiered compilation ───────────────────────── */

const LEVELS: {
  id: string;
  level: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  tone: Tone;
}[] = [
  {
    id: 'level-0',
    level: '0',
    title: 'Interpreter',
    detail: 'counters (+ profiling)',
    x: 70,
    y: 220,
    tone: 'rt',
  },
  {
    id: 'level-3',
    level: '3',
    title: 'C1 + full profiling',
    detail: 'fills MethodData',
    x: 400,
    y: 90,
    tone: 'exec',
  },
  {
    id: 'level-2',
    level: '2',
    title: 'C1 + counters',
    detail: 'when C2 is busy',
    x: 400,
    y: 350,
    tone: 'exec',
  },
  {
    id: 'level-4',
    level: '4',
    title: 'C2',
    detail: 'profile-guided, peak',
    x: 730,
    y: 220,
    tone: 'exec',
  },
  {
    id: 'level-1',
    level: '1',
    title: 'C1, no profiling',
    detail: 'trivial methods',
    x: 730,
    y: 430,
    tone: 'exec',
  },
];

function JitPlate({ activePart, onPart }: DissectionProps) {
  const at = (id: string) => LEVELS.find((l) => l.id === id)!;
  const node = (id: string) => {
    const l = at(id);
    const active = activePart === id;
    return (
      <Part key={id} id={id} label={`Level ${l.level}: ${l.title}`} active={active} onPart={onPart}>
        <Box
          x={l.x - 90}
          y={l.y - 38}
          w={180}
          h={76}
          tone={l.tone}
          dash={l.id === 'level-0' ? 'solid' : 'hotspot'}
          active={active}
          radius={38}
        />
        <Text x={l.x} y={l.y - 12} size={11} mono anchor="middle" color="var(--color-fg-subtle)">
          LEVEL {l.level}
        </Text>
        <Text x={l.x} y={l.y + 6} size={13} anchor="middle" weight={600}>
          {l.title}
        </Text>
        <Text x={l.x} y={l.y + 23} size={10} mono anchor="middle" color="var(--color-fg-subtle)">
          {l.detail}
        </Text>
      </Part>
    );
  };
  return (
    <g>
      <Kicker x={0} y={10}>
        TIERED COMPILATION · compilationPolicy.hpp
      </Kicker>
      <Arrow
        points={[
          { x: 160, y: 205 },
          { x: 236, y: 205 },
          { x: 236, y: 90 },
          { x: 308, y: 90 },
        ]}
        tone="exec"
        width={2.4}
      />
      <Text x={176} y={78} size={10.5} mono color="var(--color-exec-200)">
        common path
      </Text>
      <Text x={176} y={94} size={9.5} mono color="var(--color-fg-subtle)">
        Tier3: 200 calls
      </Text>
      <Text x={176} y={108} size={9.5} mono color="var(--color-fg-subtle)">
        or 2000 calls+loops
      </Text>
      <Arrow
        points={[
          { x: 490, y: 90 },
          { x: 560, y: 90 },
          { x: 560, y: 205 },
          { x: 638, y: 205 },
        ]}
        tone="exec"
        width={2.4}
      />
      <Text x={576} y={110} size={9.5} mono color="var(--color-fg-subtle)">
        Tier4: 5000 calls
      </Text>
      <Text x={576} y={124} size={9.5} mono color="var(--color-fg-subtle)">
        or 15000 calls+loops
      </Text>
      <Arrow
        points={[
          { x: 160, y: 235 },
          { x: 236, y: 235 },
          { x: 236, y: 350 },
          { x: 308, y: 350 },
        ]}
        tone="exec"
        dashed="5 4"
      />
      <Arrow
        points={[
          { x: 400, y: 312 },
          { x: 400, y: 130 },
        ]}
        tone="exec"
        dashed="5 4"
      />
      <Text x={410} y={225} size={9.5} mono color="var(--color-fg-subtle)">
        C2 queue shortens
      </Text>
      <Arrow
        points={[
          { x: 490, y: 110 },
          { x: 600, y: 110 },
          { x: 600, y: 430 },
          { x: 638, y: 430 },
        ]}
        tone="idle"
        dashed="2 3"
      />
      <Text x={612} y={330} size={9.5} mono color="var(--color-fg-subtle)">
        trivial
      </Text>

      <Part
        id="deopt"
        label="Deoptimization back to level 0"
        active={activePart === 'deopt'}
        onPart={onPart}
      >
        <Arrow
          points={[
            { x: 730, y: 260 },
            { x: 730, y: 300 },
            { x: 70, y: 300 },
            { x: 70, y: 260 },
          ]}
          tone="warn"
          dashed="9 3 2 3"
          marker="ij-arrow-exception"
        />
        <rect
          x={250}
          y={290}
          width={160}
          height={20}
          rx={4}
          fill="var(--color-ink-900)"
          stroke="var(--color-warn-500)"
          strokeOpacity={0.6}
        />
        <Text x={330} y={304} size={10} mono anchor="middle" color="var(--color-warn-300)">
          deoptimization
        </Text>
      </Part>

      {LEVELS.map((l) => node(l.id))}

      <Part
        id="queues"
        label="Compile queues and compiler threads"
        active={activePart === 'queues'}
        onPart={onPart}
      >
        <Box
          x={880}
          y={60}
          w={160}
          h={190}
          tone="exec"
          dash="hotspot"
          active={activePart === 'queues'}
        />
        <Text x={894} y={84} size={12} weight={600}>
          Compiler threads
        </Text>
        <Text x={894} y={106} size={10.5} color="var(--color-fg-muted)">
          CICompilerCount = 3
        </Text>
        <Text x={894} y={122} size={10.5} color="var(--color-fg-muted)">
          (4 CPUs, ergonomic)
        </Text>
        <Text x={894} y={150} size={10.5} mono color="var(--color-exec-200)">
          C1 queue → 1 thread
        </Text>
        <Text x={894} y={170} size={10.5} mono color="var(--color-exec-200)">
          C2 queue → 2 threads
        </Text>
        <Text x={894} y={198} size={10} color="var(--color-fg-subtle)">
          background: the app
        </Text>
        <Text x={894} y={214} size={10} color="var(--color-fg-subtle)">
          keeps running
        </Text>
      </Part>
      <Part id="osr" label="On-stack replacement" active={activePart === 'osr'} onPart={onPart}>
        <Box
          x={880}
          y={270}
          w={160}
          h={130}
          tone="exec"
          dash="hotspot"
          active={activePart === 'osr'}
        />
        <Text x={894} y={294} size={12} weight={600}>
          OSR (%)
        </Text>
        <Text x={894} y={316} size={10.5} color="var(--color-fg-muted)">
          Back-edge counts
        </Text>
        <Text x={894} y={332} size={10.5} color="var(--color-fg-muted)">
          compile a hot loop
        </Text>
        <Text x={894} y={348} size={10.5} color="var(--color-fg-muted)">
          and enter it mid-
        </Text>
        <Text x={894} y={364} size={10.5} color="var(--color-fg-muted)">
          execution.
        </Text>
      </Part>
    </g>
  );
}

export const jitDissection: Dissection = {
  id: 'jit-compiler',
  title: 'Tiered compilation',
  subtitle: 'How a method moves between the interpreter, C1 and C2 (HotSpot, JDK 25)',
  bounds: { x: -30, y: -10, w: 1090, h: 500 },
  accuracyNote:
    'Levels and transitions follow the description in `compilationPolicy.hpp` (JDK 25). Thresholds are the JDK 25 defaults reported by `-XX:+PrintFlagsFinal`; the policy scales them with compiler-queue load, so real transitions happen earlier or later. Thread counts are those of our 4-CPU test machine.',
  parts: [
    {
      id: 'level-0',
      label: 'Level 0 · interpreter',
      componentId: 'interpreter',
      description: 'Every method starts here. Counters (and, when needed, profiles) are recorded.',
    },
    {
      id: 'level-3',
      label: 'Level 3 · C1 with full profiling',
      componentId: 'c1',
      description:
        "The usual first compilation. The code fills the method's MethodData with type and branch profiles for C2.",
    },
    {
      id: 'level-2',
      label: 'Level 2 · C1 with counters',
      componentId: 'c1',
      description:
        'Used when the C2 queue is long: faster than level 3, then recompiled at level 3 once C2 can catch up.',
    },
    {
      id: 'level-4',
      label: 'Level 4 · C2',
      componentId: 'c2',
      description: 'Fully optimized, profile-guided code. Most hot code ends up here.',
    },
    {
      id: 'level-1',
      label: 'Level 1 · C1 without profiling',
      componentId: 'c1',
      description: 'For trivial methods (such as simple getters) where C2 would not do better.',
    },
    {
      id: 'deopt',
      label: 'Deoptimization',
      componentId: 'deoptimization',
      description:
        'A failed speculation sends execution back to level 0; the method can climb the tiers again with better profiles.',
    },
    {
      id: 'queues',
      label: 'Compile queues',
      componentId: 'compilation',
      description:
        'Compile tasks wait in a queue per compiler. With 3 compiler threads, HotSpot assigns one third (at least one) to C1 and the rest to C2.',
    },
    {
      id: 'osr',
      label: 'On-stack replacement',
      componentId: 'compilation',
      description:
        'Long-running loops are compiled separately (`%` in `PrintCompilation`) and the running interpreter frame is migrated into the compiled loop.',
    },
  ],
  references: [
    { source: 'src-compilation-policy' },
    { source: 'src-compilebroker' },
    { source: 'src-methoddata' },
  ],
  Plate: JitPlate,
};

/* ───────────────────────── Code cache ───────────────────────── */

function CodeCachePlate({ activePart, onPart }: DissectionProps) {
  const segment = (
    id: string,
    x: number,
    title: string,
    size: string,
    lines: string[],
    h: number,
  ) => (
    <Part id={id} label={`${title}, ${size}`} active={activePart === id} onPart={onPart}>
      <Box
        x={x}
        y={460 - h}
        w={180}
        h={h}
        tone="exec"
        dash="hotspot"
        active={activePart === id}
        radius={5}
      />
      <Text x={x + 12} y={460 - h + 22} size={12} weight={600}>
        {title}
      </Text>
      <Text x={x + 12} y={460 - h + 40} size={10.5} mono color="var(--color-exec-200)">
        {size}
      </Text>
      {lines.map((line, i) => (
        <Text
          key={line}
          x={x + 12}
          y={460 - h + 62 + i * 17}
          size={10.5}
          color="var(--color-fg-muted)"
        >
          {line}
        </Text>
      ))}
    </Part>
  );
  const sections: [string, string, string][] = [
    ['nm-header', 'header', 'nmethod structure'],
    ['nm-code', 'code body', 'machine instructions'],
    ['nm-code', 'exception handler · stubs', ''],
    ['nm-oops', 'oop table · metadata', 'heap and class references'],
    ['nm-deps', 'dependencies', 'assumptions to re-check'],
    ['nm-debug', 'implicit null table · handlers', ''],
    ['nm-debug', 'scopes data · scopes pcs', 'debug info for deopt'],
  ];
  return (
    <g>
      <Kicker x={0} y={10}>
        SEGMENTED CODE CACHE · 240 MB RESERVED (JDK 25, TIERED)
      </Kicker>
      {segment(
        'seg-non-nmethods',
        0,
        'non-nmethods',
        '5,700 KB',
        ['interpreter', 'adapters (i2c / c2i)', 'runtime stubs'],
        150,
      )}
      {segment(
        'seg-profiled',
        200,
        'profiled',
        '120,032 KB',
        ['tier 2 and 3', 'C1 code with', 'counters / profiling'],
        420,
      )}
      {segment(
        'seg-non-profiled',
        400,
        'non-profiled',
        '120,032 KB',
        ['tier 1 C1 code', 'tier 4 C2 code'],
        420,
      )}
      <Text x={0} y={486} size={10.5} color="var(--color-fg-subtle)">
        Heights not to scale for the small segment. Sizes from -XX:+PrintCodeCache on our machine.
      </Text>

      <Kicker x={640} y={10}>
        ONE NMETHOD (A COMPILED METHOD)
      </Kicker>
      {sections.map(([part, label, note], i) => {
        const y = 26 + i * 50;
        const active = activePart === part;
        return (
          <Part
            key={`${label}`}
            id={part}
            label={`nmethod ${label}`}
            active={active}
            onPart={onPart}
          >
            <Box
              x={640}
              y={y}
              w={380}
              h={42}
              tone={part === 'nm-code' ? 'exec' : part === 'nm-debug' ? 'rt' : 'idle'}
              dash="hotspot"
              active={active}
              radius={4}
            />
            <Text x={654} y={y + 18} size={11.5} weight={600}>
              {label}
            </Text>
            {note && (
              <Text x={654} y={y + 33} size={10} mono color="var(--color-fg-subtle)">
                {note}
              </Text>
            )}
          </Part>
        );
      })}
      <Part
        id="nm-states"
        label="nmethod life cycle"
        active={activePart === 'nm-states'}
        onPart={onPart}
      >
        <Box
          x={640}
          y={386}
          w={380}
          h={74}
          tone="warn"
          dash="hotspot"
          active={activePart === 'nm-states'}
        />
        <Text x={654} y={408} size={11.5} weight={600}>
          life cycle
        </Text>
        <Text x={654} y={430} size={10.5} mono color="var(--color-fg-muted)">
          in use → not entrant → unloaded
        </Text>
        <Text x={654} y={448} size={10} color="var(--color-fg-subtle)">
          not entrant: no new calls; existing frames finish or deoptimize
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 580, y: 250 },
          { x: 638, y: 250 },
        ]}
        tone="idle"
        dashed="3 3"
        marker="ij-arrow-data"
      />
    </g>
  );
}

export const codeCacheDissection: Dissection = {
  id: 'code-cache',
  title: 'Inside the code cache',
  subtitle: 'Three segments (JEP 197) and the anatomy of one compiled method',
  bounds: { x: -20, y: -10, w: 1060, h: 520 },
  accuracyNote:
    'Segment sizes are from `-XX:+PrintCodeCache` on OpenJDK 25.0.4 x64 with 4 CPUs; they are chosen ergonomically and differ per machine. The nmethod section list follows the layout comment in `nmethod.hpp` (JDK 25), simplified.',
  parts: [
    {
      id: 'seg-non-nmethods',
      label: 'Non-nmethod segment',
      description:
        'Code that lives as long as the VM: the template interpreter, call adapters between interpreted and compiled code, and runtime stubs.',
    },
    {
      id: 'seg-profiled',
      label: 'Profiled segment',
      componentId: 'c1',
      description:
        'Short-lived, instrumented C1 code (tiers 2 and 3), expected to be replaced by C2 code.',
    },
    {
      id: 'seg-non-profiled',
      label: 'Non-profiled segment',
      componentId: 'c2',
      description: 'Long-lived optimized code: C2 (tier 4) and trivial C1 (tier 1) methods.',
    },
    {
      id: 'nm-header',
      label: 'nmethod header',
      description: 'Identifies the method, its compile level and entry points.',
    },
    {
      id: 'nm-code',
      label: 'Code',
      componentId: 'cpu',
      description:
        'The machine instructions the CPU executes, plus exception handler and stub code.',
    },
    {
      id: 'nm-oops',
      label: 'Oops and metadata',
      componentId: 'gc-roots',
      description:
        'References to heap objects and class metadata embedded in the code. The GC treats them as roots and updates them when objects move.',
    },
    {
      id: 'nm-deps',
      label: 'Dependencies',
      componentId: 'deoptimization',
      description:
        'Assumptions such as "this class has no subclasses". Loading a class that breaks one invalidates the nmethod.',
    },
    {
      id: 'nm-debug',
      label: 'Debug information',
      componentId: 'deoptimization',
      description:
        'Maps machine pcs to methods, bytecode indexes and value locations, so HotSpot can build stack traces and rebuild interpreter frames.',
    },
    {
      id: 'nm-states',
      label: 'Life cycle',
      description:
        'An nmethod that should no longer be used is made "not entrant"; once no frames use it, it can be unloaded and its space reused.',
    },
  ],
  references: [{ source: 'jep-197' }, { source: 'src-codecache' }, { source: 'src-nmethod' }],
  Plate: CodeCachePlate,
};
