import type { ComponentDoc } from '@/types/content';

const V = 'OpenJDK 25.0.4 · Linux x64';

export const executionComponents: ComponentDoc[] = [
  {
    id: 'execution-engine',
    name: 'Execution engine',
    label: 'Execution engine',
    parent: 'jvm',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Turns bytecode into work on the CPU: an interpreter first, then JIT-compiled machine code for hot code.',
    beginner:
      'The part of the JVM that actually runs your code. It starts by interpreting bytecode one instruction at a time. Code that runs often is compiled to native machine code while the program runs, so it gets much faster.',
    technical:
      'The JVM Specification defines what each instruction does, not how to execute it, and explicitly allows translating bytecode to native code at load time or during execution (JVMS §2.13). HotSpot\'s engine is "mixed mode": a template [[interpreter]], [[tiered-compilation|tiered]] JIT compilation with C1 and C2, a [[code-cache]] for compiled code, runtime profiling that steers the compilers, and [[deoptimization]] to fall back when speculative assumptions break.',
    purpose:
      'Start running immediately, then make the hot parts fast, without giving up correctness.',
    internals: [
      'Interpreter',
      'Runtime profiling',
      'JIT compiler: compilation, optimization, C1, C2',
      'Code cache',
      'Deoptimization',
    ],
    inputs: ['Bytecode and metadata from the method area', "Frames on each thread's stack"],
    outputs: [
      'Machine instructions executed by the CPU',
      'Objects and frames in the runtime data areas',
    ],
    example: {
      title: 'Mixed mode, as reported by the JVM',
      language: 'shell',
      code: '$ java -version',
      output: `openjdk version "25.0.4.1" 2026-08-18
OpenJDK Runtime Environment (build 25.0.4.1+1-1-24.04.4-Ubuntu)
OpenJDK 64-Bit Server VM (build 25.0.4.1+1-1-24.04.4-Ubuntu, mixed mode, sharing)`,
      verifiedWith: V,
    },
    practice:
      '`-Xint` disables JIT compilation (interpreter only) and `-Xcomp` compiles methods on first call; both are for diagnosis, not production. Warm-up — the time before hot code is compiled — is why benchmarks need a harness such as JMH.',
    misconceptions: [
      {
        myth: 'Java is interpreted, so it is slow.',
        truth:
          'Hot code runs as optimized machine code produced by C2, often using run-time profile information that an ahead-of-time compiler does not have.',
      },
    ],
    specVsImpl: {
      spec: 'Instruction semantics only. Interpretation, compilation and their mix are implementation choices.',
      implementation:
        'HotSpot JDK 25: template interpreter, tiered C1/C2 JIT, segmented code cache, deoptimization.',
    },
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'jvms-2.13' },
      { source: 'jvms-2.11' },
      { source: 'src-compilation-policy' },
    ],
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    label: 'Interpreter',
    caption: 'HotSpot: template interpreter',
    parent: 'execution-engine',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Executes bytecode instruction by instruction; in HotSpot each bytecode is a pre-generated machine-code template.',
    beginner:
      'The interpreter reads one bytecode instruction, does what it says, then moves to the next. It can start immediately, without waiting for any compilation.',
    technical:
      "JVMS §2.11 describes the conceptual loop: fetch an opcode, fetch its operands, execute the action, repeat. HotSpot's **template interpreter** is not a `switch` loop in C++: at VM start-up it generates a small machine-code template for every bytecode (`TemplateTable`) and dispatches from one to the next through a table indexed by opcode. It keeps the bytecode pointer, locals pointer and top-of-stack value in registers, increments invocation and back-edge counters, records profiles, and polls for safepoints at returns and loop back-edges. The generated interpreter lives in the code cache.",
    purpose: 'Run code with zero compilation delay and collect the information the JIT needs.',
    internals: [
      'Dispatch table indexed by opcode',
      'One machine-code template per bytecode',
      'Counters and profiling hooks',
      'Safepoint polls',
    ],
    inputs: ["Bytecode via the method's `ConstMethod`", 'The current frame'],
    outputs: [
      'Frame and heap updates',
      'Invocation and back-edge counters for the compilation policy',
    ],
    practice:
      'Run a CPU-heavy benchmark with `-Xint` to see the gap between interpreted and compiled speed. Profilers show interpreted frames separately; many interpreted frames in a hot path after warm-up suggest compilation problems (for example a full code cache).',
    misconceptions: [
      {
        myth: 'The interpreter parses Java source or text.',
        truth: 'It executes bytecode from class files. Source code never reaches the JVM.',
      },
      {
        myth: 'HotSpot interprets with a big `switch` statement.',
        truth:
          'Standard builds use generated machine-code templates. The C++ `BytecodeInterpreter` exists only for the Zero port, which has no JIT.',
      },
    ],
    specVsImpl: {
      spec: 'Conceptual fetch-decode-execute loop over JVM instructions.',
      implementation:
        'HotSpot: template interpreter generated at start-up, with register-cached state and profiling.',
    },
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'jvms-2.11' },
      { source: 'src-template-interpreter' },
      { source: 'src-template-table' },
    ],
  },
  {
    id: 'profiler',
    name: 'Runtime profiling',
    label: 'Runtime profiling',
    caption: 'counters · MethodData',
    parent: 'execution-engine',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Counts invocations and loop iterations and records types and branches, so the JIT knows what is hot and how it behaves.',
    beginner:
      'While code runs, the JVM keeps statistics: how often each method is called, how often loops repeat, which way `if` statements usually go, and what types of objects show up. These statistics decide what gets compiled and how.',
    technical:
      'Each method has counters (`MethodCounters`) for invocations and loop back-edges. Detailed profiles live in a per-method `MethodData` object (MDO): receiver types seen at virtual call sites, branch taken / not-taken counts, null seen, type-check outcomes. Tiered compilation collects them in the interpreter and, mainly, in tier-3 C1 code with full profiling. C2 uses them to speculate: inline the one receiver type seen, compile only the branches taken, omit null checks never needed. JDK 25 can also store profiles from a training run in an AOT cache (JEP 515), so a new process starts with them.',
    purpose: 'Compile what matters and optimize it for how the program actually behaves.',
    internals: [
      'Invocation and back-edge counters',
      'MethodData: type, branch, null and call-site profiles',
    ],
    inputs: ['Execution in the interpreter and tier-2/3 C1 code'],
    outputs: ['Compilation triggers', 'Profile data consumed by C2'],
    practice:
      'Profiles are why "warm-up" matters: a service that behaves differently during the first minutes (for example only health checks) can be optimized for the wrong paths, then deoptimize when real traffic arrives.',
    misconceptions: [
      {
        myth: 'This is a profiler like a tool you attach (JFR, async-profiler).',
        truth:
          'It is internal bookkeeping for the JIT. Tools such as Java Flight Recorder are separate and observe the program for you.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'src-methoddata' },
      { source: 'src-compilation-policy' },
      { source: 'jep-515' },
    ],
  },
  {
    id: 'jit-compiler',
    name: 'JIT compiler',
    label: 'JIT compiler',
    caption: 'tiered: levels 0–4',
    parent: 'execution-engine',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Compiles hot methods to native machine code while the program runs, guided by profiles.',
    beginner:
      'The just-in-time compiler watches for code that runs a lot and translates it into native machine code for your CPU while the program is running. From then on, that code runs much faster than in the interpreter.',
    technical:
      'HotSpot uses tiered compilation (`compilationPolicy.hpp`): level 0 interpreter; 1 C1 without profiling; 2 C1 with invocation and back-edge counters; 3 C1 with full profiling; 4 C2. The common path is 0 → 3 → 4; trivial methods go to level 1; when the C2 queue is long, methods may take 0 → 2 → 3 → 4. Transitions are governed by thresholds such as `Tier3InvocationThreshold` (200) and `Tier4InvocationThreshold` (5000), scaled by compiler-queue load. Compilation runs in background compiler threads (3 in our measured run on 4 CPUs) while the application keeps executing.\n\nOpenJDK 25 builds ship C1 and C2; GraalVM distributions can plug in the Graal compiler instead through JVMCI.',
    purpose:
      'Get native-code speed for the small fraction of code where the program spends its time.',
    internals: [
      'Compile broker: queues and compiler threads',
      'Compilation and optimization pipelines',
      'C1 (client) and C2 (server) compilers',
    ],
    inputs: ['Hot methods and loops selected by the compilation policy', 'Profiles (MethodData)'],
    outputs: ['nmethods installed in the code cache'],
    example: {
      title: 'Watching tiers with -XX:+PrintCompilation',
      language: 'shell',
      code: '$ java -XX:+PrintCompilation -cp . Hot | grep Hot::',
      output: `38   11       3       Hot::square (4 bytes)
38   12       4       Hot::square (4 bytes)
38   11       3       Hot::square (4 bytes)   made not entrant: not used
40   13 %     3       Hot::main @ 4 (32 bytes)
40   14       3       Hot::main (32 bytes)
41   15 %     4       Hot::main @ 4 (32 bytes)`,
      verifiedWith: `${V}; columns: time (ms), compile id, flags (% = OSR), tier, method`,
    },
    practice:
      "`-XX:+PrintCompilation` and JFR's compilation events show what gets compiled. `-XX:TieredStopAtLevel=1` (C1 only) can shorten start-up for short-lived tools at the cost of peak performance.",
    misconceptions: [
      {
        myth: 'The JIT compiles the whole program at start-up.',
        truth:
          'It compiles individual methods (and loops, via OSR) once they are hot. Most code is never compiled.',
      },
      {
        myth: 'All JVMs use C1 and C2.',
        truth:
          'C1/C2 and tiered compilation are HotSpot design choices. Other JVMs use different compilers, and some run ahead-of-time compiled code.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'src-compilation-policy' },
      { source: 'src-compilebroker' },
      { source: 'jvms-2.13' },
      { source: 'jep-410' },
    ],
  },
  {
    id: 'compilation',
    name: 'Compilation',
    label: 'Compilation',
    caption: 'queue · IR · OSR',
    parent: 'jit-compiler',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      "Turns a method's bytecode into an installed nmethod; on-stack replacement compiles running loops.",
    beginner:
      'When a method becomes hot, the JVM puts a request in a queue. A compiler thread picks it up, translates the bytecode into machine code, and installs it. Meanwhile the program keeps running in the interpreter, so nobody waits.',
    technical:
      'The compile broker queues a `CompileTask` per method and tier. A compiler thread parses bytecode into an intermediate representation (C1: HIR then LIR; C2: the sea-of-nodes "ideal graph"), optimizes it, allocates registers, and emits machine code plus metadata: oop maps (where references are, for the GC), debug information (to rebuild interpreter frames on deoptimization) and dependencies (assumptions to invalidate if, for example, a new subclass is loaded). The result is installed as an `nmethod` in the code cache. **On-stack replacement** (OSR, the `%` in `PrintCompilation`) compiles a long-running loop and moves the executing interpreter frame into compiled code mid-method.',
    purpose:
      'Produce correct machine code asynchronously, with enough metadata to undo optimizations safely.',
    internals: [
      'Compile queues per compiler',
      'Intermediate representations',
      'Code generation and metadata',
      'OSR entry points',
    ],
    inputs: ['Bytecode, profiles, class hierarchy information'],
    outputs: ['nmethods (normal or OSR) in the code cache'],
    practice:
      'A long-running loop in `main` gets compiled via OSR even though `main` is invoked only once — the reason microbenchmarks without warm-up and proper structure mislead.',
    misconceptions: [
      {
        myth: 'The thread that runs the code waits while the method is compiled.',
        truth:
          'By default (`BackgroundCompilation`), compilation happens on separate compiler threads; the application keeps interpreting.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'src-compilebroker' },
      { source: 'src-nmethod' },
      { source: 'src-compilation-policy' },
    ],
  },
  {
    id: 'optimization',
    name: 'Optimization',
    label: 'Optimization',
    caption: 'inlining · escape analysis',
    parent: 'jit-compiler',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Profile-guided transformations: inlining, escape analysis, loop optimizations, intrinsics, speculation.',
    beginner:
      'Before generating machine code, the compiler improves the program: it copies small methods into their callers, removes work whose result is never used, and avoids creating objects that never leave a method.',
    technical:
      'Key HotSpot optimizations: **inlining** (methods up to `MaxInlineSize` = 35 bytes of bytecode at cold sites, up to `FreqInlineSize` = 325 at hot sites), enabled across virtual calls by class hierarchy analysis and type profiles; **[[escape-analysis|escape analysis]]** in C2 with scalar replacement (`EliminateAllocations`) and lock elision; loop unrolling, range-check elimination and auto-vectorization; intrinsics (hand-written machine code for methods such as `System.arraycopy`); implicit null checks that rely on hardware traps; constant folding and dead-code elimination. Many are **speculative**: they hold only while profile-derived assumptions hold, with [[deoptimization]] as the safety net.',
    purpose: 'Remove abstraction cost so idiomatic Java runs close to hand-written native code.',
    internals: [
      'Inlining and devirtualization',
      'Escape analysis and scalar replacement',
      'Loop optimizations',
      'Intrinsics',
      'Speculation with uncommon traps',
    ],
    inputs: ['Intermediate representation and profiles'],
    outputs: ['Optimized IR for code generation', 'Dependencies and uncommon traps'],
    practice:
      'Small methods, monomorphic call sites and short-lived objects that do not escape are cheap in hot code. Megamorphic call sites (many receiver types) and huge methods block inlining.',
    misconceptions: [
      {
        myth: 'Creating short-lived objects is always expensive.',
        truth:
          'Allocation in a TLAB is cheap, and when escape analysis succeeds there is no allocation at all.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'src-escape' }, { source: 'src-c2' }, { source: 'src-deoptimization' }],
  },
  {
    id: 'c1',
    name: 'C1 compiler',
    label: 'C1',
    caption: 'client · tiers 1–3',
    parent: 'jit-compiler',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Fast, moderately optimizing compiler used for tiers 1–3; tier 3 code collects full profiles.',
    beginner:
      'The quick compiler. It produces decent machine code fast, so hot methods leave the interpreter early.',
    technical:
      'C1 (historically the "client" compiler) builds a high-level IR in SSA form, applies inlining, constant folding, value numbering and null-check elimination, lowers to LIR, and uses linear-scan register allocation. Tier 3 C1 code is instrumented to fill the method\'s MDO with profiles for C2; tier 2 records only counters; tier 1 has no profiling and is final for trivial methods.',
    purpose: 'Short compile times and early speed-up, plus the profiling that feeds C2.',
    internals: [
      'HIR / LIR',
      'Linear-scan register allocation',
      'Profiling instrumentation (tier 3)',
    ],
    inputs: ['Methods queued at tiers 1–3'],
    outputs: ['nmethods in the profiled (tiers 2–3) or non-profiled (tier 1) code-cache segment'],
    practice:
      '`-XX:TieredStopAtLevel=1` runs only C1 at level 1: faster start-up and lower memory use, lower peak throughput.',
    misconceptions: [
      {
        myth: 'C1 code is only used on desktop ("client") machines.',
        truth:
          'With tiered compilation every HotSpot JVM uses C1 for warm code, and C2 for the hottest.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'src-c1' }, { source: 'src-compilation-policy' }],
  },
  {
    id: 'c2',
    name: 'C2 compiler',
    label: 'C2',
    caption: 'server · tier 4',
    parent: 'jit-compiler',
    provenance: 'hotspot',
    scope: 'shared',
    summary: 'Aggressive, profile-guided optimizing compiler used for tier 4.',
    beginner:
      'The thorough compiler. It takes longer, but it produces the fastest machine code for the hottest methods.',
    technical:
      'C2 (the "server" or "opto" compiler) parses bytecode into a sea-of-nodes graph, performs global optimizations — aggressive inlining, escape analysis, loop transformations, auto-vectorization, global code motion — and allocates registers with graph colouring. It speculates heavily on profile data and plants uncommon traps where assumptions might fail. C2 compilations are more expensive in CPU and memory than C1\'s.',
    purpose: 'Peak performance for the code that dominates execution time.',
    internals: [
      'Ideal graph (sea of nodes)',
      'Escape analysis, loop opts, vectorization',
      'Graph-colouring register allocation',
      'Uncommon traps',
    ],
    inputs: ['Hot methods with mature profiles (tier 4)'],
    outputs: ['nmethods in the non-profiled code-cache segment'],
    practice:
      'C2 compiler threads can consume noticeable CPU during warm-up; on very small containers this competes with the application.',
    misconceptions: [
      {
        myth: 'C2 output is always faster than C1 output.',
        truth:
          'Usually, but speculative C2 code can deoptimize if the profile was unrepresentative, temporarily falling back to the interpreter.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'src-c2' }, { source: 'src-escape' }],
  },
  {
    id: 'code-cache',
    name: 'Code cache',
    label: 'Code cache',
    caption: 'segmented · 240 MB reserved',
    parent: 'execution-engine',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Native memory holding generated machine code: the interpreter, stubs and JIT-compiled methods.',
    beginner:
      'The place where the JVM stores machine code it generated: the interpreter itself and every compiled method. The CPU executes code directly from here.',
    technical:
      'A reserved native memory region (`ReservedCodeCacheSize`, 240 MB with tiered compilation). Since JDK 9 it is segmented (JEP 197) into **non-nmethods** (interpreter, adapters, runtime stubs), **profiled nmethods** (tier 2–3 C1 code) and **non-profiled nmethods** (tier 1 C1 and tier 4 C2 code), which reduces fragmentation and speeds up scanning. When it fills up, HotSpot stops compiling ("CodeCache is full. Compiler has been disabled.") and performance degrades. Since JDK 20 there is no separate sweeper thread; unused compiled code is unloaded with GC-driven unloading.',
    purpose: 'Executable memory for generated code, organized by code lifetime.',
    internals: ['Non-nmethod segment', 'Profiled nmethod segment', 'Non-profiled nmethod segment'],
    inputs: ['Installed nmethods, generated stubs'],
    outputs: ['Executable code for the CPU'],
    example: {
      title: 'Segment sizes at exit (-XX:+PrintCodeCache)',
      language: 'shell',
      code: '$ java -XX:+PrintCodeCache -cp . Hot',
      output: `CodeHeap 'non-profiled nmethods': size=120032Kb used=3Kb max_used=3Kb free=120028Kb
CodeHeap 'profiled nmethods': size=120032Kb used=9Kb max_used=9Kb free=120022Kb
CodeHeap 'non-nmethods': size=5700Kb used=1265Kb max_used=1279Kb free=4434Kb
 total_blobs=314, nmethods=14, adapters=206, full_count=0`,
      verifiedWith: V,
    },
    practice:
      'Large applications (many frameworks, generated code) can fill the code cache; watch for the "CodeCache is full" warning and use `jcmd <pid> Compiler.codecache`. Raise `-XX:ReservedCodeCacheSize` if needed.',
    misconceptions: [
      {
        myth: 'The code cache is part of the Java heap.',
        truth: 'It is separate native memory and is not counted in `-Xmx`.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'jep-197' }, { source: 'src-codecache' }, { source: 'src-nmethod' }],
  },
  {
    id: 'deoptimization',
    name: 'Deoptimization',
    label: 'Deoptimization',
    caption: 'back to the interpreter',
    parent: 'execution-engine',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Abandons compiled code whose assumptions no longer hold and resumes in the interpreter.',
    beginner:
      'The JIT makes bets, such as "this variable is never null" or "only one class implements this interface". When a bet turns out wrong, the JVM safely switches that code back to the interpreter and may compile it again later with better information.',
    technical:
      'Optimized code contains **uncommon traps**: checks for situations the profile said never happen. When one is hit — an unexpected class (`Reason_class_check`), an unexpected null (`Reason_null_check`), a class not yet loaded or initialized (`Reason_unloaded`, `Reason_uninitialized`) — or when a dependency is invalidated (for example loading a new subclass breaks a class-hierarchy assumption), the runtime uses the nmethod\'s debug information to rebuild equivalent interpreter frames, including frames for inlined methods, and continues in the interpreter. The nmethod is marked "not entrant" so new calls stop using it, and the method can be recompiled with updated profiles.',
    purpose: 'Make aggressive speculation safe, so the compiler can optimize for the common case.',
    internals: [
      'Uncommon traps',
      'Dependency invalidation',
      'Frame reconstruction from debug info',
      '"Made not entrant" nmethods',
    ],
    inputs: ['A failed speculation or an invalidated dependency'],
    outputs: ['Interpreter frames resuming execution', 'Recompilation later'],
    practice:
      'Frequent deoptimization loops ("made not entrant" repeating for the same method in `PrintCompilation`, or JFR deoptimization events) indicate unstable profiles, such as a call site that turns megamorphic after warm-up.',
    misconceptions: [
      {
        myth: 'Deoptimization is an error or a crash.',
        truth:
          'It is a normal, designed mechanism; it produces exactly the result the interpreter would.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'src-deoptimization' }, { source: 'src-nmethod' }],
  },
];
