import type { ComponentDoc } from '@/types/content';
import type { ComponentId } from './ids';

type Teaching = Pick<ComponentDoc, 'developer' | 'analogy' | 'demo' | 'check'>;

/**
 * The teaching layer for the core concepts: a developer-level explanation, an
 * analogy mapped to the real concept with its limits, the interactive model
 * from the first lesson, and one question. Merged into the component docs in
 * ./index.ts; components without an entry fall back to their other levels.
 */
export const TEACHING: Partial<Record<ComponentId, Teaching>> = {
  jvm: {
    developer:
      'You start a JVM with the `java` command. `java -cp out app.Main` creates a JVM inside a new operating-system process, loads `Main` and calls its `main` method. The program ends when every non-daemon thread has finished, or when something calls `System.exit`.\n\nEverything your program uses while it runs lives inside that process: loaded classes, threads and their stacks, the heap, compiled code. `jcmd <pid> VM.version`, `jconsole` and JDK Flight Recorder attach to a running JVM to show what is inside.',
    analogy: {
      picture:
        'Think of a games console. A game made for that console plays on every one of them, whatever television it is plugged into.',
      mapping: [
        { picture: 'The game', real: 'Your class files (bytecode)' },
        { picture: 'The console', real: 'The JVM' },
        {
          picture: 'Different televisions and homes',
          real: 'Different operating systems and processors',
        },
      ],
      limits:
        'A console just plays a game as it is. The JVM also checks every class before running it, translates busy code into machine code for its own processor, and manages memory for the program. And it is not a separate box: the JVM is itself a program running on your computer.',
    },
    demo: 'jvm-parts',
    check: {
      id: 'check-jvm',
      kind: 'concept',
      prompt: 'What does a JVM run?',
      options: [
        {
          id: 'bytecode',
          text: 'Bytecode from class files',
          correct: true,
          explanation: 'Right. Class files hold bytecode, and the JVM executes it.',
        },
        {
          id: 'source',
          text: 'Java source files, as text',
          correct: false,
          explanation:
            'Source code is compiled first. Even `java Hello.java` compiles the program in memory before running it.',
        },
        {
          id: 'one-os',
          text: 'Only programs built for its operating system',
          correct: false,
          explanation: 'The same class files run on any operating system that has a JVM.',
        },
      ],
    },
  },

  'class-loader-subsystem': {
    developer:
      'Classes are loaded on demand. `java -cp out app.Main` makes the application class loader look for `app/Main.class` in `out`; the first `new Plugin()` or `Class.forName("app.Plugin")` loads `Plugin` later. Three built-in loaders work together, bootstrap (core `java.*` classes), platform and application, and each asks its parent first.\n\nTrouble shows up as `ClassNotFoundException` (a class looked up by name was not found) or `NoClassDefFoundError` (typically, a class that was there at compile time is missing at run time). `java -Xlog:class+load -cp out app.Main` lists every class as it is loaded.',
    analogy: {
      picture:
        'A library request desk. You ask for a book by its exact title; the librarian first checks with the main collection, finds the copy, checks it is complete, and only then hands it over.',
      mapping: [
        { picture: 'The exact title', real: 'The class’s full name, such as `app.Main`' },
        {
          picture: 'Checking with the main collection first',
          real: 'Parent delegation: application → platform → bootstrap',
        },
        { picture: 'Checking the copy is complete', real: 'Verification, part of linking' },
        { picture: 'Handing it over', real: 'The class is linked and initialized, ready to use' },
      ],
      limits:
        'The JVM keeps the class once it is loaded instead of handing out copies, and two different loaders can each load a separate class with the same name, which a library does not do. Loading also happens only when code first needs the class.',
    },
    demo: 'class-loading',
    check: {
      id: 'check-class-loader',
      kind: 'concept',
      prompt: 'When does the JVM load a class that your program uses?',
      options: [
        {
          id: 'needed',
          text: 'The first time the class is actually needed',
          correct: true,
          explanation: 'Right: loading is lazy. A class that is never used is never loaded.',
        },
        {
          id: 'startup',
          text: 'All classes on the class path, when the JVM starts',
          correct: false,
          explanation: 'Only what is needed is loaded, when it is first needed.',
        },
        {
          id: 'compile',
          text: 'When the program is compiled',
          correct: false,
          explanation: 'Compiling writes class files; loading happens later, inside a running JVM.',
        },
      ],
    },
  },

  'class-file': {
    developer:
      '`javac` writes one `.class` file per class, including nested and anonymous classes (`Outer$Inner.class`, `Outer$1.class`). `javap -c -v Hello` prints what is inside: the version, the constant pool and each method’s bytecode.\n\nClass files are what you ship, usually zipped into a JAR. A JVM refuses a class compiled for a newer Java version with `UnsupportedClassVersionError`.',
    analogy: {
      picture:
        'A flat-pack furniture kit: a numbered parts list and a sheet of step-by-step instructions that refer to the parts by number.',
      mapping: [
        { picture: 'The instruction sheet', real: 'The bytecode of each method' },
        {
          picture: 'The numbered parts list',
          real: 'The constant pool: `ldc #13` means “use entry 13”',
        },
        {
          picture: 'The label on the box',
          real: 'The magic number `CAFEBABE` and the class-file version',
        },
      ],
      limits:
        'Furniture is assembled once. The JVM runs a method’s instructions every time the method is called, and may translate busy ones into machine code. A class file also contains no objects: they are created only when the program runs.',
    },
    demo: 'compile',
    check: {
      id: 'check-class-file',
      kind: 'concept',
      prompt: '`Hello.class` starts with the bytes `CA FE BA BE`. What are they for?',
      options: [
        {
          id: 'magic',
          text: 'They mark the file as a class file (the magic number)',
          correct: true,
          explanation: 'Right. Every class file starts with them, followed by the version.',
        },
        {
          id: 'instruction',
          text: 'They are the first bytecode instruction',
          correct: false,
          explanation:
            'Bytecode sits inside each method’s `Code` attribute, after the header and the constant pool.',
        },
        {
          id: 'name',
          text: 'They encode the class name',
          correct: false,
          explanation: 'The class name is stored in the constant pool.',
        },
      ],
    },
  },

  'runtime-data-areas': {
    developer:
      'In a running program, objects and arrays created with `new` live in the heap. Each method call gets a frame on the calling thread’s stack, holding its parameters and local variables. A class’s code and constants belong to the method area (HotSpot: Metaspace); HotSpot keeps static field values in the class’s `java.lang.Class` object, in the heap.\n\nThreads share the heap and the method area but never each other’s stacks: a local variable is never seen by another thread, though the object it refers to might be. Errors point to the area: `StackOverflowError` (a stack), `OutOfMemoryError: Java heap space` (the heap), `OutOfMemoryError: Metaspace` (HotSpot’s method area).',
    analogy: {
      picture:
        'A workshop: a shared storeroom for finished items, a binder of instructions everyone reads from, and for each worker a pile of trays, one tray per job in progress.',
      mapping: [
        { picture: 'The shared storeroom', real: 'The heap, where objects live' },
        {
          picture: 'The instruction binder',
          real: 'The method area: each class’s code and constants',
        },
        { picture: 'A worker', real: 'A thread' },
        {
          picture: 'The worker’s pile of trays',
          real: 'The thread’s JVM stack, one frame per method call',
        },
      ],
      limits:
        'These are logical areas, not rooms side by side: HotSpot lays them out in one process’s memory as it sees fit. And a tray never holds an item from the storeroom, only a note saying where it is (a reference).',
    },
    demo: 'memory',
    check: {
      id: 'check-runtime-data-areas',
      kind: 'concept',
      prompt: 'Which runtime data areas are private to each thread?',
      options: [
        {
          id: 'stack',
          text: 'Its JVM stack, its pc register and its native method stack',
          correct: true,
          explanation: 'Right. Each thread has its own; the heap and the method area are shared.',
        },
        {
          id: 'heap',
          text: 'The heap',
          correct: false,
          explanation: 'The heap is shared by all threads, which is why shared objects need care.',
        },
        {
          id: 'method-area',
          text: 'The method area',
          correct: false,
          explanation: 'It is shared: one copy of each class’s data for every thread.',
        },
      ],
    },
  },

  heap: {
    developer:
      'Every `new`, and every array, allocates in the heap. Size it with `-Xms` (initial) and `-Xmx` (maximum); on a server-class machine HotSpot JDK 25 uses G1 and a default maximum of a quarter of physical memory.\n\nObjects stay alive while they are reachable: a `static List` that only ever grows keeps everything in it alive, a classic memory leak. When the heap is full of live objects you get `OutOfMemoryError: Java heap space`; `-XX:+HeapDumpOnOutOfMemoryError` writes a heap dump you can analyse.',
    analogy: {
      picture:
        'A big shared warehouse. Each object is a box on a shelf, and your variables are claim tickets that say where to find a box.',
      mapping: [
        { picture: 'The warehouse', real: 'The heap' },
        { picture: 'A box', real: 'An object or an array' },
        { picture: 'A claim ticket', real: 'A reference, held by a variable or a field' },
        { picture: 'Staff who clear boxes no ticket points to', real: 'The garbage collector' },
      ],
      limits:
        'A ticket is not a shelf number you can do arithmetic with: references are opaque, and many collectors move boxes and quietly update every ticket. Boxes that no ticket reaches are not removed at once, only when the collector runs.',
    },
    demo: 'memory',
    check: {
      id: 'check-heap',
      kind: 'memory-state',
      prompt: '`Person a = new Person(); Person b = a;` How many Person objects are in the heap?',
      options: [
        {
          id: 'one',
          text: 'One, with two references to it',
          correct: true,
          explanation: 'Right: `b = a` copies the reference, not the object.',
        },
        {
          id: 'two',
          text: 'Two',
          correct: false,
          explanation: 'Only `new` creates an object. Assigning a variable copies a reference.',
        },
        {
          id: 'none',
          text: 'None: they are on the stack',
          correct: false,
          explanation: 'The variables are in the frame on the stack; the object is in the heap.',
        },
      ],
    },
  },

  'jvm-stack': {
    developer:
      'Every thread has its own stack. Calling a method pushes a frame; returning, normally or by throwing, pops it. A stack trace is a picture of those frames when the exception was created, newest first.\n\nUnbounded recursion keeps pushing frames until the stack is full and the JVM throws `StackOverflowError`. `-Xss` sets the stack size for new threads (1 MB by default on Linux x64 in our measurements).',
    analogy: {
      picture: 'A pile of plates: you can only put a plate on top, or take the top one off.',
      mapping: [
        { picture: 'A plate', real: 'A frame: one method call in progress' },
        { picture: 'Putting a plate on top', real: 'Calling a method' },
        { picture: 'Taking the top plate off', real: 'The method returning' },
        { picture: 'The top plate', real: 'The method running right now' },
      ],
      limits:
        'Each thread has its own pile, and the plates are not all the same size: each frame is as big as its method needs. A real stack also has a maximum size; one plate too many is a `StackOverflowError`.',
    },
    demo: 'memory',
    check: {
      id: 'check-jvm-stack',
      kind: 'memory-state',
      prompt:
        '`a()` calls `b()`, which calls `c()`. While `c()` runs, whose frame is on top of the thread’s stack?',
      options: [
        {
          id: 'c',
          text: '`c()`’s frame',
          correct: true,
          explanation: 'Right. Below it are `b()`’s frame and, at the bottom, `a()`’s.',
        },
        {
          id: 'a',
          text: '`a()`’s frame',
          correct: false,
          explanation: '`a()` was called first, so its frame is at the bottom.',
        },
        {
          id: 'one',
          text: 'There is only one frame per thread',
          correct: false,
          explanation: 'Each call in progress has its own frame: three here.',
        },
      ],
    },
  },

  'stack-frame': {
    developer:
      'A frame lives exactly as long as one method call. Its local variables are the method’s parameters and locals; `javac` works out how many slots and how deep an operand stack each method needs (`locals=` and `stack=` in `javap -v`).\n\nThat is why local variables vanish when a method returns, and why a lambda can only use local variables that never change after they are set (effectively final): it gets a copy of the value, not the frame’s slot.',
    analogy: {
      picture:
        'A workspace set up for one task: a notepad for the task’s values and a small scratch pile for working things out, cleared away when the task is done.',
      mapping: [
        { picture: 'The notepad', real: 'The local variable array' },
        { picture: 'The scratch pile', real: 'The operand stack' },
        { picture: 'Clearing away', real: 'The frame is removed when the method returns' },
      ],
      limits:
        'A real frame also holds what the JVM needs to return to the caller and to handle exceptions. Its slots hold primitive values and references only, never whole objects. And it is not a literal desk or box: the JIT compiler may keep a frame’s values in processor registers.',
    },
    demo: 'memory',
    check: {
      id: 'check-stack-frame',
      kind: 'memory-state',
      prompt:
        'Inside a method: `int count = 0; Person p = new Person();` What does the method’s frame hold?',
      options: [
        {
          id: 'value-ref',
          text: 'The value 0, and a reference to the Person object',
          correct: true,
          explanation: 'Right. Primitives are stored directly; objects are referred to.',
        },
        {
          id: 'object',
          text: 'The value 0 and the Person object itself',
          correct: false,
          explanation: 'Objects live in the heap; the frame holds a reference.',
        },
        {
          id: 'heap',
          text: 'Nothing: local variables live in the heap',
          correct: false,
          explanation: 'Local variables are slots in the method’s frame, not in the heap.',
        },
      ],
    },
  },

  'method-area': {
    developer:
      'Everything the JVM knows about a loaded class (its methods’ bytecode, descriptions of its fields and methods, its run-time constant pool) is per-class data in the method area, shared by all threads.\n\nIn HotSpot this is Metaspace, in native memory outside the Java heap. Loading many classes (frameworks, generated proxies) grows it, `-XX:MaxMetaspaceSize` caps it, and running out gives `OutOfMemoryError: Metaspace`. The memory is freed only when a class loader becomes unreachable and its classes are unloaded.',
    analogy: {
      picture:
        'A reference shelf of instruction manuals, one per class, that every worker reads from.',
      mapping: [
        {
          picture: 'One manual',
          real: 'One class’s data: code, constants, field and method descriptions',
        },
        { picture: 'Every worker reads the same copy', real: 'Shared by all threads' },
      ],
      limits:
        'The method area is a concept from the specification. HotSpot implements it as Metaspace, in native memory, so its size does not count towards the heap. And manuals are removed only all together, when the class loader that brought them is no longer used.',
    },
    demo: 'class-loading',
    check: {
      id: 'check-method-area',
      kind: 'concept',
      prompt: 'In HotSpot JDK 25, where is the method area?',
      options: [
        {
          id: 'metaspace',
          text: 'In Metaspace, in native memory',
          correct: true,
          explanation:
            'Right. The method area is the concept; Metaspace is HotSpot’s implementation.',
        },
        {
          id: 'permgen',
          text: 'In the Java heap, as the permanent generation',
          correct: false,
          explanation: 'PermGen was removed in JDK 8 and replaced by Metaspace.',
        },
        {
          id: 'stack',
          text: 'On each thread’s stack',
          correct: false,
          explanation: 'Class data is shared by all threads, not stored per thread.',
        },
      ],
    },
  },

  interpreter: {
    developer:
      'Every Java program starts out interpreted. HotSpot’s is a template interpreter: at start-up it generates a small piece of machine code for each bytecode, then runs a method by jumping from template to template.\n\nCode that runs once or rarely, such as start-up, configuration and error handling, may never leave the interpreter. `-Xint` makes HotSpot interpret everything, which makes long-running programs dramatically slower and shows how much the JIT compiler does.',
    analogy: {
      picture: 'An interpreter at a meeting, translating each sentence as soon as it is spoken.',
      mapping: [
        { picture: 'Each sentence', real: 'Each bytecode instruction' },
        {
          picture: 'Translating as it goes',
          real: 'Executing one instruction at a time, with no preparation',
        },
        { picture: 'The listener', real: 'The processor (CPU)' },
      ],
      limits:
        'HotSpot’s interpreter does not work anything out afresh: it runs a ready-made machine-code template for each kind of instruction. It also keeps counts and profiles while it runs, which the JIT compiler uses later.',
    },
    demo: 'execution',
    check: {
      id: 'check-interpreter',
      kind: 'concept',
      prompt: 'Why does HotSpot interpret code before compiling it?',
      options: [
        {
          id: 'start',
          text: 'It can start running at once, without waiting for compilation',
          correct: true,
          explanation: 'Right, and most code runs too rarely to be worth compiling.',
        },
        {
          id: 'faster',
          text: 'Interpreted code is faster than compiled code',
          correct: false,
          explanation: 'Compiled code is much faster once it exists.',
        },
        {
          id: 'cpu',
          text: 'The processor understands bytecode directly',
          correct: false,
          explanation: 'Processors run machine code; bytecode needs the JVM.',
        },
      ],
    },
  },

  'jit-compiler': {
    developer:
      'HotSpot counts how often each method runs. Hot methods are compiled to machine code while your program keeps running: first by C1 (tier 3, quick, with profiling), then by C2 (tier 4, heavily optimized). `-XX:+PrintCompilation` prints each compilation.\n\nBecause of this warm-up, the first seconds of a program run slower. Benchmark with a harness such as JMH rather than with a single timed loop.',
    analogy: {
      picture:
        'A musician who notices which pieces are requested every night and learns those by heart, instead of reading them from the sheet music each time.',
      mapping: [
        { picture: 'The sheet music', real: 'Bytecode' },
        { picture: 'Reading from the sheet', real: 'Interpreting' },
        { picture: 'Learning a piece by heart', real: 'Compiling a method to machine code' },
        { picture: 'Requested every night', real: 'Hot code, found by counting calls and loops' },
      ],
      limits:
        'The JIT can also unlearn: if an assumption behind compiled code stops being true (for example, a new subclass is loaded), the code is thrown away and the method runs in the interpreter until it is compiled again. And it practises in the background while the program keeps running.',
    },
    demo: 'execution',
    check: {
      id: 'check-jit',
      kind: 'concept',
      prompt: 'What does the JIT compiler produce?',
      options: [
        {
          id: 'machine',
          text: 'Machine code for the processor the JVM runs on',
          correct: true,
          explanation: 'Right. It is kept in memory, in the code cache, while the program runs.',
        },
        {
          id: 'bytecode',
          text: 'Bytecode',
          correct: false,
          explanation: '`javac` produces bytecode; the JIT starts from it.',
        },
        {
          id: 'class',
          text: 'A new class file on disk',
          correct: false,
          explanation: 'Compiled code lives only in memory, in the code cache.',
        },
      ],
    },
  },

  'garbage-collector': {
    developer:
      'You never free memory yourself. When no chain of references from a live thread or a static field leads to an object any more, a later collection reclaims its memory. HotSpot JDK 25 uses G1 by default; `-XX:+UseZGC` selects ZGC for very short pauses, and `java -Xlog:gc` prints every collection.\n\nA memory leak in Java is an object that stays reachable by mistake, for example in a cache that only ever grows.',
    analogy: {
      picture:
        'Clearing up helium balloons after a party. Balloons whose strings someone is holding stay. Balloons nobody holds, even ones tied to each other, are cleared away when the cleaners come round.',
      mapping: [
        {
          picture: 'People holding strings',
          real: 'GC roots: local variables in running methods, static fields',
        },
        { picture: 'A string', real: 'A reference' },
        { picture: 'A balloon', real: 'An object' },
        { picture: 'The cleaners’ round', real: 'A garbage collection' },
      ],
      limits:
        'Collectors do not inspect balloons one by one: they follow the strings from the roots and treat everything they did not reach as garbage, and many also move the surviving objects closer together. When the cleaners come round is the collector’s decision, not the program’s.',
    },
    demo: 'reachability',
    check: {
      id: 'check-gc',
      kind: 'memory-state',
      prompt: 'An object has just become unreachable. When is its memory reclaimed?',
      options: [
        {
          id: 'later',
          text: 'When a garbage collection runs and processes the part of the heap it is in',
          correct: true,
          explanation: 'Right. Unreachable means eligible; reclaimed comes later.',
        },
        {
          id: 'now',
          text: 'Immediately',
          correct: false,
          explanation: 'Nothing is freed until a collection runs.',
        },
        {
          id: 'gc-call',
          text: 'Only when the program calls `System.gc()`',
          correct: false,
          explanation:
            '`System.gc()` is only a request; collections run when the collector decides.',
        },
      ],
    },
  },

  jni: {
    developer:
      'A method declared `native` has no Java body: `public static native int add(int a, int b);`. Its implementation is a C or C++ function in a native library loaded with `System.loadLibrary("mathlib")`, found by its name (`Java_MathLib_add`) or registered with `RegisterNatives`; `javac -h` generates the C header.\n\nSince JDK 22, the Foreign Function & Memory API (`java.lang.foreign`) can call native libraries without writing any C.',
    analogy: {
      picture:
        'A border crossing between two countries with different rules. Travellers can cross, but every crossing needs paperwork, and each side’s rules apply only on that side.',
      mapping: [
        {
          picture: 'The two countries',
          real: 'Java (garbage collected, checked) and native code (C or C++, manual memory)',
        },
        { picture: 'Crossing the border', real: 'A call between Java and native code' },
        { picture: 'The paperwork', real: 'JNIEnv functions, and local and global references' },
      ],
      limits:
        'There is no border guard: native code runs in the same process, so a bug in C code can crash the whole JVM. And native code must tell the JVM which Java objects it keeps between calls (global references), or the garbage collector may reclaim them.',
    },
    check: {
      id: 'check-jni',
      kind: 'concept',
      prompt: 'What can go wrong in native code that cannot happen in Java code?',
      options: [
        {
          id: 'crash',
          text: 'A memory bug can crash the whole JVM process',
          correct: true,
          explanation: 'Right. The JVM verifies bytecode, but not native machine code.',
        },
        {
          id: 'checked',
          text: 'Nothing: the JVM checks native code just like bytecode',
          correct: false,
          explanation: 'Verification applies to bytecode only.',
        },
        {
          id: 'one-way',
          text: 'Native code cannot call Java methods',
          correct: false,
          explanation: 'It can, through JNIEnv functions such as `CallVoidMethod`.',
        },
      ],
    },
  },
};
