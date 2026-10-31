import type { ComponentDoc } from '@/types/content';

export const gcComponents: ComponentDoc[] = [
  {
    id: 'garbage-collector',
    name: 'Garbage collector',
    label: 'Garbage collector',
    parent: 'jvm',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Automatic storage management: finds objects the program can no longer reach and reclaims their memory.',
    simple:
      'You create objects but never delete them. The garbage collector periodically finds objects that nothing in your program can reach any more and reuses their memory.',
    deep: 'JVMS §2.5.3 requires heap storage to be reclaimed by an automatic storage management system and mandates no technique. Collectors start from [[gc-roots|GC roots]], determine [[reachability]], and reclaim the rest by sweeping, compacting or evacuating. HotSpot JDK 25 selects **G1** on server-class machines (at least 2 CPUs and about 1.8 GB of memory) and **Serial** otherwise (`gcConfig.cpp`, `os::is_server_class_machine`). Collectors coordinate with application threads through [[safepoint|safepoints]] and through barriers compiled into field accesses.',
    purpose:
      'Memory safety and productivity: no dangling pointers, no manual `free`, no double-free bugs.',
    internals: [
      'GC roots',
      'Marking',
      'Sweeping',
      'Compaction / evacuation',
      'Collector implementations',
    ],
    inputs: ['Heap occupancy and allocation failures', 'Roots from thread stacks, classes and JNI'],
    outputs: ['Free heap space', 'Class unloading', 'Pauses and concurrent work on GC threads'],
    practice:
      'Turn on GC logging in production (`-Xlog:gc*:file=gc.log`): it is cheap and answers most memory questions. Choose a collector by goal: throughput (Parallel), balanced latency (G1, default), very low pause times on large heaps (ZGC, Shenandoah).',
    misconceptions: [
      {
        myth: 'An object is collected as soon as it becomes unreachable.',
        truth:
          'It becomes **eligible**. It is reclaimed during some later collection, or never if the program ends first. Reachability decides eligibility, not timing.',
      },
      {
        myth: '`System.gc()` runs the garbage collector immediately.',
        truth:
          'It is a request the JVM may honour or ignore (`-XX:+DisableExplicitGC`); never rely on it for correctness.',
      },
    ],
    specVsImpl: {
      spec: 'Automatic reclamation is required; the technique, timing and pauses are not specified.',
      implementation: 'HotSpot JDK 25: Serial, Parallel, G1 (default), ZGC, Shenandoah, Epsilon.',
    },
    references: [
      { source: 'jvms-2.5.3' },
      { source: 'jls-12.6' },
      { source: 'guide-gc' },
      { source: 'src-gcconfig' },
      { source: 'src-os' },
    ],
  },
  {
    id: 'gc-roots',
    name: 'GC roots',
    label: 'GC roots',
    caption: 'stacks · statics · JNI',
    parent: 'garbage-collector',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'References the collector treats as live by definition: thread stacks, static fields, JNI handles and VM internals.',
    simple:
      'The starting points of the search for live objects: variables in running methods, static fields of loaded classes, and a few references held by the JVM itself. Anything reachable from a root is kept.',
    deep: "Roots include: references in the local variables and operand stacks of every thread's frames (located precisely using stack maps / oop maps), static fields (held in `Class` mirrors reachable from loaded classes and their loaders), JNI local and global references, objects used as monitors, references embedded in compiled code, and VM-internal tables. Generational and regional collectors also treat references from outside the collected area as roots for that collection (G1 remembered sets, card tables).",
    purpose: 'Define precisely which objects the program can still use.',
    internals: [
      'Thread stacks',
      'Class statics and class loaders',
      'JNI handles',
      'Code roots',
      'Remembered sets (for partial collections)',
    ],
    inputs: ['A stopped (or handshaken) thread state, class and handle tables'],
    outputs: ['The initial set of objects to mark'],
    practice:
      'In a heap dump analyser, "path to GC roots" explains why a leaked object is still alive — usually a static collection, a thread-local, or a listener never removed.',
    misconceptions: [
      {
        myth: 'Objects referencing each other in a cycle can never be collected.',
        truth:
          'Tracing collectors start from roots; an unreachable cycle is garbage like any other object.',
      },
    ],
    references: [{ source: 'guide-gc' }, { source: 'jls-12.6' }, { source: 'src-oopstorage' }],
  },
  {
    id: 'marking',
    name: 'Marking',
    label: 'Mark',
    caption: 'trace from roots',
    parent: 'garbage-collector',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Traces the object graph from the roots and marks every reachable object.',
    simple:
      'Starting from the roots, the collector follows every reference and marks each object it reaches. Unmarked objects are garbage.',
    deep: 'Marking traverses the object graph and records live objects (for example in mark bitmaps). Its cost grows with the number of **live** objects and references, not with garbage. Concurrent markers (G1, ZGC, Shenandoah) trace while the application runs and use barriers to stay correct while references change: G1 and Shenandoah use snapshot-at-the-beginning (SATB) write barriers; ZGC uses load barriers on reference loads. A short pause finishes marking.',
    purpose: 'Determine the live set.',
    internals: [
      'Mark bitmaps',
      'Mark stacks / queues',
      'Tricolour invariant',
      'Barriers for concurrent marking',
    ],
    inputs: ['Roots'],
    outputs: ['The set of live objects'],
    practice:
      'G1 logs concurrent marking as "Concurrent Mark Cycle"; a cycle that cannot finish before the heap fills ends in a full GC.',
    misconceptions: [
      {
        myth: 'The GC looks at every dead object to delete it.',
        truth: 'Tracing collectors find live objects; garbage is whatever was not marked.',
      },
    ],
    references: [{ source: 'guide-gc' }, { source: 'src-g1' }, { source: 'src-zgc' }],
  },
  {
    id: 'sweeping',
    name: 'Sweeping',
    label: 'Sweep',
    caption: 'free in place',
    parent: 'garbage-collector',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Reclaims unmarked space where it lies, e.g. onto free lists; leaves fragmentation.',
    simple:
      'After marking, the collector can walk through memory and free every unmarked object in place. Simple, but it leaves free memory scattered in gaps.',
    deep: 'Mark-sweep collectors scan the heap and link unmarked space into free lists without moving objects. It avoids copying but fragments the heap and makes allocation slower than bump-pointer allocation. In HotSpot JDK 25 no collector reclaims ordinary young objects by sweeping: they evacuate live objects instead. G1 frees whole regions found completely empty after marking. The classic concurrent mark-sweep collector (CMS) was removed in JDK 14.',
    purpose: 'Reclaim space without the cost of moving objects.',
    internals: ['Heap walk', 'Free lists'],
    inputs: ['Mark information'],
    outputs: ['Free space in place, possibly fragmented'],
    practice:
      'Fragmentation is why non-moving collectors eventually need a compacting phase, and why modern HotSpot collectors evacuate instead.',
    misconceptions: [
      {
        myth: 'Every collector marks, then sweeps, then compacts.',
        truth:
          'These are building blocks. Each collector combines them differently; G1 young collections copy and never sweep.',
      },
    ],
    accuracyNote:
      "Shown as a separate step to teach the concept. HotSpot JDK 25's collectors mostly reclaim by evacuation and whole-region freeing rather than per-object sweeping.",
    references: [{ source: 'guide-gc' }, { source: 'jep-363' }],
  },
  {
    id: 'compaction',
    name: 'Compaction and evacuation',
    label: 'Compact',
    caption: 'move live objects',
    parent: 'garbage-collector',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Moves live objects together (or copies them to new space) and updates every reference to them.',
    simple:
      'The collector slides or copies the surviving objects next to each other, so the free memory forms one big block again.',
    deep: 'Compacting and copying collectors relocate live objects, install forwarding information, and update all references to the new locations. Copying ("evacuation") is used by G1 for young and mixed collections and by ZGC and Shenandoah for concurrent relocation, where load barriers or forwarding tables let application threads find moved objects safely. Afterwards allocation can use fast bump pointers. This is why Java references cannot be treated as stable addresses.',
    purpose: 'Eliminate fragmentation and enable cheap allocation.',
    internals: [
      'Forwarding pointers / tables',
      'Reference updating',
      'Concurrent relocation with barriers (ZGC, Shenandoah)',
    ],
    inputs: ['Live set from marking'],
    outputs: ['Contiguous free space', 'Moved objects with updated references'],
    practice:
      'Objects pinned for native access (JNI critical regions) complicate moving collectors; G1 can pin individual regions (JEP 423, JDK 22).',
    misconceptions: [
      {
        myth: 'An object stays at the same address for its whole life.',
        truth:
          'Moving collectors relocate objects routinely; only the identity (and identity hash code) is stable.',
      },
    ],
    references: [{ source: 'guide-gc' }, { source: 'src-markword' }],
  },
  {
    id: 'collectors',
    name: 'HotSpot collectors',
    label: 'Collectors in JDK 25',
    caption: 'chosen at start-up',
    parent: 'garbage-collector',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Six interchangeable implementations, selected with -XX:+Use…GC; G1 is the default on server-class machines.',
    simple:
      'HotSpot ships several garbage collectors with different trade-offs. You pick one when starting the JVM; most applications keep the default, G1.',
    deep: 'Exactly one collector is active per JVM: Serial, Parallel, G1, ZGC, Shenandoah (included in OpenJDK builds from most vendors, but not in Oracle JDK builds) or Epsilon (experimental, no reclamation). Without an explicit choice HotSpot uses G1 on server-class machines and Serial otherwise.',
    purpose: 'Let applications trade throughput, latency and memory footprint.',
    internals: ['Serial', 'Parallel', 'G1', 'ZGC', 'Shenandoah', 'Epsilon'],
    inputs: ['Command-line selection or ergonomics'],
    outputs: ['A heap layout and collection strategy'],
    example: {
      title: 'Which collector is running?',
      language: 'shell',
      code: '$ java -Xlog:gc -version',
      output: '[0.006s][info][gc] Using G1',
      verifiedWith: 'OpenJDK 25.0.4 · Linux x64 · 4 CPUs',
    },
    practice:
      'Measure before switching collectors: GC logs and latency percentiles under real load, not microbenchmarks.',
    misconceptions: [
      {
        myth: 'A newer collector is always better.',
        truth:
          'Each optimizes something different; ZGC trades some throughput and memory for low latency, Parallel the reverse.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'guide-gc' }, { source: 'src-gcconfig' }],
  },
  {
    id: 'g1',
    name: 'G1 (Garbage-First)',
    label: 'G1',
    caption: 'default · regions',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Region-based, generational, mostly-concurrent collector with a pause-time goal; the default.',
    simple:
      'The default collector. It splits the heap into many small regions and cleans the regions with the most garbage first, aiming to keep pauses short.',
    deep: 'Heap of equal-size regions; young collections evacuate eden and survivor regions; concurrent marking finds old regions with the most garbage, which mixed collections evacuate incrementally ("garbage first"). Pause-time goal `MaxGCPauseMillis` = 200 ms. Uses SATB pre-write barriers and card-marking post-write barriers, remembered sets per region, and humongous regions for large objects. Default since JDK 9 (JEP 248).',
    purpose: 'Good throughput with predictable pauses on a wide range of heap sizes.',
    internals: [
      'Regions (eden, survivor, old, humongous)',
      'Remembered sets',
      'Concurrent marking',
      'Mixed collections',
    ],
    inputs: ['`-XX:+UseG1GC` (default on server-class machines)'],
    outputs: ['Young, mixed and (rarely) full collections'],
    practice:
      'Start with `-Xmx` and the default pause goal; tune `MaxGCPauseMillis` only with evidence from GC logs.',
    misconceptions: [
      {
        myth: 'G1 guarantees pauses under MaxGCPauseMillis.',
        truth: 'It is a goal the collector tries to meet, not a guarantee.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'jep-248' }, { source: 'guide-gc' }, { source: 'src-g1' }],
  },
  {
    id: 'zgc',
    name: 'ZGC',
    label: 'ZGC',
    caption: 'concurrent · generational',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Low-latency collector that marks and relocates concurrently; generational only since JDK 24.',
    simple:
      'A collector built for very short pauses, even with huge heaps. Almost all of its work happens while your program keeps running.',
    deep: 'ZGC performs marking, relocation and reference updating concurrently, using coloured pointers and load barriers so application threads always see the current location of an object. Pauses do not grow with heap or live-set size. Production since JDK 15 (JEP 377), generational since JDK 21 (JEP 439), generational by default in JDK 23 (JEP 474), and the non-generational mode was removed in JDK 24 (JEP 490). Enabled with `-XX:+UseZGC`.',
    purpose: 'Sub-millisecond pauses for latency-sensitive services with large heaps.',
    internals: [
      'Coloured pointers',
      'Load barriers',
      'Concurrent relocation',
      'Young and old generations',
    ],
    inputs: ['`-XX:+UseZGC`'],
    outputs: ['Very short pauses; more concurrent GC CPU work'],
    practice:
      'Give ZGC heap headroom: it needs room to keep allocating while it collects concurrently.',
    misconceptions: [
      {
        myth: 'ZGC has no pauses at all.',
        truth: 'It has very short pauses; most work is concurrent.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'jep-377' },
      { source: 'jep-439' },
      { source: 'jep-474' },
      { source: 'jep-490' },
      { source: 'src-zgc' },
    ],
  },
  {
    id: 'shenandoah',
    name: 'Shenandoah',
    label: 'Shenandoah',
    caption: 'concurrent compaction',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Low-pause collector with concurrent compaction; generational mode became a product feature in JDK 25.',
    simple:
      'Another low-pause collector. It can move objects while your program runs, so pauses stay short regardless of heap size.',
    deep: 'Shenandoah performs concurrent marking and concurrent evacuation using load-reference barriers, keeping pause times independent of heap size. Production since JDK 15 (JEP 379). JDK 25 made its generational mode a product feature (JEP 521); the default mode remains single-generation. Enabled with `-XX:+UseShenandoahGC` in builds that include it.',
    purpose: 'Low and predictable pause times.',
    internals: ['Load-reference barriers', 'Concurrent evacuation', 'Optional generational mode'],
    inputs: ['`-XX:+UseShenandoahGC`'],
    outputs: ['Short pauses; concurrent GC work'],
    practice:
      'Check that your JDK build includes it: Oracle JDK builds do not; most other OpenJDK distributions do.',
    misconceptions: [
      {
        myth: 'Shenandoah is available in every JDK.',
        truth:
          'It is part of OpenJDK, but some vendors (notably Oracle JDK) exclude it from their builds.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'jep-379' }, { source: 'jep-521' }, { source: 'src-shenandoah' }],
  },
  {
    id: 'parallel-gc',
    name: 'Parallel GC',
    label: 'Parallel',
    caption: 'throughput',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Generational, stop-the-world collector that uses many threads to maximize throughput.',
    simple:
      'Stops the program while it cleans, but uses all CPU cores to finish quickly. Good for batch jobs where total speed matters more than pause length.',
    deep: 'Contiguous young generation (eden + two survivor spaces) collected by parallel copying; old generation collected by parallel mark-compact. All collection work happens in stop-the-world pauses using `ParallelGCThreads` threads. Enabled with `-XX:+UseParallelGC`.',
    purpose: 'Maximum application throughput when pause length is not critical.',
    internals: ['Parallel scavenge (young)', 'Parallel mark-compact (old)'],
    inputs: ['`-XX:+UseParallelGC`'],
    outputs: ['Fewer, longer pauses'],
    practice: 'A good fit for batch processing and data pipelines.',
    misconceptions: [
      {
        myth: 'Parallel means concurrent.',
        truth:
          'Parallel = many GC threads during a pause. Concurrent = GC work while the application runs.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'guide-gc' }, { source: 'src-parallel' }],
  },
  {
    id: 'serial-gc',
    name: 'Serial GC',
    label: 'Serial',
    caption: 'single-threaded',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Single-threaded, stop-the-world generational collector; the default on small machines.',
    simple:
      'The simplest collector: one thread does all the cleaning while the program waits. Efficient for small heaps and single-CPU machines.',
    deep: 'Copying young generation and mark-compact old generation, all single-threaded and stop-the-world. HotSpot selects it automatically when the machine is not "server class" (fewer than 2 CPUs or less than about 1.8 GB of memory), which includes many small containers. Enabled with `-XX:+UseSerialGC`.',
    purpose: 'Minimal overhead and footprint for small heaps.',
    internals: ['Copying young collection', 'Mark-compact old collection'],
    inputs: ['`-XX:+UseSerialGC` or ergonomics on small machines'],
    outputs: ['Single-threaded pauses'],
    practice:
      'If a containerized service unexpectedly logs "Using Serial", it was given less than 2 CPUs or about 1.8 GB of memory.',
    misconceptions: [
      {
        myth: 'Serial GC is obsolete.',
        truth:
          'It remains the best choice for small heaps and is chosen by default on small machines.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'guide-gc' }, { source: 'src-serial' }, { source: 'src-os' }],
  },
  {
    id: 'epsilon-gc',
    name: 'Epsilon GC',
    label: 'Epsilon',
    caption: 'no-op',
    parent: 'collectors',
    provenance: 'hotspot',
    scope: 'shared',
    summary:
      'Allocates but never reclaims; the JVM exits with OutOfMemoryError when the heap is exhausted.',
    simple:
      'A "collector" that never collects. When memory runs out, the program stops. Useful for testing and measuring.',
    deep: 'Experimental no-op collector (JEP 318, JDK 11): it implements allocation but no reclamation. Used for performance testing (to measure GC overhead), memory-pressure testing and very short-lived jobs. Requires `-XX:+UnlockExperimentalVMOptions -XX:+UseEpsilonGC`.',
    purpose: 'Remove GC from the picture for experiments.',
    internals: ['Bump-pointer allocation only'],
    inputs: ['`-XX:+UnlockExperimentalVMOptions -XX:+UseEpsilonGC`'],
    outputs: ['No collections; `OutOfMemoryError` when full'],
    practice:
      'Compare a benchmark under Epsilon and under G1 to see how much time garbage collection costs.',
    misconceptions: [
      {
        myth: 'Epsilon makes programs faster in production.',
        truth: 'Only until the heap fills up; then the JVM fails.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'jep-318' }, { source: 'src-epsilon' }],
  },
];
