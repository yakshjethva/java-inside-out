import type { Dissection, DissectionProps } from '../types';
import { Arrow, Box, Kicker, Part, Text } from '../kit';

/* ───────────────────────── Method area (HotSpot metadata) ───────────────────────── */

function MethodAreaPlate({ activePart, onPart }: DissectionProps) {
  return (
    <g>
      <rect
        x={0}
        y={20}
        width={700}
        height={520}
        rx={10}
        fill="rgb(148 121 242 / 0.03)"
        stroke="var(--color-rt-500)"
        strokeOpacity={0.45}
        strokeDasharray="6 3.5"
      />
      <Kicker x={16} y={42}>
        METASPACE · NATIVE MEMORY (HOTSPOT)
      </Kicker>
      <rect
        x={740}
        y={20}
        width={280}
        height={520}
        rx={10}
        fill="rgb(148 121 242 / 0.03)"
        stroke="var(--color-rt-500)"
        strokeOpacity={0.45}
      />
      <Kicker x={756} y={42}>
        JAVA HEAP
      </Kicker>

      <Part
        id="instanceklass"
        label="InstanceKlass for Person"
        active={activePart === 'instanceklass'}
        onPart={onPart}
      >
        <Box
          x={24}
          y={60}
          w={330}
          h={260}
          tone="rt"
          dash="hotspot"
          active={activePart === 'instanceklass'}
        />
        <Text x={40} y={84} size={14} weight={600}>
          InstanceKlass · Person
        </Text>
        {[
          ['name', '"Person"'],
          ['super', '→ InstanceKlass java.lang.Object'],
          ['class loader data', "→ app loader's CLD"],
          ['constants', '→ ConstantPool'],
          ['methods', '→ [ <init>(String), getName() ]'],
          ['fields', 'name : String @ offset 12'],
          ['vtable', "Object's virtual methods + getName"],
          ['java mirror', '→ java.lang.Class (heap)'],
        ].map(([key, value], i) => (
          <g key={key}>
            <Text x={40} y={112 + i * 25} size={10.5} mono color="var(--color-fg-subtle)">
              {key}
            </Text>
            <Text x={170} y={112 + i * 25} size={10.5} mono color="var(--color-fg-muted)">
              {value}
            </Text>
          </g>
        ))}
      </Part>

      <Part
        id="constantpool"
        label="ConstantPool and its cache"
        active={activePart === 'constantpool'}
        onPart={onPart}
      >
        <Box
          x={390}
          y={60}
          w={290}
          h={150}
          tone="rt"
          dash="hotspot"
          active={activePart === 'constantpool'}
        />
        <Text x={406} y={84} size={14} weight={600}>
          ConstantPool · Person
        </Text>
        {[
          '#1 Methodref Object.<init>',
          '#7 Fieldref Person.name',
          '… names, descriptors, UTF-8',
        ].map((line, i) => (
          <Text key={line} x={406} y={110 + i * 20} size={10.5} mono color="var(--color-fg-muted)">
            {line}
          </Text>
        ))}
        <Text x={406} y={188} size={10.5} mono color="var(--color-exec-200)">
          + constant pool cache (resolved entries)
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 354, y: 178 },
          { x: 372, y: 178 },
          { x: 372, y: 135 },
          { x: 390, y: 135 },
        ]}
        tone="rt"
        marker="ij-arrow-data"
      />

      <Part
        id="methods"
        label="Method and ConstMethod"
        active={activePart === 'methods'}
        onPart={onPart}
      >
        <Box
          x={390}
          y={232}
          w={290}
          h={148}
          tone="rt"
          dash="hotspot"
          active={activePart === 'methods'}
        />
        <Text x={406} y={256} size={14} weight={600}>
          Method · Person.&lt;init&gt;(String)
        </Text>
        <Text x={406} y={278} size={10.5} mono color="var(--color-fg-subtle)">
          entry points · counters · flags
        </Text>
        <Text x={406} y={302} size={11} weight={600}>
          ConstMethod: bytecode (10 bytes)
        </Text>
        <Text x={406} y={324} size={11} mono color="var(--color-exec-200)">
          2a b7 00 01 2a 2b b5 00 07 b1
        </Text>
        <Text x={406} y={344} size={9.5} mono color="var(--color-fg-subtle)">
          aload_0 invokespecial #1 aload_0
        </Text>
        <Text x={406} y={360} size={9.5} mono color="var(--color-fg-subtle)">
          aload_1 putfield #7 return
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 354, y: 210 },
          { x: 380, y: 210 },
          { x: 380, y: 300 },
          { x: 390, y: 300 },
        ]}
        tone="rt"
        marker="ij-arrow-data"
      />

      <Part id="cld" label="ClassLoaderData" active={activePart === 'cld'} onPart={onPart}>
        <Box x={24} y={350} w={330} h={90} tone="rt" dash="hotspot" active={activePart === 'cld'} />
        <Text x={40} y={374} size={14} weight={600}>
          ClassLoaderData · app loader
        </Text>
        <Text x={40} y={396} size={11} color="var(--color-fg-muted)">
          Owns the Metaspace of every class this loader
        </Text>
        <Text x={40} y={412} size={11} color="var(--color-fg-muted)">
          defined; freed together when the loader is unloaded.
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 190, y: 320 },
          { x: 190, y: 348 },
        ]}
        tone="rt"
        marker="ij-arrow-data"
      />

      <Part
        id="class-space"
        label="Compressed class space"
        active={activePart === 'class-space'}
        onPart={onPart}
      >
        <Box
          x={24}
          y={458}
          w={656}
          h={62}
          tone="exec"
          dash="hotspot"
          active={activePart === 'class-space'}
        />
        <Text x={40} y={482} size={12} weight={600}>
          Compressed class space (1 GB reserved by default) holds Klass structures
        </Text>
        <Text x={40} y={502} size={11} color="var(--color-fg-muted)">
          so every object header can refer to its class with a 4-byte pointer.
        </Text>
      </Part>

      <Part
        id="mirror"
        label="java.lang.Class mirror"
        active={activePart === 'mirror'}
        onPart={onPart}
      >
        <Box x={760} y={60} w={240} h={150} tone="rt" active={activePart === 'mirror'} />
        <Text x={776} y={84} size={14} weight={600}>
          java.lang.Class · Person
        </Text>
        <Text x={776} y={108} size={11} color="var(--color-fg-muted)">
          The object Person.class returns.
        </Text>
        <Text x={776} y={128} size={11} color="var(--color-fg-muted)">
          Holds the static fields
        </Text>
        <Text x={776} y={144} size={11} color="var(--color-fg-muted)">
          (Person declares none).
        </Text>
        <Text x={776} y={170} size={10.5} mono color="var(--color-fg-subtle)">
          ↔ InstanceKlass
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 354, y: 287 },
          { x: 720, y: 287 },
          { x: 720, y: 135 },
          { x: 758, y: 135 },
        ]}
        tone="rt"
        dashed="5 4"
        marker="ij-arrow-data"
      />

      <Part
        id="instances"
        label="Person instances"
        active={activePart === 'instances'}
        onPart={onPart}
      >
        <Box x={760} y={240} w={240} h={110} tone="ok" active={activePart === 'instances'} />
        <Text x={776} y={264} size={14} weight={600}>
          Person instances
        </Text>
        <Text x={776} y={288} size={11} color="var(--color-fg-muted)">
          Each header's class pointer
        </Text>
        <Text x={776} y={304} size={11} color="var(--color-fg-muted)">
          refers to the InstanceKlass.
        </Text>
      </Part>
      <Arrow
        points={[
          { x: 758, y: 330 },
          { x: 724, y: 330 },
          { x: 724, y: 240 },
          { x: 356, y: 240 },
        ]}
        tone="exec"
        dashed="5 4"
        marker="ij-arrow-data"
      />
    </g>
  );
}

export const methodAreaDissection: Dissection = {
  id: 'method-area',
  title: 'The method area in HotSpot',
  subtitle: 'Class metadata for Person in Metaspace, and its mirror in the heap (JDK 25)',
  bounds: { x: -20, y: 0, w: 1060, h: 560 },
  accuracyNote:
    'The JVM Specification only requires a logical, shared method area. Everything named here (`InstanceKlass`, `ConstMethod`, `ClassLoaderData`, Metaspace, compressed class space) is HotSpot JDK 25 implementation. The bytecode bytes are read from the real `Person.class`; HotSpot may later rewrite some bytecodes in place to faster internal forms after they are resolved.',
  parts: [
    {
      id: 'instanceklass',
      label: 'InstanceKlass',
      componentId: 'method-area',
      description:
        "HotSpot's representation of a loaded class: links to its superclass, loader, constant pool, methods, field layout, vtable/itable and mirror.",
    },
    {
      id: 'constantpool',
      label: 'ConstantPool + cache',
      componentId: 'runtime-constant-pool',
      description:
        'The run-time constant pool. Resolution results are cached alongside it, so each symbolic reference is resolved once.',
    },
    {
      id: 'methods',
      label: 'Method / ConstMethod',
      description:
        '`Method` holds mutable per-method state (entry points, counters); `ConstMethod` holds the immutable bytecode, here the 10 bytes of `Person.<init>`.',
    },
    {
      id: 'cld',
      label: 'ClassLoaderData',
      componentId: 'unloading',
      description:
        'Metadata is allocated per class loader. When a loader becomes unreachable, its ClassLoaderData and all its classes are unloaded together.',
    },
    {
      id: 'class-space',
      label: 'Compressed class space',
      description:
        'A reserved part of Metaspace (`CompressedClassSpaceSize`, 1 GB by default) for `Klass` structures, addressable by 32-bit compressed class pointers.',
    },
    {
      id: 'mirror',
      label: 'Class mirror',
      componentId: 'heap',
      description:
        "The `java.lang.Class` object is an ordinary heap object. In HotSpot it also stores the class's static fields.",
    },
    {
      id: 'instances',
      label: 'Instances',
      componentId: 'heap',
      description:
        "Every object header points to its class's metadata. That pointer is how `getClass()`, virtual dispatch and the GC find the object's layout.",
    },
  ],
  references: [
    { source: 'jvms-2.5.4' },
    { source: 'jep-122' },
    { source: 'src-instanceklass' },
    { source: 'src-classloaderdata' },
    { source: 'src-method' },
  ],
  Plate: MethodAreaPlate,
};

/* ───────────────────────── Run-time constant pool ───────────────────────── */

const ROWS = [
  {
    id: 'cp7',
    index: '#7',
    kind: 'Class',
    symbolic: 'Person',
    used: 'new',
    resolved: '→ InstanceKlass Person (loads, links it)',
  },
  {
    id: 'cp9',
    index: '#9',
    kind: 'String',
    symbolic: '"Alex"',
    used: 'ldc',
    resolved: '→ interned java.lang.String in the heap',
  },
  {
    id: 'cp11',
    index: '#11',
    kind: 'Methodref',
    symbolic: 'Person."<init>":(Ljava/lang/String;)V',
    used: 'invokespecial',
    resolved: '→ Method* Person.<init>',
  },
  {
    id: 'cp14',
    index: '#14',
    kind: 'Fieldref',
    symbolic: 'java/lang/System.out:Ljava/io/PrintStream;',
    used: 'getstatic',
    resolved: "→ static field in System's mirror + offset",
  },
  {
    id: 'cp20',
    index: '#20',
    kind: 'Methodref',
    symbolic: 'Person.getName:()Ljava/lang/String;',
    used: 'invokevirtual',
    resolved: '→ vtable index of getName',
  },
  {
    id: 'cp24',
    index: '#24',
    kind: 'Methodref',
    symbolic: 'java/io/PrintStream.println:(Ljava/lang/String;)V',
    used: 'invokevirtual',
    resolved: '→ vtable index of println(String)',
  },
];

function RcpPlate({ activePart, onPart }: DissectionProps) {
  const cols = [0, 64, 170, 520, 640];
  return (
    <g>
      <Kicker x={0} y={10}>
        MAIN'S RUN-TIME CONSTANT POOL · ENTRIES USED BY MAIN()
      </Kicker>
      {[
        '#',
        'kind',
        'symbolic reference (from Main.class)',
        'used by',
        'after resolution (HotSpot)',
      ].map((header, i) => (
        <Text
          key={header}
          x={cols[i]! + 12}
          y={42}
          size={10}
          mono
          color="var(--color-fg-subtle)"
          spacing="0.06em"
        >
          {header.toUpperCase()}
        </Text>
      ))}
      {ROWS.map((row, i) => {
        const y = 54 + i * 56;
        const active = activePart === row.id;
        return (
          <Part
            key={row.id}
            id={row.id}
            label={`${row.index} ${row.kind} ${row.symbolic}`}
            active={active}
            onPart={onPart}
          >
            <Box
              x={0}
              y={y}
              w={1000}
              h={46}
              tone={active ? 'exec' : 'rt'}
              active={active}
              radius={5}
            />
            <Text x={12} y={y + 28} size={12} mono color="var(--color-fg-subtle)">
              {row.index}
            </Text>
            <Text x={cols[1]! + 12} y={y + 28} size={12} mono color="var(--color-rt-300)">
              {row.kind}
            </Text>
            <Text x={cols[2]! + 12} y={y + 28} size={11} mono color="var(--color-fg-muted)">
              {row.symbolic.length > 44 ? `${row.symbolic.slice(0, 43)}…` : row.symbolic}
            </Text>
            <Text x={cols[3]! + 12} y={y + 28} size={11} mono color="var(--color-exec-200)">
              {row.used}
            </Text>
            <Text x={cols[4]! + 12} y={y + 28} size={11} color="var(--color-ok-300)">
              {row.resolved}
            </Text>
          </Part>
        );
      })}
      <Part id="lazy" label="Lazy resolution" active={activePart === 'lazy'} onPart={onPart}>
        <Box x={0} y={398} w={490} h={84} tone="idle" active={activePart === 'lazy'} />
        <Text x={14} y={422} size={13} weight={600}>
          Resolved lazily, once
        </Text>
        <Text x={14} y={444} size={11} color="var(--color-fg-muted)">
          Each entry stays symbolic until an instruction first uses
        </Text>
        <Text x={14} y={460} size={11} color="var(--color-fg-muted)">
          it; the result (or the error) is then cached.
        </Text>
      </Part>
      <Part
        id="cpcache"
        label="Constant pool cache"
        active={activePart === 'cpcache'}
        onPart={onPart}
      >
        <Box
          x={510}
          y={398}
          w={490}
          h={84}
          tone="exec"
          dash="hotspot"
          active={activePart === 'cpcache'}
        />
        <Text x={524} y={422} size={13} weight={600}>
          HotSpot: ConstantPool + cache
        </Text>
        <Text x={524} y={444} size={11} color="var(--color-fg-muted)">
          ResolvedFieldEntry / ResolvedMethodEntry / ResolvedIndyEntry
        </Text>
        <Text x={524} y={460} size={11} color="var(--color-fg-muted)">
          arrays record what each reference resolved to.
        </Text>
      </Part>
    </g>
  );
}

export const rcpDissection: Dissection = {
  id: 'runtime-constant-pool',
  title: "Main's run-time constant pool",
  subtitle: 'Symbolic references from the class file, and what they resolve to',
  bounds: { x: -20, y: -10, w: 1040, h: 510 },
  accuracyNote:
    'Indexes, kinds and symbolic references are real `javap -v Main.class` output (JDK 25). The "after resolution" column describes HotSpot\'s cached results in simplified terms; for example a non-final virtual method resolves to a method plus a vtable index, and final methods are called directly.',
  parts: [
    {
      id: 'cp7',
      label: '#7 Class Person',
      componentId: 'resolution',
      description:
        'First used by `new #7`. Resolution loads `Person` through the application loader, links it, and caches the class.',
    },
    {
      id: 'cp9',
      label: '#9 String "Alex"',
      description:
        "First used by `ldc #9`. Resolves to an interned `java.lang.String` object in the heap, which stays reachable through the class's resolved references.",
    },
    {
      id: 'cp11',
      label: '#11 Methodref Person.<init>',
      description:
        'Used by `invokespecial`: resolved to the exact constructor, so no virtual dispatch is needed.',
    },
    {
      id: 'cp14',
      label: '#14 Fieldref System.out',
      description:
        'Used by `getstatic`: resolves the field and its holder class; `System` must be initialized (it already is during start-up).',
    },
    {
      id: 'cp20',
      label: '#20 Methodref Person.getName',
      description:
        "Used by `invokevirtual`: resolution finds the method; each call then selects the implementation through the receiver's vtable (the JIT may inline it).",
    },
    {
      id: 'cp24',
      label: '#24 Methodref PrintStream.println',
      description:
        'Another virtual call, resolved once and dispatched through the vtable at each call.',
    },
    {
      id: 'lazy',
      label: 'Lazy resolution',
      componentId: 'resolution',
      description:
        'JVMS §5.4.3 allows lazy or eager resolution, but errors must surface at the instruction that uses the reference. HotSpot resolves at first use.',
    },
    {
      id: 'cpcache',
      label: 'Constant pool cache',
      description:
        'HotSpot keeps resolution results next to the constant pool, so the interpreter can jump straight to field offsets and method entries.',
    },
  ],
  references: [
    { source: 'jvms-2.5.5' },
    { source: 'jvms-5.1' },
    { source: 'jvms-5.4.3' },
    { source: 'src-cpcache' },
    { source: 'tool-javap' },
  ],
  Plate: RcpPlate,
};
