import type { Dissection, DissectionProps } from '../types';
import { Arrow, Box, Kicker, Part, Text, type Tone } from '../kit';

/* ───────────────────────── GC: reachability ───────────────────────── */

function Obj({
  id,
  x,
  y,
  label,
  state,
  active,
  onPart,
  w = 130,
}: {
  id: string;
  x: number;
  y: number;
  label: string;
  state: 'reachable' | 'unreachable' | 'reclaimed';
  active: string | null;
  onPart: (id: string) => void;
  w?: number;
}) {
  const tone: Tone = state === 'reachable' ? 'ok' : state === 'unreachable' ? 'warn' : 'idle';
  const glyph = state === 'reachable' ? '✓' : state === 'unreachable' ? '!' : '×';
  const caption =
    state === 'reachable'
      ? 'reachable'
      : state === 'unreachable'
        ? 'unreachable · eligible'
        : 'reclaimed';
  return (
    <Part id={id} label={`${label}: ${caption}`} active={active === id} onPart={onPart}>
      <g opacity={state === 'reclaimed' ? 0.55 : 1}>
        <Box
          x={x}
          y={y}
          w={w}
          h={50}
          tone={tone}
          dash={state === 'reachable' ? 'solid' : state === 'unreachable' ? 'hotspot' : 'platform'}
          active={active === id}
        />
        <Text x={x + 12} y={y + 21} size={12} weight={600}>
          {label}
        </Text>
        <Text x={x + 12} y={y + 38} size={9.5} mono color="var(--color-fg-subtle)">
          {caption}
        </Text>
        <circle
          cx={x + w - 12}
          cy={y + 12}
          r={7.5}
          fill="var(--color-ink-900)"
          stroke={`var(--color-${tone === 'ok' ? 'ok-400' : tone === 'warn' ? 'warn-400' : 'idle-400'})`}
        />
        <text
          x={x + w - 12}
          y={y + 15.5}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill={`var(--color-${tone === 'ok' ? 'ok-400' : tone === 'warn' ? 'warn-400' : 'idle-400'})`}
        >
          {glyph}
        </text>
      </g>
    </Part>
  );
}

function GcPlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <Kicker x={0} y={10}>
        GC ROOTS
      </Kicker>
      <Part
        id="root-stack"
        label="Root: main thread's frame"
        active={activePart === 'root-stack'}
        onPart={onPart}
      >
        <Box x={0} y={24} w={210} h={92} tone="rt" active={activePart === 'root-stack'} />
        <Text x={14} y={46} size={12} weight={600}>
          main thread · frame main
        </Text>
        <Text x={14} y={68} size={10.5} mono color="var(--color-fg-muted)">
          p1 = null
        </Text>
        <Text x={14} y={86} size={10.5} mono color="var(--color-fg-muted)">
          p2 = null
        </Text>
        <Text x={14} y={104} size={10.5} mono color="var(--color-fg-muted)">
          list → ArrayList
        </Text>
      </Part>
      <Part
        id="root-static"
        label="Root: static field"
        active={activePart === 'root-static'}
        onPart={onPart}
      >
        <Box x={0} y={136} w={210} h={64} tone="rt" active={activePart === 'root-static'} />
        <Text x={14} y={158} size={12} weight={600}>
          static field Config.cache
        </Text>
        <Text x={14} y={180} size={10.5} mono color="var(--color-fg-muted)">
          via loaded class Config
        </Text>
      </Part>
      <Part
        id="root-constants"
        label="Root: resolved constants of Main"
        active={activePart === 'root-constants'}
        onPart={onPart}
      >
        <Box x={0} y={220} w={210} h={64} tone="rt" active={activePart === 'root-constants'} />
        <Text x={14} y={242} size={12} weight={600}>
          Main's resolved constants
        </Text>
        <Text x={14} y={264} size={10.5} mono color="var(--color-fg-muted)">
          ldc #9 → "Alex"
        </Text>
      </Part>
      <Part
        id="root-jni"
        label="Root: JNI global reference"
        active={activePart === 'root-jni'}
        onPart={onPart}
      >
        <Box x={0} y={304} w={210} h={64} tone="plat" active={activePart === 'root-jni'} />
        <Text x={14} y={326} size={12} weight={600}>
          JNI global reference
        </Text>
        <Text x={14} y={348} size={10.5} mono color="var(--color-fg-muted)">
          held by native code
        </Text>
      </Part>

      <Kicker x={300} y={10}>
        THE HEAP AFTER p1 = null; p2 = null
      </Kicker>
      <Obj
        id="reachable"
        x={300}
        y={40}
        label="ArrayList"
        state="reachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reachable"
        x={480}
        y={40}
        label="Object[]"
        state="reachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reachable"
        x={300}
        y={140}
        label="HashMap"
        state="reachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reachable"
        x={480}
        y={140}
        label="Node[]"
        state="reachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="alex"
        x={660}
        y={226}
        label='String "Alex"'
        state="reachable"
        active={activePart}
        onPart={onPart}
        w={150}
      />
      <Obj
        id="person"
        x={480}
        y={250}
        label="Person"
        state="unreachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reachable"
        x={300}
        y={326}
        label="byte[] (native)"
        state="reachable"
        active={activePart}
        onPart={onPart}
        w={140}
      />
      <Obj
        id="cycle"
        x={480}
        y={360}
        label="Node A"
        state="unreachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="cycle"
        x={660}
        y={360}
        label="Node B"
        state="unreachable"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reclaimed"
        x={850}
        y={60}
        label="(old garbage)"
        state="reclaimed"
        active={activePart}
        onPart={onPart}
      />
      <Obj
        id="reclaimed"
        x={850}
        y={140}
        label="(old garbage)"
        state="reclaimed"
        active={activePart}
        onPart={onPart}
      />

      <Arrow
        points={[
          { x: 210, y: 104 },
          { x: 260, y: 104 },
          { x: 260, y: 65 },
          { x: 298, y: 65 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 430, y: 65 },
          { x: 478, y: 65 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 210, y: 168 },
          { x: 298, y: 168 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 430, y: 165 },
          { x: 478, y: 165 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 210, y: 252 },
          { x: 640, y: 252 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 610, y: 275 },
          { x: 640, y: 275 },
        ]}
        tone="warn"
        dashed="4 3"
      />
      <Arrow
        points={[
          { x: 210, y: 336 },
          { x: 260, y: 336 },
          { x: 260, y: 351 },
          { x: 298, y: 351 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 610, y: 377 },
          { x: 658, y: 377 },
        ]}
        tone="warn"
        dashed="4 3"
      />
      <Arrow
        points={[
          { x: 660, y: 395 },
          { x: 612, y: 395 },
        ]}
        tone="warn"
        dashed="4 3"
      />
      <line
        x1={180}
        y1={60}
        x2={232}
        y2={60}
        stroke="var(--color-idle-400)"
        strokeDasharray="2 3"
      />
      <Text x={236} y={63} size={9.5} mono color="var(--color-fg-subtle)">
        null: no edge
      </Text>

      <Part id="marking" label="Marking" active={activePart === 'marking'} onPart={onPart}>
        <Box x={300} y={440} w={720} h={60} tone="exec" active={activePart === 'marking'} />
        <Text x={314} y={464} size={12} weight={600}>
          Marking follows references from the roots; everything not reached is garbage.
        </Text>
        <Text x={314} y={484} size={10.5} color="var(--color-fg-muted)">
          Cost depends on live objects. Unreachable cycles (Node A ↔ Node B) are garbage too.
        </Text>
      </Part>
    </g>
  );
}

export const gcDissection: Dissection = {
  id: 'garbage-collector',
  title: 'Reachability',
  subtitle: 'Roots, reachable objects, unreachable objects, reclaimed space',
  bounds: { x: -20, y: -10, w: 1060, h: 530 },
  accuracyNote:
    'An educational snapshot, not a real heap. Reachable objects (✓, solid green), unreachable objects (!, dashed orange) and reclaimed space (×, dotted grey) are drawn as states a collector would assign; real collectors decide this per cycle and may not reclaim an unreachable object for a long time. The "Alex" string stays reachable because Main\'s resolved constant pool entry refers to the interned literal.',
  parts: [
    {
      id: 'root-stack',
      label: 'Stack roots',
      componentId: 'gc-roots',
      description:
        "Reference slots in every live frame. After `p1 = null; p2 = null` the Person is no longer referenced from `main`'s frame.",
    },
    {
      id: 'root-static',
      label: 'Static roots',
      componentId: 'gc-roots',
      description:
        'Static fields of loaded classes keep their objects alive for as long as the class is loaded — a classic source of leaks.',
    },
    {
      id: 'root-constants',
      label: 'Resolved constants',
      componentId: 'runtime-constant-pool',
      description:
        'Resolved string literals are held by the class (HotSpot: the constant pool\'s resolved references), so "Alex" stays reachable even when no variable refers to it.',
    },
    {
      id: 'root-jni',
      label: 'JNI global references',
      componentId: 'jni',
      description:
        'Native code can pin objects with global references; they remain roots until `DeleteGlobalRef`.',
    },
    {
      id: 'reachable',
      label: 'Reachable objects',
      description:
        'Reachable from at least one root through a chain of references: they must be kept.',
    },
    {
      id: 'person',
      label: 'The Person',
      componentId: 'heap',
      description:
        'No root reaches it any more: it is eligible for collection. Nothing happens until a collection processes its region.',
    },
    {
      id: 'alex',
      label: 'String "Alex"',
      description:
        "Still reachable through Main's resolved constants, even though the Person that referred to it is not.",
    },
    {
      id: 'cycle',
      label: 'Unreachable cycle',
      description:
        'A and B refer to each other but no root reaches either. Tracing collectors reclaim cycles like any other garbage.',
    },
    {
      id: 'reclaimed',
      label: 'Reclaimed space',
      componentId: 'compaction',
      description:
        'After a collection, space that held unreachable objects is reused: freed regions in G1, or space compacted away.',
    },
    {
      id: 'marking',
      label: 'Marking',
      componentId: 'marking',
      description:
        'The collector traces from the roots and marks what it reaches. Concurrent collectors do this while the program runs, using barriers.',
    },
  ],
  references: [
    { source: 'jls-12.6' },
    { source: 'jvms-2.5.3' },
    { source: 'guide-gc' },
    { source: 'api-java-lang-ref' },
  ],
  Plate: GcPlate,
};

/* ───────────────────────── Class loading: module-aware delegation ───────────────────────── */

const STEPS: {
  id: string;
  x: number;
  y: number;
  w: number;
  text: string;
  sub?: string;
  tone: Tone;
  diamond?: boolean;
}[] = [
  {
    id: 'request',
    x: 330,
    y: 20,
    w: 300,
    text: 'loadClass(name) on the application loader',
    tone: 'rt',
  },
  {
    id: 'loaded',
    x: 330,
    y: 100,
    w: 300,
    text: 'already loaded by this loader?',
    sub: 'findLoadedClass',
    tone: 'rt',
    diamond: true,
  },
  {
    id: 'module',
    x: 330,
    y: 190,
    w: 300,
    text: 'package in a named module?',
    sub: 'findLoadedModule',
    tone: 'rt',
    diamond: true,
  },
  {
    id: 'module-loader',
    x: 700,
    y: 190,
    w: 300,
    text: 'ask the loader that defines that module',
    sub: 'e.g. java.sql → platform loader',
    tone: 'exec',
  },
  {
    id: 'parent',
    x: 330,
    y: 290,
    w: 300,
    text: 'delegate to the parent first',
    sub: 'app → platform → boot',
    tone: 'rt',
  },
  {
    id: 'classpath',
    x: 330,
    y: 380,
    w: 300,
    text: 'not found above: search the class path',
    sub: 'findClassOnClassPathOrNull',
    tone: 'rt',
  },
  {
    id: 'define',
    x: 330,
    y: 470,
    w: 300,
    text: 'define the class (this loader is its defining loader)',
    tone: 'ok',
  },
  {
    id: 'cnfe',
    x: 700,
    y: 470,
    w: 300,
    text: 'nothing found anywhere: ClassNotFoundException',
    tone: 'warn',
  },
];

function ClassLoaderPlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <Kicker x={0} y={10}>
        BuiltinClassLoader.loadClassOrNull · JDK 25
      </Kicker>
      {STEPS.map((step) => {
        const active = activePart === step.id;
        return (
          <Part key={step.id} id={step.id} label={step.text} active={active} onPart={onPart}>
            <Box
              x={step.x}
              y={step.y}
              w={step.w}
              h={56}
              tone={step.tone}
              active={active}
              radius={step.diamond ? 28 : 7}
            />
            <Text
              x={step.x + step.w / 2}
              y={step.y + (step.sub ? 24 : 33)}
              size={12}
              anchor="middle"
              weight={600}
            >
              {step.text}
            </Text>
            {step.sub && (
              <Text
                x={step.x + step.w / 2}
                y={step.y + 43}
                size={10}
                mono
                anchor="middle"
                color="var(--color-fg-subtle)"
              >
                {step.sub}
              </Text>
            )}
          </Part>
        );
      })}
      <Arrow
        points={[
          { x: 480, y: 76 },
          { x: 480, y: 98 },
        ]}
        tone="rt"
      />
      <Arrow
        points={[
          { x: 480, y: 156 },
          { x: 480, y: 188 },
        ]}
        tone="rt"
      />
      <Text x={490} y={176} size={10} mono color="var(--color-fg-subtle)">
        no
      </Text>
      <Arrow
        points={[
          { x: 630, y: 128 },
          { x: 1040, y: 128 },
          { x: 1040, y: 498 },
          { x: 1002, y: 498 },
        ]}
        tone="ok"
        dashed="5 4"
      />
      <Text x={640} y={120} size={10} mono color="var(--color-ok-300)">
        yes → return it
      </Text>
      <Arrow
        points={[
          { x: 630, y: 218 },
          { x: 698, y: 218 },
        ]}
        tone="exec"
      />
      <Text x={640} y={210} size={10} mono color="var(--color-fg-subtle)">
        yes
      </Text>
      <Arrow
        points={[
          { x: 480, y: 246 },
          { x: 480, y: 288 },
        ]}
        tone="rt"
      />
      <Text x={490} y={270} size={10} mono color="var(--color-fg-subtle)">
        no (e.g. Main: unnamed package)
      </Text>
      <Arrow
        points={[
          { x: 480, y: 346 },
          { x: 480, y: 378 },
        ]}
        tone="rt"
      />
      <Arrow
        points={[
          { x: 480, y: 436 },
          { x: 480, y: 468 },
        ]}
        tone="ok"
      />
      <Arrow
        points={[
          { x: 630, y: 408 },
          { x: 850, y: 408 },
          { x: 850, y: 468 },
        ]}
        tone="warn"
        dashed="9 3 2 3"
        marker="ij-arrow-exception"
      />

      <Part
        id="example-main"
        label="Example: loading Main"
        active={activePart === 'example-main'}
        onPart={onPart}
      >
        <Box x={0} y={60} w={290} h={150} tone="idle" active={activePart === 'example-main'} />
        <Text x={14} y={84} size={12} weight={600}>
          Main (class path)
        </Text>
        {[
          'unnamed package → no module',
          'platform loader: not found',
          'boot loader: not found',
          'class path: Main.class ✓',
          'defined by the app loader',
        ].map((line, i) => (
          <Text key={line} x={14} y={108 + i * 20} size={10.5} mono color="var(--color-fg-muted)">
            {line}
          </Text>
        ))}
      </Part>
      <Part
        id="example-sql"
        label="Example: loading java.sql.Connection"
        active={activePart === 'example-sql'}
        onPart={onPart}
      >
        <Box x={0} y={230} w={290} h={130} tone="idle" active={activePart === 'example-sql'} />
        <Text x={14} y={254} size={12} weight={600}>
          java.sql.Connection
        </Text>
        {[
          'package java.sql → module java.sql',
          'defined to the platform loader',
          '→ asked directly, no parent walk',
        ].map((line, i) => (
          <Text key={line} x={14} y={278 + i * 20} size={10.5} mono color="var(--color-fg-muted)">
            {line}
          </Text>
        ))}
      </Part>
    </g>
  );
}

export const classLoaderDissection: Dissection = {
  id: 'class-loader-subsystem',
  title: 'Module-aware delegation',
  subtitle: 'How the JDK 25 built-in loaders decide who loads a class',
  bounds: { x: -20, y: -10, w: 1090, h: 560 },
  accuracyNote:
    "This flow follows `BuiltinClassLoader.loadClassOrNull` in the `jdk-25-ga` source, simplified: locking, the boot loader's native lookup and resource loading are omitted. User-defined class loaders can implement a different policy by overriding `loadClass`.",
  parts: [
    {
      id: 'request',
      label: 'The request',
      componentId: 'application-loader',
      description:
        'The launcher (or code calling `Class.forName`) asks the application class loader for a class by binary name.',
    },
    {
      id: 'loaded',
      label: 'Already loaded?',
      description:
        '`findLoadedClass` checks whether this loader already loaded the class; if so it is returned immediately.',
    },
    {
      id: 'module',
      label: 'Named module?',
      componentId: 'parent-delegation',
      description:
        'The built-in loaders map the package to a module. A package in a named module has exactly one defining loader.',
    },
    {
      id: 'module-loader',
      label: "Go straight to the module's loader",
      componentId: 'platform-loader',
      description:
        'For `java.sql.Connection` the request goes directly to the platform loader, which defines module `java.sql`.',
    },
    {
      id: 'parent',
      label: 'Parent first',
      componentId: 'parent-delegation',
      description:
        'For packages not in a named module, the classic parent-first rule applies: platform loader, then boot loader.',
    },
    {
      id: 'classpath',
      label: 'Class path search',
      componentId: 'loading',
      description:
        'Only if no ancestor found the class does the application loader search its class path.',
    },
    {
      id: 'define',
      label: 'Define',
      componentId: 'loading',
      description:
        "The loader that found the bytes defines the class and becomes its defining loader, part of the class's run-time identity.",
    },
    {
      id: 'cnfe',
      label: 'Not found',
      description:
        'Explicit lookups throw `ClassNotFoundException`; when the JVM itself needed the class during resolution, the error is `NoClassDefFoundError`.',
    },
    {
      id: 'example-main',
      label: 'Example: Main',
      description:
        'Verified with `-Xlog:class+load`: `Main source: file:/…/`, defined by the application loader.',
    },
    {
      id: 'example-sql',
      label: 'Example: java.sql',
      description:
        'Verified: `java.sql.Connection.class.getClassLoader()` prints the platform loader, and its module is `java.sql`.',
    },
  ],
  references: [
    { source: 'src-builtin-classloader' },
    { source: 'api-classloader' },
    { source: 'jvms-5.3' },
    { source: 'jep-261' },
  ],
  Plate: ClassLoaderPlate,
};

/* ───────────────────────── JNI call path ───────────────────────── */

function JniPlate({ activePart, onPart }: DissectionProps) {
  const lane = (x: number, title: string, sub: string, tone: Tone) => (
    <g>
      <rect
        x={x}
        y={20}
        width={230}
        height={430}
        rx={8}
        fill="none"
        stroke={`var(--color-${tone === 'plat' ? 'plat-500' : tone === 'exec' ? 'exec-500' : 'rt-500'})`}
        strokeOpacity={0.35}
        strokeDasharray={tone === 'plat' ? '1.2 3.4' : undefined}
      />
      <Text x={x + 115} y={42} size={12} anchor="middle" weight={600}>
        {title}
      </Text>
      <Text x={x + 115} y={58} size={9.5} mono anchor="middle" color="var(--color-fg-subtle)">
        {sub}
      </Text>
    </g>
  );
  const step = (id: string, x: number, y: number, text: string, sub: string, tone: Tone) => (
    <Part id={id} label={text} active={activePart === id} onPart={onPart}>
      <Box
        x={x}
        y={y}
        w={210}
        h={58}
        tone={tone}
        active={activePart === id}
        dash={tone === 'plat' ? 'platform' : tone === 'exec' ? 'hotspot' : 'solid'}
      />
      <Text x={x + 12} y={y + 22} size={11.5} weight={600}>
        {text}
      </Text>
      <Text x={x + 12} y={y + 40} size={9.5} mono color="var(--color-fg-subtle)">
        {sub}
      </Text>
    </Part>
  );
  return (
    <g>
      {lane(0, 'Java code', 'UseNative.main', 'rt')}
      {lane(270, 'HotSpot native wrapper', 'generated for NativeMath.add', 'exec')}
      {lane(540, 'C code', 'libnativemath.so', 'plat')}
      {step(
        'java-call',
        10,
        80,
        'invokestatic NativeMath.add',
        'args 2, 3 on the operand stack',
        'rt',
      )}
      {step(
        'wrapper-in',
        280,
        160,
        'enter native',
        'JNIEnv*, jclass, 2, 3 · state → in native',
        'exec',
      )}
      {step('c-function', 550, 240, 'Java_NativeMath_add', 'return a + b;', 'plat')}
      {step(
        'wrapper-out',
        280,
        320,
        'return to Java',
        'state → in Java · safepoint & exception check',
        'exec',
      )}
      {step('java-result', 10, 380, 'result pushed: 5', 'execution continues in main', 'rt')}
      <Arrow
        points={[
          { x: 220, y: 109 },
          { x: 250, y: 109 },
          { x: 250, y: 189 },
          { x: 278, y: 189 },
        ]}
        tone="exec"
      />
      <Arrow
        points={[
          { x: 490, y: 189 },
          { x: 520, y: 189 },
          { x: 520, y: 269 },
          { x: 548, y: 269 },
        ]}
        tone="exec"
      />
      <Arrow
        points={[
          { x: 550, y: 280 },
          { x: 520, y: 280 },
          { x: 520, y: 349 },
          { x: 492, y: 349 },
        ]}
        tone="exec"
      />
      <Arrow
        points={[
          { x: 280, y: 349 },
          { x: 250, y: 349 },
          { x: 250, y: 409 },
          { x: 222, y: 409 },
        ]}
        tone="exec"
      />

      <Part
        id="jnienv"
        label="JNIEnv function table"
        active={activePart === 'jnienv'}
        onPart={onPart}
      >
        <Box x={810} y={20} w={230} h={200} tone="rt" active={activePart === 'jnienv'} />
        <Text x={824} y={44} size={12} weight={600}>
          JNIEnv* → function table
        </Text>
        {[
          'GetVersion',
          'FindClass',
          'NewStringUTF',
          'GetFieldID',
          'CallStaticVoidMethod',
          'ExceptionCheck',
          '… ~230 functions',
        ].map((fn, i) => (
          <Text key={fn} x={824} y={68 + i * 20} size={10.5} mono color="var(--color-fg-muted)">
            {fn}
          </Text>
        ))}
      </Part>
      <Part
        id="local-refs"
        label="Local references"
        active={activePart === 'local-refs'}
        onPart={onPart}
      >
        <Box x={810} y={236} w={230} h={100} tone="rt" active={activePart === 'local-refs'} />
        <Text x={824} y={260} size={12} weight={600}>
          Local references
        </Text>
        <Text x={824} y={282} size={10.5} color="var(--color-fg-muted)">
          jobject handles valid until
        </Text>
        <Text x={824} y={298} size={10.5} color="var(--color-fg-muted)">
          the native method returns;
        </Text>
        <Text x={824} y={314} size={10.5} color="var(--color-fg-muted)">
          freed by the wrapper.
        </Text>
      </Part>
      <Part
        id="global-refs"
        label="Global references"
        active={activePart === 'global-refs'}
        onPart={onPart}
      >
        <Box x={810} y={350} w={230} h={100} tone="warn" active={activePart === 'global-refs'} />
        <Text x={824} y={374} size={12} weight={600}>
          Global references
        </Text>
        <Text x={824} y={396} size={10.5} color="var(--color-fg-muted)">
          NewGlobalRef: a GC root until
        </Text>
        <Text x={824} y={412} size={10.5} color="var(--color-fg-muted)">
          DeleteGlobalRef. Forgetting to
        </Text>
        <Text x={824} y={428} size={10.5} color="var(--color-fg-muted)">
          delete it leaks memory.
        </Text>
      </Part>
    </g>
  );
}

export const jniDissection: Dissection = {
  id: 'jni',
  title: 'One native call, step by step',
  subtitle: 'NativeMath.add(2, 3): Java → wrapper → C → wrapper → Java (HotSpot, JDK 25)',
  bounds: { x: -20, y: 0, w: 1080, h: 470 },
  accuracyNote:
    'Verified by compiling and running the example on OpenJDK 25.0.4 with gcc. The native wrapper and thread-state names are HotSpot implementation details; the JNI specification defines the function table, references and naming rules. The number of JNIEnv functions is approximate.',
  parts: [
    {
      id: 'java-call',
      label: 'The Java call',
      description:
        'An ordinary `invokestatic`. The method is declared `native`, so its entry point is a native wrapper instead of bytecode.',
    },
    {
      id: 'wrapper-in',
      label: 'Entering native code',
      componentId: 'jni',
      description:
        'The wrapper converts arguments to the C calling convention, adds `JNIEnv*` and the `jclass`, records the last Java frame and switches the thread to "in native" so GC can proceed.',
    },
    {
      id: 'c-function',
      label: 'The C function',
      componentId: 'native-libraries',
      description:
        '`Java_NativeMath_add`, found by name in `libnativemath.so` (or registered with `RegisterNatives`). It runs on the same thread stack.',
    },
    {
      id: 'wrapper-out',
      label: 'Returning to Java',
      componentId: 'jni',
      description:
        'The wrapper switches the thread back to "in Java", blocking first if a safepoint is in progress, and rethrows any pending Java exception.',
    },
    {
      id: 'java-result',
      label: 'The result',
      componentId: 'operand-stack',
      description:
        "The `jint` result is pushed onto the caller's operand stack and `main` continues.",
    },
    {
      id: 'jnienv',
      label: 'JNIEnv',
      description:
        'A per-thread pointer to a table of function pointers. Native code calls back into the JVM only through it.',
    },
    {
      id: 'local-refs',
      label: 'Local references',
      description:
        'References passed to or created by native code are local handles, released automatically when the native method returns.',
    },
    {
      id: 'global-refs',
      label: 'Global references',
      componentId: 'gc-roots',
      description:
        'Long-lived handles that act as GC roots until explicitly deleted (HotSpot stores them in OopStorage).',
    },
  ],
  references: [
    { source: 'jni-spec' },
    { source: 'jvms-5.6' },
    { source: 'src-jni' },
    { source: 'src-oopstorage' },
  ],
  Plate: JniPlate,
};
