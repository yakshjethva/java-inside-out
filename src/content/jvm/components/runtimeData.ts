import type { ComponentDoc } from '@/types/content';

const V = 'OpenJDK 25.0.4 · Linux x64';

export const runtimeDataComponents: ComponentDoc[] = [
  {
    id: 'runtime-data-areas',
    name: 'Runtime data areas',
    label: 'Runtime data areas',
    parent: 'jvm',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'The memory areas the JVM uses while running a program: some shared by all threads, some private to each thread.',
    simple:
      'While your program runs, the JVM keeps data in several places. Objects live in the shared **heap**. Information about classes lives in the shared **method area**. Each thread gets its own **stack** for method calls and its own **PC register** that remembers which instruction it is on.',
    deep: "JVMS §2.5 defines six logical areas. Created at JVM start-up and shared by all threads: the [[heap]] and the [[method-area|method area]] (with one [[runtime-constant-pool|run-time constant pool]] per class). Created with each thread and private to it: the [[pc-register|pc register]], the [[jvm-stack|JVM stack]] and the [[native-method-stack|native method stack]].\n\nThese are **logical** areas. HotSpot maps them onto its own structures: the Java heap managed by the selected GC; Metaspace (native memory) for class metadata; `java.lang.Class` mirrors and interned strings in the Java heap; one native thread stack holding both Java and native frames; and the interpreter's bytecode pointer as the pc.",
    purpose:
      'Separate what all threads share (objects, classes) from what each thread owns (its position and call stack).',
    internals: [
      'Shared: heap, method area, run-time constant pools',
      'Per thread: pc register, JVM stack (frames), native method stack',
    ],
    inputs: [
      'Class metadata from the class loader subsystem',
      'Allocation and access requests from the execution engine',
    ],
    outputs: ['Objects, frames and metadata that the execution engine and GC operate on'],
    specVsImpl: {
      spec: 'Six areas with defined lifetimes and error conditions (`StackOverflowError`, `OutOfMemoryError`). No addresses, sizes or layouts.',
      implementation:
        'HotSpot JDK 25: Java heap (G1 by default), Metaspace, code cache, one native stack per thread with guard zones, and a bytecode pointer register in the interpreter.',
    },
    practice:
      'Every `OutOfMemoryError` message names the area that ran out: `Java heap space`, `Metaspace`, `Compressed class space`, `unable to create native thread`, `Direct buffer memory`. Reading that message correctly is the first step of any memory investigation.',
    misconceptions: [
      {
        myth: 'Objects live on the stack and primitives live on the heap (or the reverse).',
        truth:
          "Local variables, primitive or reference, live in the frame on the thread's stack; objects and arrays live in the heap. A reference variable on the stack *refers to* an object in the heap.",
      },
    ],
    accuracyNote:
      "Areas are drawn side by side for clarity. Their real sizes differ by orders of magnitude (a heap of gigabytes, thread stacks of about 1 MB) and they occupy scattered regions of the process's address space.",
    references: [{ source: 'jvms-2.5' }, { source: 'jvms-2.13' }],
  },
  {
    id: 'java-thread',
    name: 'Java thread',
    label: 'Java thread',
    caption: 'one set per thread',
    parent: 'runtime-data-areas',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'Each thread owns a pc register, a JVM stack and a native method stack; all threads share the heap and method area.',
    simple:
      'A thread is one line of execution in your program. Every thread has its own private notebook (its stack and PC register), but all threads share the same heap. That sharing is what makes multithreading powerful, and what makes race conditions possible.',
    deep: "JVMS §2.5 ties the pc register, JVM stack and native method stack to each JVM thread, created and destroyed with it. In HotSpot each platform thread is a `JavaThread` backed 1:1 by an operating-system thread. [[virtual-thread|Virtual threads]] (JDK 21, JEP 444) are scheduled by the JDK onto a small pool of carrier platform threads; while unmounted, a virtual thread's frames are stored in heap objects (stack chunks) and copied back to a carrier's stack when it resumes.",
    purpose: 'Give each concurrent activity its own execution position and call stack.',
    internals: [
      'PC register',
      'JVM stack of frames',
      'Native method stack',
      'Thread-local allocation buffer (HotSpot)',
    ],
    inputs: ["`Thread.start()`, the launcher's main thread, or a virtual-thread scheduler"],
    outputs: ['Frames executing on the CPU', 'Roots for garbage collection (its stack references)'],
    practice:
      'A thread dump (`jcmd <pid> Thread.print`) prints every thread\'s stack: the first tool for hangs, deadlocks and high CPU. Platform threads are expensive (an OS thread plus about 1 MB of reserved stack each); virtual threads make "one thread per task" affordable for I/O-bound work.',
    misconceptions: [
      {
        myth: 'Each thread has its own copy of objects.',
        truth:
          "Objects are shared through the heap. Only the thread's stack (local variables) is private, and a local can still refer to a shared object.",
      },
    ],
    accuracyNote:
      'The stacked outlines suggest several threads; a real JVM has many, including internal GC and JIT compiler threads that also have stacks.',
    references: [{ source: 'jvms-2.5' }, { source: 'src-javathread' }, { source: 'jep-444' }],
  },
  {
    id: 'pc-register',
    name: 'PC register',
    label: 'PC register',
    caption: 'current bytecode offset',
    parent: 'java-thread',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'Per-thread position of the instruction currently being executed; undefined for native methods.',
    simple:
      'A bookmark for each thread: it holds the position of the bytecode instruction the thread is executing, so the JVM always knows where to continue.',
    deep: 'JVMS §2.5.1: each JVM thread has its own pc register. While executing a Java method it contains the address of the current JVM instruction; while executing a `native` method its value is undefined. It is wide enough for a `returnAddress` or a native pointer.\n\nHotSpot has no dedicated "pc register" structure. The template interpreter keeps a **bytecode pointer** (bcp) in a machine register (`r13` on x86-64) and saves it into the frame\'s bcp slot when it calls out. Compiled code uses the CPU\'s own program counter; debug information maps it back to a bytecode index for stack traces and deoptimization.',
    purpose:
      'Know where each thread is, so it can resume after a call returns or after the thread is rescheduled.',
    internals: [
      'Bytecode index within the current method (shown as offsets 0, 3, 4, 6… in `javap`)',
    ],
    inputs: [
      'Advanced by the interpreter after each instruction; changed by branches, calls and returns',
    ],
    outputs: [
      'The next instruction to fetch',
      'Line numbers in stack traces (via `LineNumberTable`)',
    ],
    example: {
      title: 'The pc values of main() are the offsets javap prints',
      language: 'text',
      code: `         0: new           #7                  // class Person
         3: dup
         4: ldc           #9                  // String Alex
         6: invokespecial #11                 // Method Person."<init>":(Ljava/lang/String;)V
         9: astore_1`,
      verifiedWith: V,
    },
    practice:
      "Stack traces show source lines because the JVM maps each frame's pc to a line through the `LineNumberTable` attribute. Compile with `-g:none` and the line numbers disappear from traces.",
    misconceptions: [
      {
        myth: 'The PC register is a CPU register reserved by the JVM.',
        truth:
          'It is a specification concept. HotSpot implements it differently in the interpreter (a bcp register and frame slot) and in compiled code (the hardware program counter plus debug info).',
      },
    ],
    specVsImpl: {
      spec: 'One pc per thread; holds the current instruction address; undefined in native methods.',
      implementation:
        'Interpreter: bytecode pointer in a register and frame slot. Compiled code: hardware PC + PcDesc/ScopeDesc debug info.',
    },
    references: [{ source: 'jvms-2.5.1' }, { source: 'src-frame-x86' }],
  },
  {
    id: 'native-method-stack',
    name: 'Native method stack',
    label: 'Native method\nstack',
    caption: 'C frames',
    parent: 'java-thread',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'Per-thread stack for native (C/C++) code called through JNI; in HotSpot it is the same stack as the Java frames.',
    simple:
      'When Java calls native code written in C or C++, that code needs a stack too. The native method stack holds those native calls.',
    deep: 'JVMS §2.5.6 allows "conventional stacks, colloquially called C stacks" to support native methods, with the same `StackOverflowError` and `OutOfMemoryError` conditions as JVM stacks. An implementation that cannot load native methods need not provide them.\n\nHotSpot does not keep a separate structure: each thread has **one native stack** on which interpreted frames, compiled frames, JNI transition frames and C frames are interleaved. The "JVM stack" and the "native method stack" are two views of that one memory region.',
    purpose: 'Run native code with an ordinary C calling convention.',
    internals: [
      'C frames of native methods and JNI calls',
      "Frames of the JVM's own C++ runtime code",
    ],
    inputs: ['Calls into native methods via JNI'],
    outputs: ['Return values back to Java frames'],
    practice:
      "Deep recursion in native code, or large stack arrays in C, can overflow the thread's stack. Unlike in Java code, that can crash the process instead of throwing `StackOverflowError`.",
    misconceptions: [
      {
        myth: 'A HotSpot thread has two separate stacks: one for Java and one for native code.',
        truth:
          "It has one native thread stack holding both kinds of frames. The specification's two areas are logical.",
      },
    ],
    specVsImpl: {
      spec: 'Optional per-thread "C stacks" for native methods.',
      implementation:
        "HotSpot: Java and native frames share each thread's single native stack (size set by `-Xss`).",
    },
    references: [{ source: 'jvms-2.5.6' }, { source: 'jni-spec' }],
  },
  {
    id: 'jvm-stack',
    name: 'JVM stack',
    label: 'JVM stack',
    caption: 'frames · LIFO',
    parent: 'java-thread',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'Per-thread stack of frames: one frame per active method call, pushed on call, popped on return.',
    simple:
      "Each thread's call history. When a method is called, a new **frame** is placed on top; when it returns, that frame is removed. The frame on top is the method running right now.",
    deep: "JVMS §2.5.2: each thread has a private JVM stack, created with the thread, that stores frames and is manipulated only by pushing and popping them. Its size may be fixed or dynamic. If a computation needs a deeper stack than permitted, the JVM throws `StackOverflowError`; if the stack cannot be created or expanded, `OutOfMemoryError`.\n\nHotSpot uses the thread's native stack (`-Xss`; `ThreadStackSize` defaults to 1024 KB on Linux x64). Protected guard zones at the end of the stack (reserved, yellow and red pages, plus a shadow zone checked on method entry) turn an overflow into a recoverable `StackOverflowError` instead of a crash.",
    purpose:
      'Track nested method calls and give each call private storage that disappears when it returns.',
    internals: [
      'Frames, newest on top (the current frame)',
      'HotSpot guard zones: reserved, yellow (throws `StackOverflowError`), red (fatal)',
    ],
    inputs: ['Method invocations push frames'],
    outputs: ['Returns pop frames; exceptions unwind them'],
    example: {
      title: 'Overflowing the default 1 MB stack',
      language: 'java',
      code: `public class Deep {
    static int depth = 0;
    static void recurse() { depth++; recurse(); }

    public static void main(String[] args) {
        try { recurse(); } catch (StackOverflowError e) {
            System.out.println("StackOverflowError at depth ~" + depth);
        }
    }
}`,
      output: 'StackOverflowError at depth ~20704',
      verifiedWith: `${V}; the depth varies with frame size and JIT compilation`,
    },
    errors: [
      {
        name: 'StackOverflowError',
        when: 'A thread needs more stack than allowed, typically from unbounded recursion.',
      },
      {
        name: 'OutOfMemoryError',
        when: 'The stack for a new thread cannot be created ("unable to create native thread").',
      },
    ],
    practice:
      "Thread dumps print each thread's stack, top frame first. `-Xss` changes the stack size for new threads: smaller stacks allow more platform threads, larger ones allow deeper recursion.",
    misconceptions: [
      {
        myth: "Objects created in a method are stored on that method's stack frame.",
        truth:
          'Objects are allocated in the heap; the frame holds only references to them. (The JIT may avoid an allocation entirely through scalar replacement, but that is an optimization, not the model.)',
      },
    ],
    specVsImpl: {
      spec: 'A per-thread stack of frames with defined overflow errors.',
      implementation:
        'HotSpot: the native thread stack, sized by `-Xss`, with guard pages that detect overflow.',
    },
    references: [
      { source: 'jvms-2.5.2' },
      { source: 'src-stackoverflow' },
      { source: 'tool-java' },
    ],
  },
  {
    id: 'stack-frame',
    name: 'Stack frame',
    label: 'Frame · main(String[]) @ pc 6',
    caption: 'max_locals=3 · max_stack=3',
    parent: 'jvm-stack',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      "Storage for one method invocation: local variables, operand stack and a link to the class's constant pool.",
    simple:
      "A frame is the workspace of one method call. It holds the method's local variables and a small scratch stack for calculations, and it remembers how to get back to the caller.",
    deep: "JVMS §2.6: a frame is created each time a method is invoked and destroyed when the invocation completes, normally or abruptly. It contains a [[local-variable-array|local variable array]], an [[operand-stack|operand stack]] and a reference to the run-time constant pool of the current method's class ([[dynamic-linking]]). Their sizes are fixed at compile time (`max_locals`, `max_stack` in the `Code` attribute: 3 and 3 for our `main`). Only one frame per thread is active: the current frame.\n\nHotSpot's interpreter frame on x86-64 additionally stores the sender's stack pointer, the `Method*`, the class mirror, the profiling pointer (mdp), the constant pool cache, the locals pointer, the bcp and a monitor block. Compiled frames look different again: values live in registers and one physical frame can represent several inlined methods.",
    purpose: "Isolate each invocation's state and make returning to the caller possible.",
    internals: [
      'Local variable array',
      'Operand stack',
      'Frame data: constant pool link, return information, monitors',
    ],
    inputs: ['Arguments passed by the caller'],
    outputs: ["A return value pushed onto the caller's operand stack, or a thrown exception"],
    example: {
      title: 'Frame sizes are computed by javac',
      language: 'text',
      code: `  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: (0x0009) ACC_PUBLIC, ACC_STATIC
    Code:
      stack=3, locals=3, args_size=1`,
      verifiedWith: V,
    },
    practice:
      "Each frame becomes one line in a stack trace. Exception handlers are looked up per frame in the method's exception table while the stack unwinds.",
    misconceptions: [
      {
        myth: 'Frames grow when a method needs more space.',
        truth: "A frame's maximum size is fixed at compile time and checked by the verifier.",
      },
    ],
    specVsImpl: {
      spec: 'Locals, operand stack, and a reference to the run-time constant pool, with sizes fixed per method.',
      implementation:
        'HotSpot: interpreter frames with extra slots (Method*, mdp, cpCache, bcp, monitors); compiled frames with register-allocated values and inlined callees.',
    },
    references: [{ source: 'jvms-2.6' }, { source: 'src-frame-x86' }],
  },
  {
    id: 'local-variables',
    name: 'Local variable array',
    label: 'Local variables',
    caption: '[0] args [1] p1 [2] p2',
    parent: 'stack-frame',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      "Indexed slots for a method's parameters and local variables; slot 0 is `this` in instance methods.",
    simple:
      'Numbered boxes where a method keeps its parameters and local variables. In `main`, box 0 holds `args`, box 1 holds `p1` and box 2 holds `p2`. A box can hold a number or a reference to an object, never the object itself.',
    deep: 'JVMS §2.6.1: an array of variables indexed from 0, sized by `max_locals`. Each slot holds a `boolean`, `byte`, `char`, `short`, `int`, `float`, `reference` or `returnAddress`; `long` and `double` occupy two consecutive slots. For instance methods slot 0 holds `this`; parameters follow in order. Instructions such as `aload_1` and `astore_2` move values between locals and the operand stack. Local names exist only in the optional `LocalVariableTable` (`javac -g`).',
    purpose: "Fast, indexed storage for a method's parameters and temporaries.",
    internals: [
      'Slot 0: `this` (instance methods) or the first parameter',
      'Parameters, then other locals',
      'Two slots for `long`/`double`',
    ],
    inputs: ['Arguments copied in on invocation; `xstore` instructions'],
    outputs: ['`xload` instructions push values onto the operand stack'],
    example: {
      title: 'Slots of main() (javac -g, javap -c -l)',
      language: 'text',
      code: `      LocalVariableTable:
        Start  Length  Slot  Name   Signature
            0      27     0  args   [Ljava/lang/String;
           10      17     1    p1   LPerson;
           12      15     2    p2   LPerson;`,
      verifiedWith: V,
    },
    practice:
      'Reference values in local slots are GC roots while they are live. The JIT may treat a variable as dead after its last use, so an object can become unreachable before the variable goes out of scope (JLS §12.6.1).',
    misconceptions: [
      {
        myth: '`p2 = p1` copies the Person object.',
        truth:
          'It copies the **reference** value from slot 1 to slot 2 (`aload_1`, `astore_2`). Both slots now refer to the same heap object.',
      },
    ],
    references: [{ source: 'jvms-2.6.1' }, { source: 'jls-12.6' }],
  },
  {
    id: 'operand-stack',
    name: 'Operand stack',
    label: 'Operand stack',
    caption: 'max depth 3',
    parent: 'stack-frame',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'A per-frame LIFO scratch stack: instructions pop their inputs from it and push their results.',
    simple:
      'The JVM is a stack machine. To compute something, it pushes values onto a small stack, and each instruction takes its inputs from the top and puts its result back on top.',
    deep: "JVMS §2.6.2: each frame has an operand stack whose maximum depth (`max_stack`) is fixed at compile time. It starts empty. Load and constant instructions push; arithmetic, field and invoke instructions pop operands and push results; invocations pop the arguments and the callee's return value is pushed onto the caller's stack. The verifier proves the stack's depth and types at every instruction.\n\nThe operand stack is a model: the template interpreter caches the top value in a register, and compiled code maps stack slots to registers, so no physical operand stack exists in JIT-compiled methods.",
    purpose:
      'A compact way to encode computations without naming registers, keeping bytecode small and portable.',
    internals: ['Entries typed like local variables', 'Maximum depth checked by the verifier'],
    inputs: ['Values from locals, constants, fields and call results'],
    outputs: ['Operands for the next instructions; return values'],
    example: {
      title: 'new Person("Alex") on the operand stack',
      language: 'text',
      code: `0: new #7            // [ Person(uninitialized) ]
3: dup               // [ Person, Person ]
4: ldc #9            // [ Person, Person, "Alex" ]      ← depth 3 = max_stack
6: invokespecial #11 // [ Person ]  (<init> consumed two values)
9: astore_1          // [ ]         (reference stored in local 1)`,
      verifiedWith: `${V} (instructions from javap; stack states follow JVMS §6.5)`,
    },
    practice:
      'Reading operand-stack effects is the key skill for understanding `javap` output and bytecode-manipulation libraries.',
    misconceptions: [
      {
        myth: "The operand stack is the same as the thread's stack.",
        truth:
          "Each frame has its own small operand stack inside it. The thread's JVM stack holds the frames.",
      },
    ],
    references: [
      { source: 'jvms-2.6.2' },
      { source: 'jvms-6.5-new' },
      { source: 'jvms-6.5-invokespecial' },
    ],
  },
  {
    id: 'frame-data',
    name: 'Frame data',
    label: 'Frame data',
    caption: 'RCP link · return info',
    parent: 'stack-frame',
    provenance: 'spec',
    scope: 'per-thread',
    summary:
      'The rest of a frame: the link to the run-time constant pool and what is needed to return or unwind.',
    simple:
      "Besides variables and the scratch stack, each frame keeps some bookkeeping: which class's constant table to use, where to go back to when the method finishes, and how to handle exceptions.",
    deep: '"Frame data" is a teaching label, not a JVMS term. It groups what JVMS §2.6 requires beyond locals and the operand stack: the reference to the current class\'s run-time constant pool for [[dynamic-linking]] (§2.6.3), and the state needed to restore the invoker on normal completion (§2.6.4) or to unwind on abrupt completion (§2.6.5).\n\nIn HotSpot\'s x86-64 interpreter frames this includes the return address, saved frame pointer, sender stack pointer, `Method*`, class mirror, method-data pointer (mdp) for profiling, constant pool cache, locals pointer, saved bcp, and the monitor block used by `synchronized` methods.',
    purpose:
      'Let the frame resolve symbols, return to its caller and participate in exception handling.',
    internals: [
      'Reference to the run-time constant pool (dynamic linking)',
      'Return address / saved caller state',
      'HotSpot extras: Method*, mdp, cpCache, bcp, monitors',
    ],
    inputs: ['Set up by the invocation sequence'],
    outputs: ['Used on return, on exception unwinding, and by profiling and debugging'],
    practice:
      'Debuggers and profilers walk frames using this data. Lock information in thread dumps ("locked <0x…> (a java.lang.Object)") comes from monitor records kept with frames.',
    misconceptions: [
      {
        myth: '"Frame data" is a structure named in the JVM Specification.',
        truth:
          'It is a common teaching term for the frame contents other than locals and the operand stack.',
      },
    ],
    accuracyNote:
      'The HotSpot fields listed are those of interpreter frames on x86-64; other CPUs and compiled frames differ.',
    references: [
      { source: 'jvms-2.6.3' },
      { source: 'jvms-2.6.4' },
      { source: 'jvms-2.6.5' },
      { source: 'src-frame-x86' },
    ],
  },
  {
    id: 'method-area',
    name: 'Method area',
    label: 'Method area',
    caption: 'HotSpot: Metaspace',
    parent: 'runtime-data-areas',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Shared per-class data: run-time constant pools, field and method data, and method code.',
    simple:
      "The place where the JVM keeps what it knows about each class: its methods' bytecode, its fields, and its constant table. There is one copy per class, shared by every object and every thread.",
    deep: 'JVMS §2.5.4: created at start-up, shared by all threads, it stores per-class structures — the run-time constant pool, field and method data, and the code for methods and constructors. The specification calls it "logically part of the heap" but does not mandate its location, garbage collection or compaction. If it cannot satisfy an allocation the JVM throws `OutOfMemoryError`.\n\nHotSpot (since JDK 8, JEP 122) stores class metadata — `InstanceKlass`, `Method`, `ConstMethod` (bytecode), `ConstantPool` — in [[metaspace|**Metaspace**]], native memory outside the Java heap. The `java.lang.Class` mirror (which holds static fields) and interned strings live in the Java heap; JIT-compiled code lives in the code cache.',
    purpose: "Hold each class's shared definition exactly once.",
    internals: [
      'Per-class metadata (HotSpot: `InstanceKlass`, vtable/itable)',
      'Methods: bytecode, max stack/locals, exception tables',
      'One run-time constant pool per class',
    ],
    inputs: ['Classes created by loading'],
    outputs: ['Bytecode and metadata used by the execution engine'],
    specVsImpl: {
      spec: 'A logical shared area for per-class structures; location and management not mandated.',
      implementation:
        'HotSpot JDK 25: Metaspace (native memory) for metadata; compressed class space (1 GB by default) for `Klass` structures; `Class` mirrors and static fields in the heap.',
    },
    errors: [
      {
        name: 'OutOfMemoryError: Metaspace',
        when: 'Class metadata exceeds `-XX:MaxMetaspaceSize` (unlimited by default) or native memory.',
      },
      {
        name: 'OutOfMemoryError: Compressed class space',
        when: 'Too many classes for the compressed class space (`-XX:CompressedClassSpaceSize`).',
      },
    ],
    practice:
      '`jcmd <pid> VM.metaspace` reports usage per class loader. `MaxMetaspaceSize` is unlimited by default; `MetaspaceSize` (21 MB) is only the first threshold that triggers a GC to try unloading classes, not a limit.',
    misconceptions: [
      {
        myth: 'Static variables live in Metaspace.',
        truth:
          "In HotSpot they live in the `java.lang.Class` mirror object in the Java heap (since JDK 7). Metaspace holds the class's metadata, not its static values.",
      },
      {
        myth: 'Metaspace is the new name for PermGen.',
        truth:
          'PermGen was part of the Java heap with a fixed maximum. Metaspace is native memory, grows on demand, and only holds metadata (interned strings and statics moved to the heap).',
      },
    ],
    references: [
      { source: 'jvms-2.5.4' },
      { source: 'jep-122' },
      { source: 'jep-387' },
      { source: 'src-metaspace' },
      { source: 'src-instanceklass' },
    ],
  },
  {
    id: 'runtime-constant-pool',
    name: 'Run-time constant pool',
    label: 'Run-time constant pools',
    caption: 'one per class',
    parent: 'method-area',
    provenance: 'spec',
    scope: 'per-class',
    summary:
      'Per-class table of constants and symbolic references, resolved lazily to direct references.',
    simple:
      'Each class has a table of the names and constants its code uses: other classes, methods, fields, and literal values like `"Alex"`. Instructions point into this table by number. The first time an entry is used, the JVM looks up what it really refers to and remembers the answer.',
    deep: 'JVMS §2.5.5 and §5.1: the run-time representation of a class file\'s `constant_pool` table, created when the class is created. It holds numeric and string constants and symbolic references to classes, fields, methods, method handles, method types and dynamically-computed constants or call sites. [[resolution|Resolution]] turns symbolic references into direct ones.\n\nIn HotSpot it is a `ConstantPool` in Metaspace plus a constant pool cache (`ResolvedFieldEntry`, `ResolvedMethodEntry`, `ResolvedIndyEntry` arrays) recording resolution results, and a heap array of resolved objects such as the `String` for `"Alex"`.',
    purpose:
      'Keep bytecode compact and allow late binding: code names things; the JVM resolves them at run time.',
    internals: [
      'Constants: integers, floats, longs, doubles, strings',
      'Symbolic references: Class, Fieldref, Methodref, InterfaceMethodref, MethodHandle, MethodType, Dynamic, InvokeDynamic',
      'Resolution cache (HotSpot cpCache)',
    ],
    inputs: ["The class file's constant pool, at class creation"],
    outputs: ['Operands for instructions such as `ldc`, `new`, `getfield`, `invokevirtual`'],
    example: {
      title: 'Entries main() uses',
      language: 'text',
      code: `   #7 = Class              #8             // Person
   #9 = String             #10            // Alex
  #11 = Methodref          #7.#12         // Person."<init>":(Ljava/lang/String;)V
  #14 = Fieldref           #15.#16        // java/lang/System.out:Ljava/io/PrintStream;
  #20 = Methodref          #7.#21         // Person.getName:()Ljava/lang/String;
  #24 = Methodref          #25.#26        // java/io/PrintStream.println:(Ljava/lang/String;)V`,
      verifiedWith: V,
    },
    practice:
      'Because references stay symbolic until run time, you can recompile one class without recompiling its callers, as long as the names and descriptors they use still exist.',
    misconceptions: [
      {
        myth: 'The constant pool only holds constants like numbers and strings.',
        truth:
          'Most entries are symbolic references to classes, fields and methods, plus the names and descriptors they are built from.',
      },
    ],
    specVsImpl: {
      spec: 'A per-class table of constants and symbolic references.',
      implementation:
        'HotSpot: `ConstantPool` + constant pool cache in Metaspace, resolved objects array in the heap.',
    },
    references: [
      { source: 'jvms-2.5.5' },
      { source: 'jvms-5.1' },
      { source: 'jvms-4.4' },
      { source: 'src-constantpool' },
      { source: 'src-cpcache' },
    ],
  },
  {
    id: 'heap',
    name: 'Heap',
    label: 'Heap',
    caption: 'all objects and arrays',
    parent: 'runtime-data-areas',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Shared memory for all class instances and arrays, reclaimed automatically by the garbage collector.',
    simple:
      'The big shared memory area where objects live. `new Person("Alex")` creates a Person in the heap; variables only hold references to it. You never free heap memory yourself: the garbage collector reclaims objects nothing refers to any more.',
    deep: 'JVMS §2.5.3: created at start-up and shared among all threads; the area from which memory for all class instances and arrays is allocated. Storage is reclaimed by automatic storage management; objects are never explicitly deallocated. Size may be fixed or expandable; if more heap is needed than can be provided, the JVM throws `OutOfMemoryError`.\n\nHotSpot JDK 25 on a server-class machine uses G1 by default: the heap is split into equal-sized regions (2 MB in our measured run) that serve as eden, survivor, old or humongous regions. Threads allocate by bumping a pointer inside a private [[tlab|TLAB]]. By default an object has a 12-byte header (8-byte mark word + 4-byte compressed class pointer) and references are 32-bit [[compressed-oops|compressed oops]] — so a reference is **not** a raw memory address.',
    purpose:
      'Give objects a lifetime independent of the method that created them, shared safely across threads.',
    internals: [
      'Objects: header (mark word, class pointer), fields, padding to 8 bytes',
      'Arrays: header plus a 4-byte length, then elements',
      'HotSpot: generations and regions defined by the selected GC; TLABs',
    ],
    inputs: ['`new`, `newarray`, `anewarray`, string literals and boxing'],
    outputs: ['References stored in locals, fields and array elements'],
    example: {
      title: 'Object layout on JDK 25 (x64, default flags)',
      language: 'text',
      code: `Person.name field offset          = 12   (8-byte mark word + 4-byte class pointer)
int[] first element offset        = 16   (12-byte header + 4-byte length)
with -XX:+UseCompactObjectHeaders = 8 and 12 (JEP 519: 8-byte header)`,
      verifiedWith: `${V}, measured with Unsafe.objectFieldOffset / arrayBaseOffset`,
    },
    errors: [
      {
        name: 'OutOfMemoryError: Java heap space',
        when: 'Live objects do not fit in the maximum heap (`-Xmx`).',
      },
    ],
    practice:
      'By default HotSpot sizes the maximum heap at 25% of physical (or container) memory (`MaxRAMPercentage`) and the initial heap at 1/64 (`InitialRAMPercentage = 1.5625`). Production services usually set `-Xmx` (and often `-Xms`) explicitly. `jcmd <pid> GC.heap_info` shows current usage.',
    misconceptions: [
      {
        myth: 'Every `new` allocates an object in the heap.',
        truth:
          'Semantically yes, but if the JIT proves an object never escapes its method, [[escape-analysis|escape analysis]] can replace it with plain local values (scalar replacement), so no heap object exists.',
      },
      {
        myth: 'A Java reference is the memory address of the object.',
        truth:
          'The specification only says references point to objects. HotSpot often stores 32-bit compressed oops (offsets scaled by 8), and moving collectors change addresses while the program runs.',
      },
      {
        myth: 'The Java heap is the same as the C heap (`malloc`).',
        truth:
          'They are different regions of process memory. The JVM reserves the Java heap itself and manages it with its GC.',
      },
    ],
    specVsImpl: {
      spec: 'One shared heap, automatically managed, no layout or algorithm mandated (JVMS §2.7: "does not mandate any particular internal structure for objects").',
      implementation:
        'HotSpot JDK 25: GC-specific layout (G1 regions by default), TLAB allocation, 12-byte headers and compressed oops by default.',
    },
    references: [
      { source: 'jvms-2.5.3' },
      { source: 'jvms-2.7' },
      { source: 'src-markword' },
      { source: 'src-tlab' },
      { source: 'jep-519' },
      { source: 'guide-gc' },
    ],
  },
  {
    id: 'young-generation',
    name: 'Young generation',
    label: 'Young generation',
    caption: 'G1: young regions',
    parent: 'heap',
    provenance: 'hotspot',
    scope: 'shared',
    summary: 'Where new objects start: eden plus survivor space, collected often and cheaply.',
    simple:
      'Most objects die young: a temporary string, a loop iterator. The JVM puts new objects in a "young" area and cleans it often. Cleaning is cheap because only the few survivors need to be kept.',
    deep: "Generational collection exploits the weak generational hypothesis. In G1 the young generation is a set of (not necessarily contiguous) eden and survivor regions whose total size the collector adapts to meet its pause-time goal. A young collection is a stop-the-world evacuation pause that copies live young objects into survivor or old regions; its cost depends on the amount of **live** data, not on garbage. Serial and Parallel GC use a contiguous young generation (eden plus two survivor spaces); ZGC is generational since JDK 21 and only generational since JDK 24; Shenandoah's generational mode is a product feature in JDK 25 but not the default.",
    purpose: 'Reclaim short-lived objects quickly without scanning the whole heap.',
    internals: [
      'Eden regions',
      'Survivor regions',
      'Remembered sets for references from old to young objects',
    ],
    inputs: ['New allocations (into eden)'],
    outputs: ['Survivors aged into survivor regions; long-lived objects promoted to old'],
    practice:
      'A healthy service shows frequent, short "Pause Young" entries in its GC log. Rising young pause times usually mean more live data is surviving, for example from caches or large in-flight requests.',
    misconceptions: [
      {
        myth: 'Every Java garbage collector is generational.',
        truth:
          'Epsilon has no generations, and Shenandoah is single-generation unless its generational mode is enabled.',
      },
    ],
    accuracyNote:
      'Drawn as one contiguous block. In G1 the young generation is a changing set of regions scattered across the heap.',
    version: 'HotSpot, JDK 25',
    references: [
      { source: 'guide-gc' },
      { source: 'src-g1' },
      { source: 'jep-439' },
      { source: 'jep-490' },
      { source: 'jep-521' },
    ],
  },
  {
    id: 'eden',
    name: 'Eden',
    label: 'Eden',
    caption: 'new objects · TLABs',
    parent: 'young-generation',
    provenance: 'hotspot',
    scope: 'shared',
    summary: 'Where almost all new objects are allocated, inside per-thread TLABs.',
    simple:
      'The nursery: brand-new objects are created here. When eden fills up, a quick garbage collection moves the survivors out and the whole of eden becomes free again.',
    deep: 'Each thread receives a [[tlab|thread-local allocation buffer]] carved from eden and allocates by bumping a pointer, without locks. When eden is exhausted, the collector schedules a young collection. In G1, live objects are evacuated (copied) from eden regions to survivor or old regions; afterwards the eden regions are empty and reused. Large objects (at least half a region in G1) bypass eden as [[humongous-object|humongous]] allocations.',
    purpose: 'Make allocation almost as cheap as incrementing a pointer.',
    internals: ['TLABs per thread', 'Bump-pointer allocation'],
    inputs: ['`new` and array allocations'],
    outputs: ['Survivors copied out at the next young GC'],
    example: {
      title: 'Young collections in a G1 GC log',
      language: 'shell',
      code: '$ java -Xmx64m -Xlog:gc -cp . Alloc',
      output: `[0.006s][info][gc] Using G1
[0.061s][info][gc] GC(0) Pause Young (Normal) (G1 Evacuation Pause) 29M->3M(64M) 3.593ms
[0.073s][info][gc] GC(1) Pause Young (Normal) (G1 Evacuation Pause) 30M->6M(64M) 4.487ms`,
      verifiedWith: `${V} (Alloc allocates 2,000 × 64 KB arrays and keeps every tenth)`,
    },
    practice:
      '"29M->3M(64M)" reads: heap occupancy before → after the pause (committed heap size), followed by the pause duration.',
    misconceptions: [
      {
        myth: 'The GC frees dead objects in eden one by one.',
        truth:
          'It copies the live ones out and then treats the entire region as empty. Dead objects are never visited.',
      },
    ],
    version: 'HotSpot, JDK 25 (G1)',
    references: [{ source: 'guide-gc' }, { source: 'src-tlab' }, { source: 'jep-158' }],
  },
  {
    id: 'survivor',
    name: 'Survivor space',
    label: 'Survivor',
    caption: 'aging',
    parent: 'young-generation',
    provenance: 'hotspot',
    scope: 'shared',
    summary: 'Holds objects that survived a young collection while they age.',
    simple:
      'Objects that survive a cleanup of eden move here. Each time they survive another cleanup they get a bit older; old enough objects move on to the old generation.',
    deep: 'Each young collection copies live objects from eden and the current survivor space into new survivor space, incrementing their age (kept in 4 bits of the mark word, so at most 15). Objects whose age reaches the tenuring threshold (`MaxTenuringThreshold`, 15 by default, adjusted dynamically) or that do not fit are promoted to the old generation. Serial and Parallel GC alternate between two survivor spaces ("from" and "to"); G1 uses survivor regions.',
    purpose:
      'Give medium-lived objects a chance to die before they are promoted to the expensive old generation.',
    internals: ['Object age in the mark word', 'Tenuring threshold'],
    inputs: ['Live objects evacuated from eden and survivor'],
    outputs: ['Promotion to the old generation'],
    practice:
      '`-Xlog:gc+age=trace` prints the age distribution of surviving objects at each young collection.',
    misconceptions: [
      {
        myth: 'Objects stay in the survivor space until they die.',
        truth:
          'They are copied at every young GC and promoted once they reach the tenuring threshold.',
      },
    ],
    version: 'HotSpot, JDK 25',
    references: [{ source: 'guide-gc' }, { source: 'src-markword' }],
  },
  {
    id: 'old-generation',
    name: 'Old generation',
    label: 'Old\ngeneration',
    caption: 'long-lived · humongous',
    parent: 'heap',
    provenance: 'hotspot',
    scope: 'shared',
    summary: 'Long-lived objects promoted from the young generation, collected less often.',
    simple:
      'Objects that live a long time, such as caches, configuration and long-running sessions, end up here. This area is cleaned less often because its objects rarely become garbage.',
    deep: 'Objects reach the old generation by promotion (aging out of survivor space) or, in G1, by direct [[humongous-object|humongous]] allocation. G1 collects old regions incrementally: when heap occupancy crosses the initiating threshold it starts a concurrent marking cycle, then performs *mixed* collections that evacuate young regions plus the old regions with the most garbage. A full GC (parallel mark-compact in G1) is the fallback when concurrent collection cannot keep up.',
    purpose: 'Avoid repeatedly copying objects that are going to live a long time.',
    internals: [
      'Old regions',
      'Humongous regions (logically old)',
      'Concurrent marking and mixed collections (G1)',
    ],
    inputs: ['Promoted objects, humongous allocations'],
    outputs: ['Space reclaimed by mixed or full collections'],
    errors: [
      {
        name: 'OutOfMemoryError: Java heap space',
        when: 'Old regions are full of live objects and no collection can free enough space.',
      },
    ],
    practice:
      'Old-generation occupancy that keeps rising after each collection is the classic signature of a memory leak. "Pause Full" entries in a G1 log mean concurrent collection fell behind.',
    misconceptions: [
      {
        myth: 'A "major GC" always means a full stop-the-world collection of the whole heap.',
        truth:
          'With G1, old regions are mostly reclaimed incrementally by mixed collections after concurrent marking.',
      },
    ],
    accuracyNote:
      'In G1, old regions are interleaved with young and free regions; the boundary drawn here is conceptual.',
    version: 'HotSpot, JDK 25 (G1)',
    references: [{ source: 'guide-gc' }, { source: 'src-g1' }],
  },
];
