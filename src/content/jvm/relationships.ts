import type { Relationship } from '@/types/content';
import type { ComponentId } from './ids';

/**
 * Directed relationships between anatomy components. Read each one as
 * "<from> <label> <to>". Every relationship is drawn as a connector and listed,
 * navigable, in the inspector of both endpoints.
 */
export const RELATIONSHIPS: Relationship[] = [
  // ── Build time and launch ────────────────────────────────────────────────
  {
    id: 'source-to-javac',
    from: 'source-file',
    to: 'javac',
    kind: 'control',
    label: 'is compiled by',
    description: 'The developer (or build tool) passes source files to `javac`.',
    provenance: 'platform',
  },
  {
    id: 'javac-to-class-file',
    from: 'javac',
    to: 'class-file',
    kind: 'data',
    label: 'emits',
    description:
      '`javac` writes one class file per class or interface, containing bytecode and a constant pool.',
    provenance: 'platform',
  },
  {
    id: 'class-file-to-loading',
    from: 'class-file',
    to: 'loading',
    kind: 'data',
    label: 'bytes are read during',
    description:
      'A class loader locates the class file (on the class path, module path, or in the runtime image / CDS archive) and hands its bytes to the JVM, which derives a class from them (JVMS §5.3.5).',
  },
  {
    id: 'launcher-creates-jvm',
    from: 'launcher',
    to: 'jvm',
    kind: 'control',
    label: 'creates (JNI_CreateJavaVM)',
    description:
      'The `java` launcher loads `libjvm` into the same process and creates the virtual machine with the JNI Invocation API, then loads the main class and calls `main`.',
    provenance: 'platform',
  },

  // ── Class loading ────────────────────────────────────────────────────────
  {
    id: 'custom-delegates-app',
    from: 'custom-loaders',
    to: 'application-loader',
    kind: 'delegation',
    label: 'usually delegates to',
    description:
      'A user-defined loader is typically created with the application (system) loader as its parent, and asks it first. Loaders may choose a different parent or override the policy.',
  },
  {
    id: 'app-delegates-platform',
    from: 'application-loader',
    to: 'platform-loader',
    kind: 'delegation',
    label: 'delegates to parent',
    description:
      'For packages not in a named module it owns, the application loader delegates to its parent, the platform loader, before searching the class path.',
  },
  {
    id: 'platform-delegates-boot',
    from: 'platform-loader',
    to: 'bootstrap-loader',
    kind: 'delegation',
    label: 'delegates to parent',
    description:
      "The platform loader's parent is the bootstrap loader (represented as `null`). Requests for boot-module packages go straight there.",
  },
  {
    id: 'delegation-selects-loader',
    from: 'parent-delegation',
    to: 'loading',
    kind: 'delegation',
    label: 'chooses the defining loader for',
    description:
      "Delegation decides which loader ends up defining the class. That loader becomes part of the class's run-time identity.",
  },
  {
    id: 'loading-then-linking',
    from: 'loading',
    to: 'linking',
    kind: 'lifecycle',
    label: 'is followed by',
    description: 'A class must be loaded before it is linked (JVMS §5.4).',
  },
  {
    id: 'verification-then-preparation',
    from: 'verification',
    to: 'preparation',
    kind: 'lifecycle',
    label: 'is followed by',
    description: 'Verification must succeed before the class is prepared.',
  },
  {
    id: 'preparation-then-resolution',
    from: 'preparation',
    to: 'resolution',
    kind: 'lifecycle',
    label: 'is followed (often lazily) by',
    description:
      'Resolution may happen much later and one reference at a time: HotSpot resolves each symbolic reference the first time an instruction uses it.',
  },
  {
    id: 'linking-then-initialization',
    from: 'linking',
    to: 'initialization',
    kind: 'lifecycle',
    label: 'precedes',
    description: 'A class is verified and prepared before it is initialized (JVMS §5.5).',
  },
  {
    id: 'loading-creates-metadata',
    from: 'loading',
    to: 'method-area',
    kind: 'data',
    label: 'creates class metadata in',
    description:
      "Loading builds the class's internal representation in the method area (HotSpot: an `InstanceKlass` in Metaspace) and a `java.lang.Class` object in the heap.",
  },
  {
    id: 'resolution-updates-rcp',
    from: 'resolution',
    to: 'runtime-constant-pool',
    kind: 'data',
    label: 'resolves entries of',
    description:
      "Resolution replaces symbolic references in a class's run-time constant pool with direct references, and caches the result (HotSpot: the constant pool cache).",
  },
  {
    id: 'initialization-runs-on-engine',
    from: 'initialization',
    to: 'execution-engine',
    kind: 'control',
    label: 'runs <clinit> on',
    description:
      "The class initialization method `<clinit>` is ordinary bytecode: the execution engine runs it in a frame on the initializing thread's stack, usually in the interpreter.",
  },
  {
    id: 'gc-triggers-unloading',
    from: 'garbage-collector',
    to: 'unloading',
    kind: 'control',
    label: 'performs',
    description:
      'In HotSpot, class unloading happens as part of garbage collection, when a class loader and all its classes have become unreachable.',
    provenance: 'hotspot',
  },

  // ── Runtime data areas ──────────────────────────────────────────────────
  {
    id: 'method-area-mirror-in-heap',
    from: 'method-area',
    to: 'heap',
    kind: 'data',
    label: 'is mirrored by Class objects in',
    description:
      "HotSpot: each class's metadata in Metaspace has a `java.lang.Class` mirror object in the Java heap, which also stores the class's static fields.",
    provenance: 'hotspot',
  },

  // ── Execution engine ────────────────────────────────────────────────────
  {
    id: 'interpreter-uses-stack',
    from: 'interpreter',
    to: 'jvm-stack',
    kind: 'control',
    label: 'pushes and pops frames on',
    description:
      "Every invocation pushes a frame on the current thread's JVM stack; every return or uncaught exception pops it. The interpreter reads and writes the current frame's locals and operand stack.",
  },
  {
    id: 'interpreter-advances-pc',
    from: 'interpreter',
    to: 'pc-register',
    kind: 'control',
    label: 'advances',
    description:
      "After each instruction the interpreter moves the thread's pc to the next instruction, or to a branch target.",
  },
  {
    id: 'engine-reads-bytecode',
    from: 'execution-engine',
    to: 'method-area',
    kind: 'data',
    label: 'reads bytecode and metadata from',
    description:
      'The interpreter fetches bytecode and constant pool entries from the method area (HotSpot: `ConstMethod` and `ConstantPool` in Metaspace); the JIT compilers read the same metadata when they compile a method.',
  },
  {
    id: 'engine-uses-heap',
    from: 'execution-engine',
    to: 'heap',
    kind: 'data',
    label: 'allocates and accesses objects in',
    description:
      "`new`, `newarray`, `getfield`, `putfield` and array instructions allocate and access objects in the heap, whether they run in the interpreter or as compiled code (which also contains the GC's barrier code).",
  },
  {
    id: 'interpreter-feeds-profiler',
    from: 'interpreter',
    to: 'profiler',
    kind: 'control',
    label: 'updates counters in',
    description:
      'The interpreter counts invocations and loop back-edges and can record profiles, which tell the compilation policy what is hot.',
    provenance: 'hotspot',
  },
  {
    id: 'profiler-triggers-jit',
    from: 'profiler',
    to: 'jit-compiler',
    kind: 'control',
    label: 'triggers compilation in',
    description:
      'When counters cross tier thresholds, the compilation policy queues a compile task; profiles then guide the optimizer.',
    provenance: 'hotspot',
  },
  {
    id: 'jit-installs-code',
    from: 'jit-compiler',
    to: 'code-cache',
    kind: 'data',
    label: 'installs nmethods into',
    description:
      'Finished compilations are installed as nmethods in the code cache; later calls jump to them instead of the interpreter.',
    provenance: 'hotspot',
  },
  {
    id: 'code-cache-deopt',
    from: 'code-cache',
    to: 'deoptimization',
    kind: 'exception',
    label: 'falls back through',
    description:
      'When an assumption baked into compiled code fails, its uncommon trap enters the deoptimization machinery.',
    provenance: 'hotspot',
  },
  {
    id: 'deopt-resumes-interpreter',
    from: 'deoptimization',
    to: 'interpreter',
    kind: 'exception',
    label: 'resumes execution in',
    description:
      "Deoptimization rebuilds interpreter frames from the compiled frame's debug information and continues in the interpreter.",
    provenance: 'hotspot',
  },
  {
    id: 'code-runs-on-cpu',
    from: 'code-cache',
    to: 'cpu',
    kind: 'control',
    label: 'holds machine code executed by the',
    description:
      'Interpreter templates, stubs and JIT-compiled methods are native instructions that the CPU executes directly.',
    provenance: 'hotspot',
  },
  {
    id: 'engine-calls-jni',
    from: 'execution-engine',
    to: 'jni',
    kind: 'native',
    label: 'invokes native methods through',
    description:
      'Invoking a `native` method transitions the thread to native state and calls the bound C function through a JNI stub.',
  },

  // ── Garbage collection ──────────────────────────────────────────────────
  {
    id: 'gc-reclaims-heap',
    from: 'garbage-collector',
    to: 'heap',
    kind: 'control',
    label: 'reclaims memory in',
    description:
      'The collector finds unreachable objects and makes their space available for new allocations.',
  },
  {
    id: 'stack-refs-are-roots',
    from: 'jvm-stack',
    to: 'gc-roots',
    kind: 'data',
    label: 'frame references are',
    description:
      "References held in the local variables and operand stacks of every thread's frames are GC roots. Compiled code tells the GC exactly which slots hold references (oop maps).",
  },
  {
    id: 'statics-are-roots',
    from: 'method-area',
    to: 'gc-roots',
    kind: 'data',
    label: 'class statics and loaders are',
    description:
      'Static fields of loaded classes and the class loaders themselves keep objects alive (HotSpot: through class mirrors and ClassLoaderData).',
  },
  {
    id: 'roots-seed-marking',
    from: 'gc-roots',
    to: 'marking',
    kind: 'control',
    label: 'seed',
    description: 'Marking starts from the roots and follows references transitively.',
  },
  {
    id: 'marking-then-sweeping',
    from: 'marking',
    to: 'sweeping',
    kind: 'control',
    label: 'enables',
    description: 'Unmarked space can be reclaimed in place.',
  },
  {
    id: 'sweeping-then-compaction',
    from: 'sweeping',
    to: 'compaction',
    kind: 'control',
    label: 'or is replaced by',
    description:
      'Compacting and copying collectors move live objects instead of freeing dead ones in place, which also removes fragmentation.',
  },

  // ── Native and platform ─────────────────────────────────────────────────
  {
    id: 'jni-uses-native-stack',
    from: 'jni',
    to: 'native-method-stack',
    kind: 'native',
    label: 'runs native frames on',
    description:
      "Native functions execute in C frames on the calling thread's stack (in HotSpot, the same stack that holds its Java frames).",
  },
  {
    id: 'jni-calls-libraries',
    from: 'jni',
    to: 'native-libraries',
    kind: 'native',
    label: 'binds and calls into',
    description:
      'Native methods are bound to symbols in loaded native libraries (JVMS §5.6) and called with a `JNIEnv*`.',
  },
  {
    id: 'libraries-make-syscalls',
    from: 'native-libraries',
    to: 'system-calls',
    kind: 'native',
    label: 'make',
    description: 'File, socket and other OS operations end in system calls made by native code.',
    provenance: 'platform',
  },
  {
    id: 'process-threads-os',
    from: 'java-process',
    to: 'os-threads',
    kind: 'native',
    label: 'runs on threads scheduled by',
    description:
      'Each Java platform thread, and each internal JVM thread, is an OS thread scheduled by the operating system.',
    provenance: 'platform',
  },
  {
    id: 'process-memory-os',
    from: 'java-process',
    to: 'virtual-memory',
    kind: 'native',
    label: 'reserves its memory areas from',
    description:
      "The Java heap, Metaspace, code cache and thread stacks are all carved out of the process's virtual address space.",
    provenance: 'platform',
  },
];

export const RELATIONSHIP_BY_ID = Object.fromEntries(RELATIONSHIPS.map((r) => [r.id, r]));

export function relationshipsOf(id: ComponentId) {
  return {
    outgoing: RELATIONSHIPS.filter((r) => r.from === id),
    incoming: RELATIONSHIPS.filter((r) => r.to === id),
  };
}
