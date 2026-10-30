import type { ComponentDoc } from '@/types/content';

const V = 'OpenJDK 25.0.4 · Linux x64';

export const classLoadingComponents: ComponentDoc[] = [
  {
    id: 'class-loader-subsystem',
    name: 'Class loader subsystem',
    label: 'Class loader subsystem',
    parent: 'jvm',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Finds class bytes, turns them into run-time classes, links them and runs their static initialization, on demand.',
    beginner:
      "Before Java can use a class, it has to find the class's compiled bytes and turn them into something it can run. This subsystem does that work lazily, the first time a class is actually needed: it **loads** the class, **links** it (checks and prepares it) and **initializes** it (runs its static setup code).",
    technical:
      'JVMS Chapter 5 defines three steps. [[loading|Loading]] creates a class from a binary representation using a class loader. [[linking|Linking]] combines the class into the run-time state: [[verification]], [[preparation]] and, possibly later, [[resolution]]. [[initialization|Initialization]] executes the class initialization method `<clinit>`.\n\nA run-time class is identified by its binary name **and its defining class loader**, so the same bytes loaded by two loaders produce two distinct classes. HotSpot records loaded classes per loader (`ClassLoaderData`, `SystemDictionary`) and stores their metadata in Metaspace.',
    purpose:
      "Load only what the program uses, keep untrusted bytes from breaking the JVM's type safety, and allow isolation (plugins, application servers) through separate loaders.",
    internals: [
      'Built-in loaders: bootstrap, platform, application (system)',
      'User-defined loaders (subclasses of `java.lang.ClassLoader`)',
      'Lifecycle: loading → linking (verification, preparation, resolution) → initialization → (optional) unloading',
      'Loading constraints that keep types consistent across loaders (JVMS §5.3.4)',
    ],
    inputs: ['Class files from the class path, module path, runtime image or CDS/AOT archive'],
    outputs: [
      'Class metadata in the method area (HotSpot: Metaspace)',
      'A `java.lang.Class` object in the heap for each class',
    ],
    example: {
      title: 'Loading is not initialization',
      language: 'java',
      code: `public class Lazy {
    static class Helper {
        static {
            System.out.println("Helper initialized");
        }

        static void hello() {
            System.out.println("hello");
        }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("main started");
        Class<?> c = Class.forName("Lazy$Helper", false, Lazy.class.getClassLoader());
        System.out.println("loaded: " + c.getName());
        Helper.hello();
    }
}`,
      output: `main started
loaded: Lazy$Helper
Helper initialized
hello`,
      verifiedWith: V,
    },
    practice:
      '`-Xlog:class+load` shows every class and where it came from; `-Xlog:class+init` shows initialization order. `ClassNotFoundException` comes from explicit lookups (`Class.forName`, `loadClass`); `NoClassDefFoundError` means the JVM itself could not find or initialize a class it needed while running code. Startup time is mostly class loading and initialization, which CDS and the JDK 24+ AOT cache (JEP 483) reduce.',
    misconceptions: [
      {
        myth: 'All classes are loaded when the program starts.',
        truth:
          'Classes are loaded lazily, typically when a symbolic reference to them is first resolved. A trivial program on JDK 25 still loads about 430 classes, almost all of them JDK classes from the CDS archive.',
      },
      {
        myth: 'Loading a class runs its static initializer.',
        truth:
          'Initialization is a separate, later step with precise triggers (JLS §12.4.1). The example above loads `Helper` without initializing it.',
      },
    ],
    accuracyNote:
      'The diagram shows the phases as boxes in sequence. In a running JVM they interleave: resolving one class can trigger loading of others, and resolution is usually lazy, long after linking started.',
    references: [
      { source: 'jvms-5.3' },
      { source: 'jvms-5.4' },
      { source: 'jvms-5.5' },
      { source: 'jls-12.4.1' },
      { source: 'src-systemdictionary' },
    ],
  },
  {
    id: 'parent-delegation',
    name: 'Parent delegation',
    label: 'Parent delegation',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary: 'A loader asks its parent first; built-in loaders since JDK 9 first route by module.',
    beginner:
      'When a class loader is asked for a class, it first asks its parent loader. Only if the parent cannot provide the class does it look for the class itself. Because the request travels up first, core classes like `java.lang.String` always come from the JDK and cannot be replaced by a file on your class path.',
    technical:
      "The classic algorithm in `ClassLoader.loadClass`: check `findLoadedClass`, delegate to the parent, then call `findClass`. The JDK's built-in loaders refine it (`BuiltinClassLoader.loadClassOrNull`, JDK 9+): they first map the class's package to a module. If the package belongs to a named module defined to a built-in loader, the request goes **directly to that loader**, which need not be the parent. Only packages in no named module are delegated to the parent and then searched on the class path.\n\nUser-defined loaders may override `loadClass` (for example child-first web-application loaders). That is legal, but the JVM still enforces loading constraints so a type name cannot mean two different classes across a method call.",
    purpose:
      'Keep core platform classes authoritative, avoid loading a class twice, and give each loader a predictable view of types.',
    internals: [
      '`findLoadedClass`: has this loader already loaded (initiated) the class?',
      'Module lookup (built-in loaders): package → module → defining loader',
      'Parent delegation for packages outside named modules',
      '`findClass` / class-path search, then `defineClass`',
    ],
    inputs: ['A binary class name, e.g. `java.sql.Connection`'],
    outputs: ['The defining loader and the resulting `Class` object, or `ClassNotFoundException`'],
    example: {
      title: 'Who defined these classes?',
      language: 'java',
      code: `System.out.println(String.class.getClassLoader());
System.out.println(java.sql.Connection.class.getClassLoader());
System.out.println(Loaders.class.getClassLoader());
System.out.println(Loaders.class.getClassLoader().getParent());
System.out.println(ClassLoader.getPlatformClassLoader().getName());
System.out.println(ClassLoader.getSystemClassLoader().getName());`,
      output: `null
jdk.internal.loader.ClassLoaders$PlatformClassLoader@18b4aac2
jdk.internal.loader.ClassLoaders$AppClassLoader@341d43cd
jdk.internal.loader.ClassLoaders$PlatformClassLoader@18b4aac2
platform
app`,
      verifiedWith: `${V} (hash codes vary between runs)`,
    },
    practice:
      'Classic symptoms of delegation problems: `ClassCastException: X cannot be cast to X` (two loaders defined the same class name), `LinkageError: loader constraint violation`, and libraries that work in a plain application but not in an application server with child-first loaders.',
    misconceptions: [
      {
        myth: 'Delegation is always strictly parent-first.',
        truth:
          'Since JDK 9 the built-in loaders route by module first, and custom loaders may choose child-first. Parent-first is the default for packages that are not in a named module.',
      },
      {
        myth: 'The bootstrap class loader is a `ClassLoader` object.',
        truth:
          'It is built into the JVM. Java APIs represent it as `null`, which is why `String.class.getClassLoader()` prints `null`.',
      },
    ],
    references: [
      { source: 'api-classloader' },
      { source: 'src-builtin-classloader' },
      { source: 'jep-261' },
      { source: 'jvms-5.3.4' },
    ],
  },
  {
    id: 'bootstrap-loader',
    name: 'Bootstrap class loader',
    label: 'Bootstrap loader',
    caption: 'native · java.base, java.xml, …',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Built into the JVM; defines the core platform classes such as java.lang.Object and String.',
    beginner:
      'The first loader, built into the JVM itself. It loads the most fundamental classes, like `Object` and `String`, which every other class depends on. Java code sees it as `null`.',
    technical:
      'JVMS §5.3.1: the bootstrap loader is supplied by the JVM and finds classes in an implementation-dependent way. In JDK 25 it defines the classes of the boot modules listed in `module-loader-map.conf`, including `java.base`, `java.logging`, `java.xml`, `java.desktop`, `java.management` and `jdk.unsupported`. HotSpot reads them from the runtime image (`lib/modules`, a jimage file, JEP 220) — in practice most are mapped directly from the default [[cds|CDS]] archive. Classes it defines are never unloaded.',
    purpose: 'Bring up the core class library with no Java code available yet to do the loading.',
    internals: [
      'Implemented in the JVM (C++ in HotSpot), not as a Java object',
      'Source: the runtime image `lib/modules` and the CDS archive',
      'Extension point: `-Xbootclasspath/a:` appends to its search path',
    ],
    inputs: ['Requests for classes in boot modules'],
    outputs: ['Core classes (`java.lang.*`, `java.util.*`, …)'],
    example: {
      title: 'Core classes come from the shared archive',
      language: 'shell',
      code: '$ java -Xlog:class+load -cp . Main | head -2',
      output: `[0.020s][info][class,load] java.lang.Object source: shared objects file
[0.021s][info][class,load] java.lang.String source: shared objects file`,
      verifiedWith: V,
    },
    practice:
      'You cannot override `java.lang` classes from the class path. Patching boot modules for testing uses `--patch-module`, not class path tricks.',
    misconceptions: [
      {
        myth: 'The bootstrap loader reads `rt.jar`.',
        truth:
          '`rt.jar` disappeared in JDK 9. Classes now come from the modular runtime image (`lib/modules`) and the CDS archive.',
      },
    ],
    references: [
      { source: 'jvms-5.3.1' },
      { source: 'src-module-loader-map' },
      { source: 'jep-220' },
      { source: 'jep-341' },
    ],
  },
  {
    id: 'platform-loader',
    name: 'Platform class loader',
    label: 'Platform loader',
    caption: 'java.sql, java.net.http, …',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'A JDK loader (since JDK 9) for platform modules not defined by the bootstrap loader, such as java.sql.',
    beginner:
      'The middle loader. It loads parts of the Java platform that are not needed by every program, for example the database API in `java.sql`.',
    technical:
      'Returned by `ClassLoader.getPlatformClassLoader()` and named `"platform"`. In JDK 25 it defines the modules listed as `PLATFORM_MODULES` in `module-loader-map.conf`, including `java.sql`, `java.sql.rowset`, `java.net.http`, `java.scripting`, `java.xml.crypto` and `jdk.httpserver`. Its parent is the bootstrap loader, so `getParent()` returns `null`. It replaced the JDK 8 extension class loader; the extension mechanism (`jre/lib/ext`) no longer exists.',
    purpose:
      'Load platform modules with fewer privileges than the bootstrap loader and allow them to be upgraded or omitted with `jlink`.',
    internals: [
      'Implemented in Java: `jdk.internal.loader.ClassLoaders$PlatformClassLoader`',
      'Module-aware lookup (see parent delegation)',
    ],
    inputs: ['Delegated requests from the application loader'],
    outputs: ['Classes of platform modules'],
    example: {
      title: 'java.sql is defined by the platform loader',
      language: 'java',
      code: `System.out.println(java.sql.Connection.class.getClassLoader());
System.out.println(java.sql.Connection.class.getModule());`,
      output: `jdk.internal.loader.ClassLoaders$PlatformClassLoader@18b4aac2
module java.sql`,
      verifiedWith: V,
    },
    practice:
      'Code that assumed `getClassLoader()` returns `null` for every JDK class broke when modules moved to the platform loader. Use `ClassLoader.getPlatformClassLoader()` as the parent of isolated custom loaders that should see the JDK but not the application.',
    misconceptions: [
      {
        myth: 'It is the old extension class loader renamed.',
        truth:
          'It has a different role: it defines JDK platform modules. The `lib/ext` extension mechanism was removed in JDK 9.',
      },
    ],
    specVsImpl: {
      spec: 'The JVM Specification only distinguishes the bootstrap loader from user-defined loaders. The Java SE API (`ClassLoader`) specifies that a platform class loader exists.',
      implementation:
        'Which modules it defines is an OpenJDK build decision (`module-loader-map.conf`), not a specification rule.',
    },
    references: [
      { source: 'api-classloader' },
      { source: 'src-module-loader-map' },
      { source: 'src-classloaders' },
      { source: 'jep-261' },
    ],
  },
  {
    id: 'application-loader',
    name: 'Application class loader',
    label: 'Application loader',
    caption: 'class path · module path',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'The "system" class loader: loads your classes from the class path and the application module path.',
    beginner:
      'The loader for your own code and the libraries you add. It looks in the folders and JAR files on the class path (`-cp`) and in modules on the module path.',
    technical:
      'Returned by `ClassLoader.getSystemClassLoader()` unless replaced with `-Djava.system.class.loader`; named `"app"`; its parent is the platform loader. It loads classes from `-cp`/`--class-path` (the unnamed module) and defines application modules from `--module-path`. The launcher uses it to load the main class, so `Main` and `Person` in our example are defined here.',
    purpose: 'Load the application and its libraries.',
    internals: [
      'Implemented in Java: `jdk.internal.loader.ClassLoaders$AppClassLoader`',
      'Class path entries: directories and JAR files',
      'Application modules from the module path',
    ],
    inputs: ['Requests from the launcher and from application code'],
    outputs: ['Application classes, such as `Main` and `Person`'],
    example: {
      title: 'Where Main.class came from',
      language: 'shell',
      code: '$ java -Xlog:class+load -cp . Main | grep -E "Main|Person"',
      output: `[0.059s][info][class,load] Main source: file:/…/
[0.060s][info][class,load] Person source: file:/…/`,
      verifiedWith: V,
    },
    practice:
      'Most `ClassNotFoundException`s in applications are class path problems: a missing JAR, a typo in `-cp`, or the wrong working directory for a relative path.',
    misconceptions: [
      {
        myth: 'The application loader can load any class on the class path, even `java.lang.String`.',
        truth:
          'Packages that belong to platform modules are routed to the loader that owns the module first, so a copy on the class path is ignored.',
      },
    ],
    specVsImpl: {
      spec: 'The Java SE API specifies a system class loader; the JVM Specification treats it as an ordinary user-defined loader.',
      implementation: 'In OpenJDK it is `ClassLoaders$AppClassLoader`, a `BuiltinClassLoader`.',
    },
    references: [
      { source: 'api-classloader' },
      { source: 'src-classloaders' },
      { source: 'tool-java' },
    ],
  },
  {
    id: 'custom-loaders',
    name: 'Custom class loaders',
    label: 'Custom loaders',
    caption: 'user-defined ClassLoader',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Application-defined subclasses of ClassLoader used for isolation, plugins, hot reloading and generated code.',
    beginner:
      'Programs can create their own class loaders, for example to load plugins from a folder, to keep two versions of a library apart, or to reload code without restarting.',
    technical:
      'A user-defined loader extends `java.lang.ClassLoader` and usually overrides `findClass`, calling `defineClass` with the class bytes (JVMS §5.3.2). Each loader forms its own namespace: a class is identified by name *and* defining loader. Application servers, OSGi, build tools and test frameworks rely on this. Many frameworks now define classes through `MethodHandles.Lookup.defineClass` or as [[hidden-class|hidden classes]] (JEP 371) instead of writing a loader.',
    purpose: 'Isolation, dynamic loading and code generation without restarting the JVM.',
    internals: [
      '`loadClass` (delegation policy), `findClass` (where bytes come from), `defineClass` (hand bytes to the JVM)',
      'One namespace per loader',
      'Unloading happens per loader: when the loader and all its classes are unreachable',
    ],
    inputs: ['Bytes from anywhere: files, network, generated in memory'],
    outputs: ['Classes defined by this loader'],
    example: {
      title: 'Same bytes, two loaders, two different classes',
      language: 'java',
      code: `public class BytesLoader extends ClassLoader {
    private final byte[] bytes;

    BytesLoader(ClassLoader parent, byte[] bytes) {
        super("bytes-loader", parent);
        this.bytes = bytes;
    }

    @Override
    protected Class<?> findClass(String name) {
        return defineClass(name, bytes, 0, bytes.length);
    }
}

// in main():
byte[] bytes = Files.readAllBytes(Path.of("Person.class"));
ClassLoader parent = ClassLoader.getPlatformClassLoader();
Class<?> a = new BytesLoader(parent, bytes).loadClass("Person");
Class<?> b = new BytesLoader(parent, bytes).loadClass("Person");
System.out.println(a.getName() + " == " + b.getName() + " ? " + (a == b));`,
      output: 'Person == Person ? false',
      verifiedWith: V,
    },
    practice:
      "Leaked loaders are a classic cause of `OutOfMemoryError: Metaspace` in long-running servers: one stray reference (a thread-local, a static cache in a shared library, a running thread) keeps a whole web application's classes alive after redeploy.",
    misconceptions: [
      {
        myth: 'Two classes with the same fully qualified name are the same class.',
        truth:
          'Only if the same loader defined them. Otherwise casting between them throws `ClassCastException`, even though the names match.',
      },
    ],
    references: [
      { source: 'jvms-5.3.2' },
      { source: 'api-classloader' },
      { source: 'jep-371' },
      { source: 'jls-12.7' },
    ],
  },
  {
    id: 'loading',
    name: 'Loading',
    label: 'Loading',
    caption: 'find bytes · define class',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary: "Finds a class's binary representation and creates the run-time class from it.",
    beginner:
      "Loading means finding the class file's bytes and building an internal description of the class from them: its name, parent class, fields and methods.",
    technical:
      "JVMS §5.3: creating class C means constructing an implementation-specific internal representation in the method area. Deriving C from a class file (§5.3.5) checks the format (`ClassFormatError`) and version (`UnsupportedClassVersionError`), loads the superclass and superinterfaces (recursively), and records the defining loader. Array classes are created by the JVM itself, not loaded (§5.3.3).\n\nIn HotSpot, `ClassFileParser` builds an `InstanceKlass` (with `Method`s, `ConstMethod`s holding bytecode, and a `ConstantPool`) in Metaspace, allocates the `java.lang.Class` mirror in the heap, and registers the class in its loader's dictionary.",
    purpose: 'Turn bytes into a run-time class the rest of the JVM can refer to.',
    internals: [
      'Locate bytes (loader-specific) or map them from the CDS / AOT cache',
      'Parse and check the class file structure',
      'Load superclass and superinterfaces first',
      'Create metadata (HotSpot: `InstanceKlass`) and the `Class` mirror',
    ],
    inputs: ['Class file bytes and the requesting (initiating) loader'],
    outputs: [
      'A loaded class, not yet linked',
      'Errors: `ClassFormatError`, `NoClassDefFoundError`, `LinkageError`',
    ],
    practice:
      'Triggered by resolution (for example executing `new Person` for the first time), by reflection (`Class.forName`), by loading a subclass, and by the launcher for the main class. `-Xlog:class+load` prints the source of every loaded class.',
    misconceptions: [
      {
        myth: 'A class is loaded when an `import` statement mentions it.',
        truth:
          '`import` is purely a compile-time naming convenience; it produces nothing in the class file. Loading happens when the running code needs the class.',
      },
    ],
    specVsImpl: {
      spec: 'An implementation-specific internal representation is created in the method area.',
      implementation:
        'HotSpot: `InstanceKlass` and related metadata in Metaspace, a `java.lang.Class` mirror in the Java heap.',
    },
    references: [
      { source: 'jvms-5.3' },
      { source: 'jvms-5.3.5' },
      { source: 'src-classfileparser' },
      { source: 'src-instanceklass' },
    ],
  },
  {
    id: 'linking',
    name: 'Linking',
    label: 'Linking',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Prepares a loaded class for execution: verification, preparation and (lazy) resolution.',
    beginner:
      'Linking gets a loaded class ready to run. The JVM checks that its bytecode is safe, reserves space for its static fields, and connects names in the code to the real classes, fields and methods.',
    technical:
      'JVMS §5.4: linking a class involves [[verification]] and [[preparation]] of the class, its direct superclass and superinterfaces, and [[resolution]] of symbolic references. The specification lets an implementation resolve eagerly or lazily, provided errors are thrown at the point in the program where the reference is used. HotSpot links a class before it is initialized and resolves references lazily, the first time each instruction executes. Since JDK 24 classes can be loaded and linked ahead of time into an AOT cache (JEP 483).',
    purpose: 'Establish that the class is safe and complete before any of its code runs.',
    internals: ['Verification', 'Preparation', 'Resolution (may happen much later, per reference)'],
    inputs: ['A loaded class'],
    outputs: ['A linked class, ready for initialization'],
    practice:
      'A `VerifyError` points to broken bytecode (often a buggy bytecode-generation library). `NoSuchMethodError` and `IncompatibleClassChangeError` are resolution failures: code compiled against one version of a library runs against another.',
    misconceptions: [
      {
        myth: 'All references in a class are resolved when the class is linked.',
        truth:
          'HotSpot resolves each symbolic reference the first time an instruction uses it. Code paths that never run never resolve their references.',
      },
    ],
    references: [{ source: 'jvms-5.4' }, { source: 'jep-483' }],
  },
  {
    id: 'verification',
    name: 'Verification',
    label: 'Verification',
    caption: 'type-check bytecode',
    parent: 'linking',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Proves the bytecode is type-safe and structurally sound before it may run.',
    beginner:
      "The JVM does not blindly trust class files: they might be corrupt or crafted to attack it. Verification checks every method's instructions to make sure they use values of the right types and cannot break the JVM.",
    technical:
      'JVMS §4.10 and §5.4.1. For class files of version 50 and above, the type-checking verifier uses the `StackMapTable` attribute: at each branch target the compiler records the types in locals and on the operand stack, so the verifier can check each method in a single linear pass. It proves, for example, that the operand stack never overflows `max_stack` or underflows, that every instruction receives operands of correct types, that objects are initialized (`<init>` called) before use, that branches stay inside the method, and that `final` fields and access rules are respected. Failure throws `VerifyError`.',
    purpose:
      'Let the interpreter and JIT skip run-time type checks safely, and stop malformed or hostile bytecode.',
    internals: [
      'Structural checks of the class file',
      'Type checking per method with stack map frames',
      'Checks of uninitialized `new` objects and `<init>` calls',
    ],
    inputs: ['Bytecode, `StackMapTable`, constant pool'],
    outputs: ['A verified class, or `VerifyError`'],
    practice:
      'HotSpot verifies classes not defined by the bootstrap loader. Disabling verification (`-Xverify:none`) has been deprecated since JDK 13 and should never be used in production.',
    misconceptions: [
      {
        myth: 'Since `javac` produced the class file, verification is redundant.',
        truth:
          'The JVM cannot know who produced the bytes: they may come from another compiler, a bytecode library, or an attacker. Verification is what makes bytecode safe to run without checks on every instruction.',
      },
    ],
    references: [{ source: 'jvms-4.10' }, { source: 'jvms-5.4.1' }, { source: 'src-verifier' }],
  },
  {
    id: 'preparation',
    name: 'Preparation',
    label: 'Preparation',
    caption: 'statics = default values',
    parent: 'linking',
    provenance: 'spec',
    scope: 'shared',
    summary:
      'Creates static fields and sets them to default values (0, null, false); runs no Java code.',
    beginner:
      "The JVM reserves room for the class's static variables and fills them with default values: `0`, `false` or `null`. Your initial values (like `= 42`) are not assigned yet; that happens during initialization.",
    technical:
      "JVMS §5.4.2: preparation creates the static fields of a class or interface and initializes them to their default values. It executes no JVM code; explicit initializers run during [[initialization]]. Even `static final` fields with a `ConstantValue` attribute are assigned as part of initialization, immediately before `<clinit>` (JVMS §4.7.2), although `javac` usually inlines compile-time constants into the code that uses them. In HotSpot, static fields live inside the class's `java.lang.Class` mirror object in the Java heap.",
    purpose: 'Give every static field a well-defined value before any code can observe it.',
    internals: [
      'Allocate storage for static fields',
      'Set default values',
      'Impose loading constraints for overridden methods',
    ],
    inputs: ['A verified class'],
    outputs: ['Static fields holding default values'],
    example: {
      title: 'Preparation sets 0; initialization sets 42',
      language: 'java',
      code: `public class Prep {
    static int limit = 42;   // 0 after preparation, 42 after initialization

    static {
        System.out.println("initializing Prep, limit = " + limit);
    }
}

// javap -c -p Prep.class (static initializer):
//   0: bipush        42
//   2: putstatic     #13   // Field limit:I`,
      verifiedWith: V,
    },
    practice:
      'Default values explain some initialization-order puzzles: code that reads a static field during a circular initialization can see `0` or `null` before the initializer has run.',
    misconceptions: [
      {
        myth: 'Preparation assigns the values written in the source.',
        truth:
          'It assigns only defaults. Source-level initializers are compiled into `<clinit>` and run during initialization.',
      },
    ],
    references: [{ source: 'jvms-5.4.2' }, { source: 'jvms-5.5' }],
  },
  {
    id: 'resolution',
    name: 'Resolution',
    label: 'Resolution',
    caption: 'symbolic → direct references',
    parent: 'linking',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Replaces symbolic references (names) in the constant pool with direct references.',
    beginner:
      'Bytecode refers to other classes, fields and methods by name, like an address book entry. Resolution looks up each name the first time it is used and remembers where it points, so later uses are fast.',
    technical:
      'JVMS §5.4.3: resolution determines concrete values from symbolic references in the [[runtime-constant-pool|run-time constant pool]]: classes (§5.4.3.1), fields, methods, interface methods, method types and handles, dynamically-computed constants and call sites. It triggers loading of referenced classes, applies access control (§5.4.4) and method selection. A successful result is cached; a failed resolution throws the same error on every later attempt.\n\nHotSpot resolves lazily at first execution and caches the outcome in the `ConstantPool` (resolved classes) and the constant pool cache (`ResolvedFieldEntry`, `ResolvedMethodEntry`, `ResolvedIndyEntry`). `invokedynamic` call sites are linked by running their bootstrap method once.',
    purpose: 'Bind names to actual run-time entities, late enough to allow separate compilation.',
    internals: [
      'Class resolution (may load the class)',
      'Field and method resolution: search the class hierarchy, check access',
      'Call-site linkage for `invokedynamic`',
      'Caching of the result per constant pool entry',
    ],
    inputs: ['Symbolic references, e.g. `#11 = Methodref Person."<init>":(Ljava/lang/String;)V`'],
    outputs: [
      'Direct references: class pointers, field offsets, method entry points or vtable indexes',
      'Errors: `NoSuchFieldError`, `NoSuchMethodError`, `IllegalAccessError`, `IncompatibleClassChangeError`',
    ],
    example: {
      title: "Symbolic references in Main's constant pool",
      language: 'text',
      code: `   #7 = Class              #8             // Person
  #11 = Methodref          #7.#12         // Person."<init>":(Ljava/lang/String;)V
  #20 = Methodref          #7.#21         // Person.getName:()Ljava/lang/String;`,
      verifiedWith: V,
    },
    practice:
      '`NoSuchMethodError` at run time almost always means a dependency version mismatch: the code was compiled against a method that the library on the class path does not have.',
    misconceptions: [
      {
        myth: 'Method calls look the method up by name on every call.',
        truth:
          'Lookup by name happens once, at resolution. Afterwards the call uses the cached result (and the JIT may inline the target entirely).',
      },
    ],
    references: [
      { source: 'jvms-5.4.3' },
      { source: 'jvms-5.1' },
      { source: 'src-linkresolver' },
      { source: 'src-cpcache' },
    ],
  },
  {
    id: 'initialization',
    name: 'Initialization',
    label: 'Initialization',
    caption: 'run <clinit>',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Runs the class initialization method <clinit>: static initializers in textual order.',
    beginner:
      "Initialization runs a class's static setup code: static blocks and static field initializers, top to bottom. It happens once per class, the first time the class is really used.",
    technical:
      'JVMS §5.5 and JLS §12.4. A class is initialized on: `new`, `getstatic`/`putstatic`/`invokestatic` of a member it declares (constant variables excepted), certain reflective calls, initialization of a subclass (the superclass first), and designation as the initial (main) class. The JVM runs the [[clinit|`<clinit>`]] method under a per-class initialization lock; other threads wait until it finishes. If `<clinit>` throws, the class enters an erroneous state: the first failure surfaces as `ExceptionInInitializerError`, later uses as `NoClassDefFoundError: Could not initialize class …`.',
    purpose: 'Run static setup exactly once, at a precisely defined moment, safely across threads.',
    internals: [
      'Trigger check (JLS §12.4.1)',
      'Initialization lock and state (in progress, done, erroneous)',
      'Superclass initialization, then `ConstantValue` statics, then `<clinit>`',
    ],
    inputs: ['A linked class and a triggering action'],
    outputs: ['An initialized class, or `ExceptionInInitializerError`'],
    example: {
      title: 'Watch initialization order',
      language: 'shell',
      code: '$ java -Xlog:class+init=info -cp . Prep',
      output: `[0.020s][info][class,init] 0 Initializing 'java/lang/Object'(no method) (0x0000000091171f50) by thread "Unknown thread"
[0.020s][info][class,init] 1 Initializing 'java/lang/CharSequence'(no method) (0x0000000091176bc0) by thread "Unknown thread"
[0.020s][info][class,init] 2 Initializing 'java/lang/String' (0x0000000091176398) by thread "Unknown thread"
...`,
      verifiedWith: V,
    },
    practice:
      'The thread-safe lazy holder idiom relies on these rules: a nested holder class is initialized only when first accessed, and the JVM guarantees one initialization. Circular static initialization between classes, especially across threads, can deadlock.',
    misconceptions: [
      {
        myth: 'Static initializers run when the class is loaded.',
        truth: 'They run at initialization, which can be much later than loading, or never.',
      },
      {
        myth: '`<clinit>` runs once per thread.',
        truth:
          'Once per class per class loader, for the life of that class. Other threads block until it completes.',
      },
    ],
    references: [{ source: 'jvms-5.5' }, { source: 'jls-12.4.1' }, { source: 'jvms-2.9' }],
  },
  {
    id: 'unloading',
    name: 'Unloading',
    label: 'Unloading',
    caption: 'when the loader is unreachable',
    parent: 'class-loader-subsystem',
    provenance: 'spec',
    scope: 'shared',
    summary: 'Classes may be unloaded only when their defining loader can be reclaimed by the GC.',
    beginner:
      'Classes can be removed from memory, but only all together with the loader that loaded them, and only once nothing in the program can reach that loader any more.',
    technical:
      "JLS §12.7: an implementation may unload a class if and only if its defining class loader may be reclaimed by the garbage collector; classes defined by the bootstrap loader are never unloaded. HotSpot unloads during garbage collection (`ClassUnloading` is on by default, and with G1 also at the end of concurrent marking). The unit of unloading is the loader's `ClassLoaderData`: all its classes and their Metaspace go together.",
    purpose:
      'Reclaim metadata in long-running JVMs that load code dynamically (application servers, scripting, generated classes).',
    internals: [
      'Reachability of the defining loader, every `Class` object and every instance',
      'GC-driven unloading of `ClassLoaderData`',
      'Release of Metaspace and code-cache entries of unloaded classes',
    ],
    inputs: ['A GC cycle that finds a loader unreachable'],
    outputs: ['Freed Metaspace', 'Removed compiled code for those classes'],
    practice:
      'If redeploying an application makes Metaspace grow each time, some object still references the old loader. A heap dump (`jcmd <pid> GC.heap_dump`) and the path to GC roots of the old loader will show the culprit. `-Xlog:class+unload` confirms unloading happens.',
    misconceptions: [
      {
        myth: 'A class is unloaded once no instances of it exist.',
        truth: 'Its defining loader, and every class that loader defined, must be unreachable too.',
      },
    ],
    accuracyNote:
      'Unloading is permitted, not required. The JVM Specification does not describe it; the Java Language Specification constrains when it may happen.',
    references: [{ source: 'jls-12.7' }, { source: 'src-classloaderdata' }],
  },
];
