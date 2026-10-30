import type { Dissection, DissectionProps } from '../types';
import { Arrow, Box, Kicker, Part, Text, type Tone } from '../kit';

/* ───────────────────────── Thread stack (jvm-stack) ───────────────────────── */

function Slots({
  x,
  y,
  items,
  width = 66,
}: {
  x: number;
  y: number;
  items: string[];
  width?: number;
}) {
  return (
    <g>
      {items.map((item, i) => (
        <g key={i} transform={`translate(${x + i * (width + 4)} ${y})`}>
          <rect
            width={width}
            height={22}
            rx={3}
            fill="var(--color-ink-750)"
            stroke="var(--color-rt-500)"
            strokeOpacity={0.6}
          />
          <text
            x={4}
            y={9}
            fontSize={7.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-fg-subtle)"
          >
            {i}
          </text>
          <text
            x={width / 2 + 3}
            y={16}
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="var(--font-mono)"
            fill="var(--color-fg-muted)"
          >
            {item}
          </text>
        </g>
      ))}
    </g>
  );
}

function StackPlate({ activePart, onPart }: DissectionProps) {
  const zone = (id: string, label: string, y: number, h: number, tone: Tone, text: string) => (
    <Part id={id} label={label} active={activePart === id} onPart={onPart}>
      <Box
        x={0}
        y={y}
        w={460}
        h={h}
        tone={tone}
        dash="hotspot"
        active={activePart === id}
        radius={3}
      />
      <Text x={14} y={y + h / 2 + 4} size={11} weight={600}>
        {label}
      </Text>
      <Text x={446} y={y + h / 2 + 4} size={10} mono anchor="end" color="var(--color-fg-subtle)">
        {text}
      </Text>
    </Part>
  );

  return (
    <g>
      <Kicker x={0} y={10}>
        MAIN THREAD · WHILE PERSON.&lt;INIT&gt; EXECUTES PUTFIELD
      </Kicker>
      {zone('red-zone', 'Red zone', 24, 22, 'warn', 'fatal overflow · 1 page')}
      {zone('yellow-zone', 'Yellow zone', 50, 26, 'warn', 'StackOverflowError · 2 pages')}
      {zone('reserved-zone', 'Reserved zone', 80, 22, 'warn', '@ReservedStackAccess · 1 page')}

      <rect
        x={0}
        y={108}
        width={460}
        height={78}
        rx={3}
        fill="none"
        stroke="var(--color-idle-400)"
        strokeDasharray="3 4"
      />
      <Text x={230} y={152} size={11} anchor="middle" color="var(--color-fg-subtle)">
        unused stack · grows upward in this drawing (toward lower addresses on x86-64)
      </Text>

      <Part
        id="current-frame"
        label="Current frame: Person.<init>(String)"
        active={activePart === 'current-frame'}
        onPart={onPart}
      >
        <Box x={0} y={194} w={460} h={104} tone="exec" active={activePart === 'current-frame'} />
        <Text x={14} y={216} size={13} weight={600}>
          Person.&lt;init&gt;(String) · current frame
        </Text>
        <Text x={14} y={236} size={10} mono color="var(--color-fg-subtle)">
          locals
        </Text>
        <Slots x={64} y={224} items={['this', '"Alex"']} width={80} />
        <Text x={14} y={268} size={10} mono color="var(--color-fg-subtle)">
          stack
        </Text>
        <Slots x={64} y={256} items={['this', '"Alex"']} width={80} />
        <Text x={446} y={268} size={10} mono anchor="end" color="var(--color-exec-200)">
          pc 6 · putfield #7
        </Text>
      </Part>

      <Part
        id="caller-frame"
        label="Caller frame: Main.main(String[])"
        active={activePart === 'caller-frame'}
        onPart={onPart}
      >
        <Box x={0} y={306} w={460} h={104} tone="rt" active={activePart === 'caller-frame'} />
        <Text x={14} y={328} size={13} weight={600}>
          Main.main(String[])
        </Text>
        <Text x={14} y={348} size={10} mono color="var(--color-fg-subtle)">
          locals
        </Text>
        <Slots x={64} y={336} items={['args', '—', '—']} />
        <Text x={14} y={380} size={10} mono color="var(--color-fg-subtle)">
          stack
        </Text>
        <Slots x={64} y={368} items={['ref']} />
        <Text x={446} y={380} size={10} mono anchor="end" color="var(--color-fg-subtle)">
          resumes at pc 9 · astore_1
        </Text>
      </Part>

      <Part
        id="vm-frames"
        label="HotSpot call-stub frames"
        active={activePart === 'vm-frames'}
        onPart={onPart}
      >
        <Box
          x={0}
          y={418}
          w={460}
          h={50}
          tone="exec"
          dash="hotspot"
          active={activePart === 'vm-frames'}
        />
        <Text x={14} y={438} size={12} weight={600}>
          call stub · JavaCalls::call · jni_CallStaticVoidMethod
        </Text>
        <Text x={14} y={456} size={10} mono color="var(--color-fg-subtle)">
          generated stub + C++ frames of libjvm
        </Text>
      </Part>

      <Part
        id="launcher-frames"
        label="Launcher frames"
        active={activePart === 'launcher-frames'}
        onPart={onPart}
      >
        <Box
          x={0}
          y={476}
          w={460}
          h={50}
          tone="plat"
          dash="platform"
          active={activePart === 'launcher-frames'}
        />
        <Text x={14} y={496} size={12} weight={600}>
          JavaMain · ThreadJavaMain (libjli)
        </Text>
        <Text x={14} y={514} size={10} mono color="var(--color-fg-subtle)">
          C frames of the java launcher · thread start (libc)
        </Text>
      </Part>
      <Text x={0} y={548} size={10} mono color="var(--color-fg-subtle)">
        stack base (thread start)
      </Text>

      {/* Annotations */}
      <Arrow
        points={[
          { x: 520, y: 400 },
          { x: 520, y: 140 },
        ]}
        tone="idle"
        marker="ij-arrow-data"
      />
      <Text x={532} y={272} size={11} color="var(--color-fg-muted)">
        frames are pushed upward
      </Text>
      <Arrow
        points={[
          { x: 610, y: 196 },
          { x: 470, y: 196 },
        ]}
        tone="exec"
      />
      <Text x={618} y={200} size={11} mono color="var(--color-exec-200)">
        stack pointer (top of current frame)
      </Text>

      <Part id="stack-size" label="Stack size" active={activePart === 'stack-size'} onPart={onPart}>
        <Box x={560} y={330} w={400} h={86} tone="idle" active={activePart === 'stack-size'} />
        <Text x={576} y={354} size={12} weight={600}>
          Size: -Xss / ThreadStackSize
        </Text>
        <Text x={576} y={374} size={11} color="var(--color-fg-muted)">
          1024 KB by default on Linux x64 (JDK 25).
        </Text>
        <Text x={576} y={392} size={11} color="var(--color-fg-muted)">
          A trivial recursive method overflowed at depth
        </Text>
        <Text x={576} y={408} size={11} color="var(--color-fg-muted)">
          ≈ 20,700 in our run.
        </Text>
      </Part>

      <Part
        id="one-stack"
        label="Java and native frames share one stack"
        active={activePart === 'one-stack'}
        onPart={onPart}
      >
        <Box x={560} y={430} w={400} h={96} tone="rt" active={activePart === 'one-stack'} />
        <Text x={576} y={454} size={12} weight={600}>
          One native stack, two kinds of frames
        </Text>
        <Text x={576} y={474} size={11} color="var(--color-fg-muted)">
          The JVM stack and the native method stack of the
        </Text>
        <Text x={576} y={490} size={11} color="var(--color-fg-muted)">
          specification are the same memory in HotSpot: Java
        </Text>
        <Text x={576} y={506} size={11} color="var(--color-fg-muted)">
          frames sit on top of C frames.
        </Text>
      </Part>
    </g>
  );
}

export const stackDissection: Dissection = {
  id: 'jvm-stack',
  title: "One thread's stack",
  subtitle: 'Java frames, VM frames, launcher frames and guard zones (HotSpot, JDK 25, x64)',
  bounds: { x: -20, y: -10, w: 1000, h: 580 },
  accuracyNote:
    "Frame contents follow the JVM Specification model at the moment `Person.<init>` is about to execute `putfield`. Frame sizes are not to scale. The native frames at the bottom are those of the launcher's main thread on Linux; other threads start differently. Guard zone sizes are the JDK 25 defaults in pages (`StackRedPages`, `StackYellowPages`, `StackReservedPages`).",
  parts: [
    {
      id: 'current-frame',
      label: 'Current frame',
      componentId: 'stack-frame',
      description:
        'The frame of the method executing now, `Person.<init>(String)`: `this` and the argument in locals 0 and 1; `putfield` is about to pop both from the operand stack.',
    },
    {
      id: 'caller-frame',
      label: 'Caller frame',
      componentId: 'stack-frame',
      description:
        '`main` waits at the `invokespecial`. One copy of the reference (from `dup`) is still on its operand stack; when the constructor returns, execution continues at pc 9 with `astore_1`.',
    },
    {
      id: 'vm-frames',
      label: 'VM frames',
      description:
        "HotSpot enters Java code through a generated call stub (`StubRoutines::call_stub`) called from C++ (`JavaCalls::call`). Here they connect the launcher's `CallStaticVoidMethod` to `main`.",
    },
    {
      id: 'launcher-frames',
      label: 'Launcher frames',
      componentId: 'launcher',
      description:
        'The launcher runs `JavaMain` in a new native thread; after `JNI_CreateJavaVM` that thread becomes the "main" Java thread.',
    },
    {
      id: 'reserved-zone',
      label: 'Reserved zone',
      description:
        'Lets critical JDK methods annotated `@ReservedStackAccess` finish (for example releasing a lock) when an overflow happens inside them.',
    },
    {
      id: 'yellow-zone',
      label: 'Yellow zone',
      componentId: 'jvm-stack',
      description:
        'Touching it means a recoverable overflow: HotSpot temporarily unprotects it and throws `StackOverflowError`.',
    },
    {
      id: 'red-zone',
      label: 'Red zone',
      description:
        'Touching it means the overflow could not be handled: HotSpot reports a fatal error instead of corrupting memory.',
    },
    {
      id: 'stack-size',
      label: 'Stack size',
      description:
        '`-Xss` sets the stack size of new threads. Deep recursion needs more; many platform threads need less each.',
    },
    {
      id: 'one-stack',
      label: 'One native stack',
      componentId: 'native-method-stack',
      description:
        "HotSpot keeps interpreted, compiled and native frames on the same thread stack; the specification's separate areas are logical.",
    },
  ],
  references: [
    { source: 'jvms-2.5.2' },
    { source: 'jvms-2.6' },
    { source: 'src-stackoverflow' },
    { source: 'src-launcher' },
  ],
  Plate: StackPlate,
};

/* ───────────────────────── Stack frame (spec vs HotSpot) ───────────────────────── */

const HS_SLOTS: { part: string; label: string; note: string; tone: Tone }[] = [
  { part: 'hs-locals', label: 'locals[0] args', note: 'fp + n', tone: 'rt' },
  { part: 'hs-locals', label: 'locals[1] p1', note: '', tone: 'rt' },
  { part: 'hs-locals', label: 'locals[2] p2', note: '', tone: 'rt' },
  { part: 'hs-linkage', label: 'return address', note: 'fp + 1', tone: 'idle' },
  { part: 'hs-linkage', label: 'saved rbp  ← fp', note: 'fp + 0', tone: 'idle' },
  { part: 'hs-linkage', label: 'sender sp', note: 'fp − 1', tone: 'idle' },
  { part: 'hs-linkage', label: 'last sp', note: 'fp − 2', tone: 'idle' },
  { part: 'hs-method', label: 'Method*', note: 'fp − 3', tone: 'exec' },
  { part: 'hs-method', label: 'mirror', note: 'fp − 4', tone: 'exec' },
  { part: 'hs-mdp', label: 'mdp (profile)', note: 'fp − 5', tone: 'exec' },
  { part: 'hs-cache', label: 'cpCache', note: 'fp − 6', tone: 'exec' },
  { part: 'hs-locals', label: 'locals pointer', note: 'fp − 7', tone: 'rt' },
  { part: 'hs-bcp', label: 'bcp', note: 'fp − 8', tone: 'exec' },
  { part: 'hs-monitors', label: 'initial sp / monitors', note: 'fp − 9', tone: 'idle' },
  { part: 'hs-expression', label: 'ref', note: '', tone: 'ok' },
  { part: 'hs-expression', label: 'ref', note: '', tone: 'ok' },
  { part: 'hs-expression', label: '"Alex"  ← sp', note: '', tone: 'ok' },
];

function FramePlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <Kicker x={0} y={10}>
        JVM SPECIFICATION VIEW (JVMS §2.6)
      </Kicker>
      <Text x={0} y={32} size={12} color="var(--color-fg-muted)">
        main(String[]) at pc 6, just before invokespecial
      </Text>
      <rect
        x={0}
        y={44}
        width={420}
        height={420}
        rx={10}
        fill="none"
        stroke="var(--color-rt-500)"
        strokeOpacity={0.5}
      />

      <Part
        id="locals"
        label="Local variable array"
        active={activePart === 'locals'}
        onPart={onPart}
      >
        <Box x={16} y={60} w={388} h={96} tone="rt" active={activePart === 'locals'} />
        <Text x={30} y={82} size={13} weight={600}>
          Local variables · max_locals = 3
        </Text>
        <Slots x={30} y={100} items={['args', '— (p1)', '— (p2)']} width={110} />
      </Part>

      <Part
        id="operand-stack"
        label="Operand stack"
        active={activePart === 'operand-stack'}
        onPart={onPart}
      >
        <Box x={16} y={170} w={388} h={150} tone="rt" active={activePart === 'operand-stack'} />
        <Text x={30} y={192} size={13} weight={600}>
          Operand stack · max_stack = 3
        </Text>
        {['"Alex"  ← top', 'ref (new Person)', 'ref (new Person)'].map((value, i) => (
          <g key={i}>
            <rect
              x={30}
              y={204 + i * 34}
              width={220}
              height={28}
              rx={3}
              fill="var(--color-ok-500)"
              fillOpacity={0.12}
              stroke="var(--color-ok-500)"
              strokeOpacity={0.6}
            />
            <Text x={42} y={222 + i * 34} size={11} mono color="var(--color-fg-muted)">
              {value}
            </Text>
          </g>
        ))}
        <Text x={266} y={238} size={10.5} color="var(--color-fg-subtle)">
          invokespecial pops
        </Text>
        <Text x={266} y={254} size={10.5} color="var(--color-fg-subtle)">
          "Alex" and one ref
        </Text>
      </Part>

      <Part id="frame-data" label="Frame data" active={activePart === 'frame-data'} onPart={onPart}>
        <Box x={16} y={334} w={388} h={116} tone="rt" active={activePart === 'frame-data'} />
        <Text x={30} y={356} size={13} weight={600}>
          Frame data
        </Text>
        <Text x={30} y={378} size={11} color="var(--color-fg-muted)">
          → run-time constant pool of Main (dynamic linking)
        </Text>
        <Text x={30} y={398} size={11} color="var(--color-fg-muted)">
          → how to return to the invoker (normal completion)
        </Text>
        <Text x={30} y={418} size={11} color="var(--color-fg-muted)">
          → how to unwind on an exception (abrupt completion)
        </Text>
      </Part>

      <Kicker x={540} y={10}>
        HOTSPOT INTERPRETER FRAME · X86-64 · frame_x86.hpp
      </Kicker>
      <Text x={540} y={32} size={12} color="var(--color-fg-muted)">
        higher addresses at the top · one slot = 8 bytes
      </Text>
      {HS_SLOTS.map((slot, i) => {
        const y = 44 + i * 25;
        const lit = activePart === slot.part;
        return (
          <Part
            key={i}
            id={slot.part}
            label={`HotSpot frame slot: ${slot.label}`}
            active={lit}
            onPart={onPart}
          >
            <Box
              x={540}
              y={y}
              w={300}
              h={22}
              tone={slot.tone}
              dash="hotspot"
              active={lit}
              radius={3}
            />
            <Text x={552} y={y + 15} size={10.5} mono>
              {slot.label}
            </Text>
            <Text x={828} y={y + 15} size={9.5} mono anchor="end" color="var(--color-fg-subtle)">
              {slot.note}
            </Text>
          </Part>
        );
      })}
      <Arrow
        points={[
          { x: 404, y: 108 },
          { x: 470, y: 108 },
          { x: 470, y: 81 },
          { x: 538, y: 81 },
        ]}
        tone="rt"
        dashed="4 3"
        marker="ij-arrow-data"
      />
      <Arrow
        points={[
          { x: 404, y: 245 },
          { x: 480, y: 245 },
          { x: 480, y: 444 },
          { x: 538, y: 444 },
        ]}
        tone="ok"
        dashed="4 3"
        marker="ij-arrow-data"
      />
      <Arrow
        points={[
          { x: 404, y: 392 },
          { x: 490, y: 392 },
          { x: 490, y: 230 },
          { x: 538, y: 230 },
        ]}
        tone="exec"
        dashed="4 3"
        marker="ij-arrow-data"
      />
      <Text x={860} y={130} size={10.5} color="var(--color-fg-subtle)">
        Compiled (JIT) frames look
      </Text>
      <Text x={860} y={146} size={10.5} color="var(--color-fg-subtle)">
        different: values live in
      </Text>
      <Text x={860} y={162} size={10.5} color="var(--color-fg-subtle)">
        registers and one frame can
      </Text>
      <Text x={860} y={178} size={10.5} color="var(--color-fg-subtle)">
        hold several inlined methods.
      </Text>
    </g>
  );
}

export const frameDissection: Dissection = {
  id: 'stack-frame',
  title: 'A frame, two ways',
  subtitle: "The specification's model next to HotSpot's interpreter frame (JDK 25, x86-64)",
  bounds: { x: -20, y: -10, w: 1060, h: 500 },
  accuracyNote:
    "The left side is the JVM Specification's logical frame. The right side lists the interpreter frame slots defined in HotSpot's `frame_x86.hpp` (JDK 25), with values for `main` at pc 6. Compiled frames, other CPUs and other JVMs use different layouts.",
  parts: [
    {
      id: 'locals',
      label: 'Local variable array',
      componentId: 'local-variables',
      description: 'Slot 0 holds `args`; slots 1 and 2 (`p1`, `p2`) are not assigned yet at pc 6.',
    },
    {
      id: 'operand-stack',
      label: 'Operand stack',
      componentId: 'operand-stack',
      description: '`new`, `dup` and `ldc` have pushed three values: depth 3, exactly `max_stack`.',
    },
    {
      id: 'frame-data',
      label: 'Frame data',
      componentId: 'frame-data',
      description:
        "Everything else a frame needs: the link to Main's run-time constant pool (dynamic linking) and the information to return or unwind.",
    },
    {
      id: 'hs-locals',
      label: 'Locals in the interpreter frame',
      description:
        'Parameters are pushed by the caller and the callee extends them with its other locals; a register (`r14` on x86-64) and the locals-pointer slot point at them.',
    },
    {
      id: 'hs-linkage',
      label: 'Linkage slots',
      description:
        "Return address, saved frame pointer, the sender's stack pointer and the last stack pointer let the VM walk and pop frames.",
    },
    {
      id: 'hs-method',
      label: 'Method* and mirror',
      description:
        "The executing method's metadata and its class's mirror (which also keeps the class alive for the GC).",
    },
    {
      id: 'hs-mdp',
      label: 'Method data pointer',
      description:
        "Points into the method's MethodData profile when profiling is active, so the interpreter can record branch and type profiles.",
    },
    {
      id: 'hs-cache',
      label: 'Constant pool cache',
      description:
        'HotSpot\'s resolution cache for the class\'s constant pool: this is how the frame "links dynamically" in practice.',
    },
    {
      id: 'hs-bcp',
      label: 'Saved bytecode pointer',
      description:
        'The interpreter keeps the bcp in a register while running and saves it here when it calls out, so the frame knows its pc.',
    },
    {
      id: 'hs-monitors',
      label: 'Monitor block',
      description:
        'For `synchronized` methods and blocks, lock records live between the fixed slots and the expression stack. `main` holds none.',
    },
    {
      id: 'hs-expression',
      label: 'Expression stack',
      description:
        'The operand stack, at the low-address end of the frame; the interpreter also caches the top value in a register.',
    },
  ],
  references: [{ source: 'jvms-2.6' }, { source: 'src-frame-x86' }, { source: 'jvms-2.6.3' }],
  Plate: FramePlate,
};

/* ───────────────────────── PC register ───────────────────────── */

const MAIN_CODE: [number, string][] = [
  [0, 'new #7'],
  [3, 'dup'],
  [4, 'ldc #9'],
  [6, 'invokespecial #11'],
  [9, 'astore_1'],
  [10, 'aload_1'],
  [11, 'astore_2'],
  [12, 'getstatic #14'],
  [15, 'aload_2'],
  [16, 'invokevirtual #20'],
  [19, 'invokevirtual #24'],
  [22, 'aconst_null'],
  [23, 'astore_1'],
  [24, 'aconst_null'],
  [25, 'astore_2'],
  [26, 'return'],
];

function PcPlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <Kicker x={0} y={10}>
        MAIN THREAD · MAIN(STRING[])
      </Kicker>
      <Part
        id="listing"
        label="Bytecode of main with offsets"
        active={activePart === 'listing'}
        onPart={onPart}
      >
        <Box x={0} y={24} w={320} h={430} tone="rt" active={activePart === 'listing'} />
        {MAIN_CODE.map(([pc, op], i) => (
          <g key={pc}>
            {pc === 6 && (
              <rect
                x={8}
                y={38 + i * 25}
                width={304}
                height={22}
                rx={3}
                fill="var(--color-exec-500)"
                fillOpacity={0.2}
              />
            )}
            <Text x={56} y={53 + i * 25} size={11} mono anchor="end" color="var(--color-fg-subtle)">
              {pc}
            </Text>
            <Text
              x={68}
              y={53 + i * 25}
              size={11}
              mono
              color={pc === 6 ? 'var(--color-exec-200)' : 'var(--color-fg-muted)'}
            >
              {op}
            </Text>
          </g>
        ))}
      </Part>
      <Part id="pc" label="The pc: 6" active={activePart === 'pc'} onPart={onPart}>
        <Box x={360} y={170} w={110} h={46} tone="exec" active={activePart === 'pc'} />
        <Text x={415} y={190} size={10} mono anchor="middle" color="var(--color-fg-subtle)">
          pc register
        </Text>
        <Text
          x={415}
          y={207}
          size={14}
          mono
          anchor="middle"
          weight={700}
          color="var(--color-exec-200)"
        >
          6
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 360, y: 193 },
          { x: 316, y: 193 },
        ]}
        tone="exec"
      />

      <Part
        id="bcp"
        label="HotSpot interpreter: bytecode pointer"
        active={activePart === 'bcp'}
        onPart={onPart}
      >
        <Box
          x={520}
          y={24}
          w={430}
          h={120}
          tone="exec"
          dash="hotspot"
          active={activePart === 'bcp'}
        />
        <Text x={536} y={48} size={13} weight={600}>
          Interpreter: bcp in register r13
        </Text>
        <Text x={536} y={70} size={11} color="var(--color-fg-muted)">
          The bytecode pointer addresses the opcode byte inside
        </Text>
        <Text x={536} y={86} size={11} color="var(--color-fg-muted)">
          the method's ConstMethod (here 0xb7 = invokespecial).
        </Text>
        <Text x={536} y={106} size={11} color="var(--color-fg-muted)">
          bci = bcp − start of the bytecode = 6
        </Text>
        <Text x={536} y={126} size={10.5} mono color="var(--color-fg-subtle)">
          saved to the frame's bcp slot on calls
        </Text>
      </Part>
      <Part
        id="compiled-pc"
        label="Compiled code: hardware program counter"
        active={activePart === 'compiled-pc'}
        onPart={onPart}
      >
        <Box
          x={520}
          y={160}
          w={430}
          h={110}
          tone="exec"
          dash="hotspot"
          active={activePart === 'compiled-pc'}
        />
        <Text x={536} y={184} size={13} weight={600}>
          Compiled code: the CPU's own pc
        </Text>
        <Text x={536} y={206} size={11} color="var(--color-fg-muted)">
          No bytecode index exists while machine code runs.
        </Text>
        <Text x={536} y={222} size={11} color="var(--color-fg-muted)">
          Debug info (PcDesc / ScopeDesc) maps a machine pc back to
        </Text>
        <Text x={536} y={238} size={11} color="var(--color-fg-muted)">
          method + bci for stack traces and deoptimization.
        </Text>
      </Part>
      <Part
        id="native-undefined"
        label="Native methods: undefined pc"
        active={activePart === 'native-undefined'}
        onPart={onPart}
      >
        <Box
          x={520}
          y={286}
          w={430}
          h={74}
          tone="plat"
          active={activePart === 'native-undefined'}
        />
        <Text x={536} y={310} size={13} weight={600}>
          Native method running: pc undefined
        </Text>
        <Text x={536} y={332} size={11} color="var(--color-fg-muted)">
          JVMS §2.5.1: no JVM instruction is executing.
        </Text>
      </Part>
      <Part
        id="per-thread"
        label="One pc per thread"
        active={activePart === 'per-thread'}
        onPart={onPart}
      >
        <Box x={520} y={376} w={430} h={78} tone="rt" active={activePart === 'per-thread'} />
        <Text x={536} y={400} size={13} weight={600}>
          Every thread has its own pc
        </Text>
        <Text x={536} y={422} size={11} color="var(--color-fg-muted)">
          Two threads can run the same method at different
        </Text>
        <Text x={536} y={438} size={11} color="var(--color-fg-muted)">
          positions at the same moment.
        </Text>
      </Part>
    </g>
  );
}

export const pcDissection: Dissection = {
  id: 'pc-register',
  title: 'The pc register',
  subtitle: 'One specification concept, three HotSpot realities',
  bounds: { x: -20, y: -10, w: 990, h: 480 },
  accuracyNote:
    "Offsets are real `javap -c` output for `Main.main` (JDK 25). The register name (`r13`) is specific to HotSpot's x86-64 interpreter (`interp_masm_x86.hpp`); other CPUs use other registers.",
  parts: [
    {
      id: 'listing',
      label: 'Bytecode offsets',
      description:
        "The numbers javap prints are byte offsets into the method's code. They are exactly the values the pc takes.",
    },
    {
      id: 'pc',
      label: 'pc = 6',
      componentId: 'pc-register',
      description:
        'The thread is at offset 6, `invokespecial #11`. After the constructor returns, the pc becomes 9.',
    },
    {
      id: 'bcp',
      label: 'Bytecode pointer',
      componentId: 'interpreter',
      description:
        "HotSpot's template interpreter keeps the current bytecode address in `r13` on x86-64 and derives the bytecode index from it.",
    },
    {
      id: 'compiled-pc',
      label: 'Compiled code',
      componentId: 'code-cache',
      description:
        'Once a method is JIT-compiled there is no per-instruction bytecode position; HotSpot reconstructs it from debug information when needed.',
    },
    {
      id: 'native-undefined',
      label: 'Undefined in native code',
      componentId: 'native-method-stack',
      description: 'While a native method runs, the specification leaves the pc undefined.',
    },
    {
      id: 'per-thread',
      label: 'Per thread',
      componentId: 'java-thread',
      description: "The pc is part of each thread's private state, like its stack.",
    },
  ],
  references: [
    { source: 'jvms-2.5.1' },
    { source: 'src-interp-masm-x86' },
    { source: 'src-frame-x86' },
  ],
  Plate: PcPlate,
};
