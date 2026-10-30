import type { Quiz } from '@/types/content';

export const ANATOMY_QUIZ: Quiz = {
  id: 'jvm-anatomy',
  title: 'Check your understanding: JVM anatomy',
  questions: [
    {
      id: 'where-is-p1',
      kind: 'memory-state',
      prompt:
        'While `main` runs `Person p1 = new Person("Alex");`, where is the variable `p1` stored?',
      options: [
        {
          id: 'heap',
          text: 'In the heap, next to the Person object',
          correct: false,
          explanation:
            'The **object** is in the heap. The variable `p1` only holds a reference to it, and local variables live in the frame.',
        },
        {
          id: 'frame',
          text: "In local variable slot 1 of `main`'s frame, on the main thread's JVM stack",
          correct: true,
          explanation:
            "Correct. `astore_1` stores the reference into slot 1 of the current frame's [[local-variable-array]]. Slot 0 holds `args`.",
        },
        {
          id: 'method-area',
          text: 'In the method area, because `main` is a static method',
          correct: false,
          explanation:
            'The method area holds per-class data such as bytecode and the constant pool, not the local variables of running invocations.',
        },
        {
          id: 'rcp',
          text: 'In the run-time constant pool of `Main`',
          correct: false,
          explanation:
            'The constant pool holds constants and symbolic references (like `#7 = Class Person`), not variable values.',
        },
      ],
      references: [{ source: 'jvms-2.6.1' }],
    },
    {
      id: 'string-loader',
      kind: 'predict-output',
      prompt: 'What does this line print on JDK 25?',
      code: {
        id: 'q-loader',
        title: 'Predict the output',
        language: 'java',
        code: 'System.out.println(String.class.getClassLoader());',
      },
      options: [
        {
          id: 'null',
          text: '`null`',
          correct: true,
          explanation:
            'Correct. `String` is defined by the [[bootstrap-class-loader|bootstrap class loader]], which Java APIs represent as `null`.',
        },
        {
          id: 'app',
          text: '`jdk.internal.loader.ClassLoaders$AppClassLoader@…`',
          correct: false,
          explanation: 'The application loader defines your classes, not `java.lang` classes.',
        },
        {
          id: 'platform',
          text: '`jdk.internal.loader.ClassLoaders$PlatformClassLoader@…`',
          correct: false,
          explanation:
            'The platform loader defines modules such as `java.sql`, but `java.base` belongs to the bootstrap loader.',
        },
        {
          id: 'error',
          text: 'It throws `SecurityException`',
          correct: false,
          explanation:
            'There is no restriction here (and the Security Manager was permanently disabled in JDK 24).',
        },
      ],
      references: [{ source: 'api-classloader' }, { source: 'src-module-loader-map' }],
    },
    {
      id: 'lifecycle-order',
      kind: 'ordering',
      prompt:
        'Which order does the JVM Specification require for a class to be ready to run its static initializer?',
      options: [
        {
          id: 'a',
          text: 'Loading → linking (verification, preparation) → initialization',
          correct: true,
          explanation:
            'Correct. Resolution, also part of linking, may happen later and lazily (JVMS §5.4).',
        },
        {
          id: 'b',
          text: 'Linking → loading → initialization',
          correct: false,
          explanation: 'A class must exist (be loaded) before it can be linked.',
        },
        {
          id: 'c',
          text: 'Loading → initialization → verification',
          correct: false,
          explanation:
            'Verification is part of linking, which must complete before initialization.',
        },
        {
          id: 'd',
          text: 'Initialization happens at the same moment as loading',
          correct: false,
          explanation:
            'Loading and initialization are separate; `Class.forName(name, false, loader)` loads without initializing.',
        },
      ],
      references: [{ source: 'jvms-5.4' }, { source: 'jvms-5.5' }],
    },
    {
      id: 'per-thread',
      kind: 'concept',
      prompt: 'Which runtime data area is private to each thread?',
      options: [
        {
          id: 'heap',
          text: 'Heap',
          correct: false,
          explanation:
            'The heap is shared by all threads; that is what makes shared objects (and race conditions) possible.',
        },
        {
          id: 'pc',
          text: 'PC register',
          correct: true,
          explanation:
            'Correct. Each thread has its own pc register, JVM stack and native method stack (JVMS §2.5).',
        },
        {
          id: 'ma',
          text: 'Method area',
          correct: false,
          explanation: "The method area is shared: there is one copy of each class's metadata.",
        },
        {
          id: 'rcp',
          text: 'Run-time constant pool',
          correct: false,
          explanation: 'There is one per class, shared by all threads.',
        },
      ],
      references: [{ source: 'jvms-2.5' }],
    },
    {
      id: 'metaspace',
      kind: 'concept',
      prompt:
        'In HotSpot JDK 25, where is the metadata of a loaded class (its `InstanceKlass`, methods and bytecode) stored?',
      options: [
        {
          id: 'meta',
          text: 'Metaspace, in native memory',
          correct: true,
          explanation:
            'Correct. Since JDK 8 (JEP 122) class metadata lives in [[metaspace]]. The `Class` mirror object, with the static fields, is in the Java heap.',
        },
        {
          id: 'perm',
          text: 'The permanent generation (PermGen)',
          correct: false,
          explanation: 'PermGen was removed in JDK 8.',
        },
        {
          id: 'heap',
          text: 'The old generation of the Java heap',
          correct: false,
          explanation:
            'Only the `java.lang.Class` mirror and static field values are in the heap; the metadata itself is not.',
        },
        {
          id: 'cache',
          text: 'The code cache',
          correct: false,
          explanation:
            'The code cache holds generated machine code (interpreter, stubs, compiled methods), not class metadata.',
        },
      ],
      references: [{ source: 'jep-122' }, { source: 'jvms-2.5.4' }],
    },
    {
      id: 'gc-timing',
      kind: 'memory-state',
      prompt:
        'After `p1 = null; p2 = null;`, no reference to the Person remains. What happens to the object immediately?',
      options: [
        {
          id: 'freed',
          text: 'Its memory is freed at once',
          correct: false,
          explanation:
            'Java has no immediate deallocation. Unreachability only makes the object **eligible**.',
        },
        {
          id: 'nothing',
          text: 'Nothing yet: it is eligible, and a later GC cycle may reclaim it',
          correct: true,
          explanation:
            'Correct. It is reclaimed during some later collection, or never if the program ends first.',
        },
        {
          id: 'finalized',
          text: 'Its finalizer runs immediately',
          correct: false,
          explanation:
            'Finalization (deprecated) was never immediate, and `Person` has no finalizer.',
        },
        {
          id: 'moved',
          text: 'It is moved to the old generation',
          correct: false,
          explanation: 'Promotion applies to objects that **survive** collections, not to garbage.',
        },
      ],
      references: [{ source: 'jls-12.6' }, { source: 'jvms-2.5.3' }],
    },
    {
      id: 'deopt',
      kind: 'concept',
      prompt: 'When does HotSpot deoptimize a compiled method?',
      options: [
        {
          id: 'old',
          text: 'When the compiled code is older than a time limit',
          correct: false,
          explanation:
            'Age is not a trigger. Unused code may be unloaded, but that is not deoptimization.',
        },
        {
          id: 'assume',
          text: 'When an assumption baked into the compiled code no longer holds',
          correct: true,
          explanation:
            'Correct. For example a receiver type never seen before, or a newly loaded subclass that invalidates class-hierarchy-based inlining.',
        },
        {
          id: 'gc',
          text: 'At every garbage collection',
          correct: false,
          explanation: 'GC does not deoptimize code. It may unload code of unloaded classes.',
        },
        {
          id: 'exception',
          text: 'Whenever the method throws any exception',
          correct: false,
          explanation:
            'Compiled code handles exceptions normally. Only unexpected situations the compiler speculated away cause an uncommon trap.',
        },
      ],
      references: [{ source: 'src-deoptimization' }],
    },
    {
      id: 'loadlibrary',
      kind: 'predict-output',
      prompt:
        'On Linux, which file does `System.loadLibrary("nativemath")` look for on `java.library.path`?',
      options: [
        {
          id: 'so',
          text: '`libnativemath.so`',
          correct: true,
          explanation:
            'Correct. The name is mapped to the platform file name (`System.mapLibraryName`): `libnativemath.so` on Linux, `libnativemath.dylib` on macOS, `nativemath.dll` on Windows.',
        },
        {
          id: 'plain',
          text: '`nativemath`',
          correct: false,
          explanation: 'The name is mapped to a platform-specific file name first.',
        },
        {
          id: 'jar',
          text: '`nativemath.jar`',
          correct: false,
          explanation: 'Native libraries are shared objects, not JAR files.',
        },
        {
          id: 'class',
          text: '`nativemath.class`',
          correct: false,
          explanation: 'Class files hold bytecode; native libraries hold machine code.',
        },
      ],
      references: [{ source: 'api-system-loadlibrary' }],
    },
  ],
};
