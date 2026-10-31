import type { CodeListing, Quiz } from '@/types/content';
import type { Lesson } from '@/types/lesson';

const V = 'OpenJDK 25.0.4 · Linux x64';

export const HELLO_JAVA: CodeListing = {
  id: 'hello-java',
  title: 'Hello.java',
  language: 'java',
  code: `public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}`,
  verifiedWith: V,
};

const HELLO_JAVAP: CodeListing = {
  id: 'hello-javap',
  title: 'javap -c Hello (method main)',
  language: 'text',
  code: `public static void main(java.lang.String[]);
  Code:
     0: getstatic     #7    // Field java/lang/System.out:Ljava/io/PrintStream;
     3: ldc           #13   // String Hello!
     5: invokevirtual #15   // Method java/io/PrintStream.println:(Ljava/lang/String;)V
     8: return`,
  verifiedWith: `${V}; Hello.class is 410 bytes and begins CA FE BA BE 00 00 00 45`,
};

const CLASS_LOAD_LOG: CodeListing = {
  id: 'hello-class-load',
  title: 'java -Xlog:class+load Hello (excerpt)',
  language: 'text',
  code: `[0.051s][info][class,load] Hello source: file:/home/you/hello/
Hello!`,
  verifiedWith: `${V}; directory shortened; 428 classes were loaded in total, 422 of them from the CDS archive`,
};

export const PERSON_JAVA: CodeListing = {
  id: 'person-java',
  title: 'Main.java',
  language: 'java',
  code: `public class Main {
    public static void main(String[] args) {
        Person person = new Person("Mia");
    }
}

class Person {
    private final String name;

    Person(String name) {
        this.name = name;
    }
}`,
  verifiedWith: V,
};

const PERSON_JAVAP: CodeListing = {
  id: 'person-javap',
  title: 'javap -c Main (method main) and javap -c -p Person (constructor)',
  language: 'text',
  code: `Main.main:
   0: new           #7    // class Person
   3: dup
   4: ldc           #9    // String Mia
   6: invokespecial #11   // Method Person."<init>":(Ljava/lang/String;)V
   9: astore_1
  10: return

Person(java.lang.String):
   0: aload_0
   1: invokespecial #1    // Method java/lang/Object."<init>":()V
   4: aload_0
   5: aload_1
   6: putfield      #7    // Field name:Ljava/lang/String;
   9: return`,
  verifiedWith: V,
};

const HOT_JAVA: CodeListing = {
  id: 'lesson-hot-java',
  title: 'Hot.java',
  language: 'java',
  code: `public class Hot {
    static int square(int x) {
        return x * x;
    }

    public static void main(String[] args) {
        long sum = 0;
        for (int i = 0; i < 200_000; i++) {
            sum += square(i);
        }
        System.out.println(sum);
    }
}`,
  verifiedWith: V,
};

const PRINT_COMPILATION: CodeListing = {
  id: 'hot-print-compilation',
  title: 'java -XX:+PrintCompilation -cp . Hot  (lines for Hot::square)',
  language: 'text',
  code: `38   11       3       Hot::square (4 bytes)
38   12       4       Hot::square (4 bytes)
38   11       3       Hot::square (4 bytes)   made not entrant: not used`,
  verifiedWith: `${V}; timings and compile ids vary between runs`,
};

export const FIRST_RUN: Lesson = {
  id: 'first-run',
  title: 'What happens when you run a Java program?',
  summary:
    'Follow one small program from the text you type to the processor that runs it: the compiler, the class file, the JVM, memory, execution and garbage collection.',
  chapters: [
    {
      id: 'program',
      title: 'Your first Java program',
      question: 'What is a Java program, before anything runs?',
      takeaway: 'Source code is text written by people, and it is translated before it runs.',
      minutes: 2,
      exhibitFirst: true,
      exhibit: 'program',
      component: 'source-file',
      prediction: {
        prompt: 'You have written this program and saved it. **What do you think happens next?**',
        options: [
          {
            id: 'direct',
            text: 'The computer reads the text and runs it as it is.',
            correct: false,
            feedback:
              'Close, but there is a step in between. The text is first translated by a program called a compiler.',
          },
          {
            id: 'translate',
            text: 'A program translates it into instructions that a Java machine can run.',
            correct: true,
            feedback:
              'Yes. The compiler, `javac`, translates it into a class file, and the Java Virtual Machine runs that.',
          },
          {
            id: 'internet',
            text: 'It is sent to a server on the internet, which runs it.',
            correct: false,
            feedback:
              'No. A Java program runs on your own computer; nothing needs to be sent anywhere.',
          },
        ],
      },
      explanation: {
        simple:
          'This is [[source-code|source code]]: instructions written by a person, in the Java language. People can read it, but the processor inside your computer cannot run these words directly.\n\nSo before a Java program runs, its source code is translated. The next chapters follow that translation, and then the machine that runs the result.',
        developer:
          '`Hello.java` declares one class, `Hello`, with a `public static void main(String[] args)` method: the entry point the `java` launcher looks for. Running it takes two commands:\n\n- `javac Hello.java` compiles the source into `Hello.class`.\n- `java Hello` starts a JVM, which loads `Hello` and calls `main`.\n\nSince JDK 11 you can also type `java Hello.java`. The launcher still compiles the source first, in memory, and then runs the compiled class.',
        deep: 'JLS §12.1: the Java Virtual Machine starts execution by invoking the method `main` of a specified class, passing it a single argument, an array of strings. Source-file mode ([JEP 330](https://openjdk.org/jeps/330), extended to several files by [JEP 458](https://openjdk.org/jeps/458) in JDK 22) compiles the program in memory with the same compiler before running it: no JVM executes Java source text. JDK 25 also accepts compact source files and instance `main` methods (JEP 512); this lesson uses the classic form, which every Java version understands.',
      },
      term: {
        glossaryId: 'source-code',
        term: 'Source code',
        definition: 'Instructions written by people in a programming language, such as Java.',
      },
      tryIt: 'Select each highlighted part of the program to see what it does.',
      check: {
        id: 'program-check',
        kind: 'concept',
        prompt: 'Which of these is Java source code?',
        options: [
          {
            id: 'java',
            text: 'The file `Hello.java`, written by a person',
            correct: true,
            explanation: 'Right: source code is the text a person writes, saved in a `.java` file.',
          },
          {
            id: 'class',
            text: 'The file `Hello.class`',
            correct: false,
            explanation:
              '`Hello.class` is what the compiler produces from the source code. You will open it in the next chapter.',
          },
          {
            id: 'output',
            text: 'The text `Hello!` printed on the screen',
            correct: false,
            explanation:
              'That is the output: the result of running the program, not the program itself.',
          },
        ],
      },
      listings: [HELLO_JAVA],
      accuracyNote:
        'This is a complete program; it compiles with javac 25.0.4 and prints `Hello!`. The labels on its parts are simplified descriptions of Java syntax.',
      references: [
        { source: 'jls-12.1' },
        { source: 'jep-330' },
        { source: 'jep-458' },
        { source: 'jep-512' },
      ],
    },
    {
      id: 'compiler',
      title: 'The compiler',
      question: 'How does Hello.java become something the JVM can run?',
      takeaway:
        'The compiler, javac, turns source code into a class file full of bytecode: instructions for the JVM.',
      minutes: 3,
      exhibit: 'compile',
      component: 'javac',
      prediction: {
        prompt: 'The compiler reads `Hello.java`. **What do you think it produces?**',
        options: [
          {
            id: 'classfile',
            text: 'A new file containing instructions for the Java Virtual Machine.',
            correct: true,
            feedback: 'Yes: `Hello.class`, a class file. Its instructions are called bytecode.',
          },
          {
            id: 'exe',
            text: 'A program for your exact processor, like a .exe file.',
            correct: false,
            feedback:
              'Some languages work that way. `javac` does not: it writes bytecode for the JVM, and the same class file runs on any computer whose JVM is recent enough for it (Java 25 or newer for this file).',
          },
          {
            id: 'nothing',
            text: 'Nothing: it only checks the code for mistakes.',
            correct: false,
            feedback:
              'It does check for mistakes, and stops if it finds any. When there are none, it writes a class file.',
          },
        ],
      },
      explanation: {
        simple:
          'The **compiler** is a program called [[javac]]. It reads your source code, checks it for mistakes, and writes a new file: `Hello.class`.\n\nA [[class-file|class file]] is not text you write. It holds [[bytecode|bytecode]]: a compact list of instructions meant for the Java Virtual Machine, not for your processor. That is why the same class file can run on Windows, macOS or Linux, on any computer with a recent enough JVM (Java 25 or newer for this file).',
        developer:
          '`javac Hello.java` writes `Hello.class`: 410 bytes for this program with javac 25.0.4. `javap -c Hello` disassembles it, and `main` turns out to be four instructions: `getstatic` loads `System.out`, `ldc` pushes the string constant, `invokevirtual` calls `println`, and `return` ends the method.\n\nCompile errors, such as a missing semicolon or an unknown name, stop here, before any JVM is involved.',
        deep: "JVMS §4.1: a class file begins with the magic number `0xCAFEBABE`, then the minor and major version (`0` and `69` for Java SE 25), then the [[constant-pool|constant pool]] (28 entries here), access flags, this class and its superclass, fields, methods and attributes. Each method's `Code` attribute holds its bytecode. `ldc #13` refers to constant-pool entry 13, a `CONSTANT_String` whose text lives in a `CONSTANT_Utf8` entry in modified UTF-8 (JVMS §4.4). That is why this class file is 404 bytes plus the length of the message.",
      },
      term: {
        glossaryId: 'bytecode',
        term: 'Bytecode',
        definition: 'Instructions stored in a class file for the JVM to execute.',
      },
      tryIt:
        'Compile the program and open the class file. Then change the message and compile again: only the text constant and the file size change; the instructions stay the same.',
      check: {
        id: 'compiler-check',
        kind: 'concept',
        prompt: 'What does a class file contain?',
        options: [
          {
            id: 'bytecode',
            text: 'Bytecode instructions and constants for the JVM',
            correct: true,
            explanation:
              'Right. The JVM reads these instructions; your processor never sees them directly.',
          },
          {
            id: 'machine',
            text: 'Machine code for your processor',
            correct: false,
            explanation:
              'Not yet. Machine code is produced later, by the JVM, while the program runs (chapter 6).',
          },
          {
            id: 'source',
            text: 'A copy of the source code',
            correct: false,
            explanation:
              'No. It holds instructions and constants. At most it keeps optional debugging details, such as the source file name and line numbers.',
          },
        ],
      },
      listings: [HELLO_JAVAP],
      accuracyNote:
        'Real data: the size, the first bytes and the bytecode come from compiling Hello.java with javac 25.0.4. Changing the message changes one constant; the indices `#7`, `#13` and `#15` stay the same.',
      references: [
        { source: 'jvms-4.1' },
        { source: 'jvms-4.4' },
        { source: 'tool-javac' },
        { source: 'tool-javap' },
      ],
    },
    {
      id: 'jvm',
      title: 'The JVM',
      question: 'What is the JVM, and why does Java need one?',
      takeaway:
        'The JVM is a software machine that runs bytecode; its parts load classes, manage memory, run code and clean up.',
      minutes: 2,
      exhibit: 'jvm-parts',
      component: 'jvm',
      prediction: {
        prompt:
          'Java compiles to bytecode for a virtual machine instead of to instructions for your processor. **Why do you think it does that?**',
        options: [
          {
            id: 'portable',
            text: 'So the same class file can run on many kinds of computers.',
            correct: true,
            feedback: 'Yes. Each kind of computer gets its own JVM; the class files stay the same.',
          },
          {
            id: 'cannot',
            text: 'Because processors cannot run programs on their own.',
            correct: false,
            feedback:
              'Processors run programs all the time, as machine code. Bytecode is not machine code, which is why a JVM is needed.',
          },
          {
            id: 'slow',
            text: 'To make programs safer, at the cost of being slow.',
            correct: false,
            feedback:
              'Safety is part of it: the JVM checks class files before running them. But it is not slow by design: it compiles busy code into fast machine code while it runs (chapter 6).',
          },
        ],
      },
      explanation: {
        simple:
          'The [[jvm|Java Virtual Machine]] (JVM) is the software machine that runs Java programs. Think of it as a machine that understands bytecode, the instructions in class files.\n\nYour processor does not understand bytecode, but the JVM is itself an ordinary program for your computer. So the same class file runs anywhere a JVM is installed, and the JVM also looks after memory for your program.',
        developer:
          'The `java` command starts a JVM: `java Hello` launches a JVM process, which loads `Hello` and calls `main`. The JVM in OpenJDK is called HotSpot. Everything your program uses while it runs (its classes, threads, objects and the code being executed) lives inside that one process, and tools such as `jcmd` and JDK Flight Recorder attach to it to show what is going on.',
        deep: 'The JVM Specification defines an abstract machine: the class-file format, the instruction set, the run-time data areas (JVMS §2.5) and how classes are loaded, linked and initialized (chapter 5). It deliberately leaves the implementation open (JVMS §2.13): memory layout, garbage-collection algorithms, and whether bytecode is interpreted or translated to native code. [[hotspot|HotSpot]], the JVM in OpenJDK, is one implementation; the five parts in this picture group its main subsystems.',
      },
      term: {
        glossaryId: 'jvm',
        term: 'Java Virtual Machine (JVM)',
        definition: 'The software machine that runs Java programs by executing bytecode.',
      },
      tryIt: 'Select each part of the JVM to see what it does.',
      check: {
        id: 'jvm-check',
        kind: 'concept',
        prompt: 'Which part of the JVM runs bytecode instructions?',
        options: [
          {
            id: 'engine',
            text: 'The execution engine',
            correct: true,
            explanation: 'Right: it interprets bytecode, and compiles busy code into machine code.',
          },
          {
            id: 'loader',
            text: 'The class loader',
            correct: false,
            explanation:
              'The class loader finds class files and prepares classes. It does not run their code.',
          },
          {
            id: 'gc',
            text: 'The garbage collector',
            correct: false,
            explanation: 'The garbage collector reclaims memory. It does not run your code.',
          },
        ],
      },
      accuracyNote:
        "A simplified picture of HotSpot's main subsystems. The specification defines the behaviour of these parts, not their arrangement; the full map in the explorer shows all 66 components.",
      references: [{ source: 'jvms-2.5' }, { source: 'jvms-2.13' }, { source: 'tool-java' }],
    },
    {
      id: 'loading',
      title: 'Loading classes',
      question: 'How does the JVM get Hello.class ready to run?',
      takeaway:
        'Before a class runs, it is found, loaded, linked (checked and prepared) and initialized.',
      minutes: 3,
      exhibit: 'class-loading',
      component: 'class-loader-subsystem',
      prediction: {
        prompt: '**Does the JVM check a class file before running any of its code?**',
        options: [
          {
            id: 'first',
            text: 'Yes: it checks the class first, then runs it.',
            correct: true,
            feedback:
              'Yes. Checking (verification) is part of linking, which finishes before the class is initialized and its code runs.',
          },
          {
            id: 'during',
            text: 'No: it only checks each line as it runs it.',
            correct: false,
            feedback:
              'The bytecode is checked as a whole before the class runs. Only some names are looked up later, the first time an instruction uses them.',
          },
          {
            id: 'never',
            text: 'No: the compiler already checked it, so the JVM trusts it.',
            correct: false,
            feedback:
              'The JVM cannot know which tool produced a class file, or whether it was changed afterwards, so it verifies class files itself.',
          },
        ],
      },
      explanation: {
        simple:
          "Before any of your code runs, the JVM has to find your class and get it ready. The [[class-loader|class loader]] finds `Hello.class` and reads it. Then the JVM [[linking|links]] it: it checks that the bytecode is safe and prepares space for the class's data. Finally it [[initialization|initializes]] the class by running its setup code. Only then does `main` start.",
        developer:
          '`java Hello` hands the name `Hello` to the application class loader, which searches the class path (`-cp`; by default, the current directory). If the file is not there, the JVM stops with `Error: Could not find or load main class Hello`, caused by `java.lang.ClassNotFoundException`.\n\nYour other classes are loaded lazily in the same way: `Person` is loaded only when code first needs it, for example at the first `new Person(...)`. Run `java -Xlog:class+load Hello` to see every class as it is loaded: 428 of them for this one-line program, almost all from the JDK.',
        deep: 'JVMS chapter 5. **Loading** (§5.3) finds the class file and creates the class; the application class loader first delegates to its parents (platform, then bootstrap). **Linking** (§5.4) is [[verification|verification]] (§4.10, type checking with the `StackMapTable`), [[preparation|preparation]] (static fields get default values) and [[resolution|resolution]] of symbolic references, which the specification allows to happen lazily: HotSpot resolves each constant-pool entry the first time an instruction uses it. **Initialization** (§5.5) runs the static initializer `<clinit>`, triggered by the first `new`, `getstatic`, `putstatic` or `invokestatic` that refers to the class (reading a compile-time constant does not count: `javac` copies its value into the code); for the main class, by the launcher invoking `main`. HotSpot keeps class metadata in Metaspace, its implementation of the method area.',
      },
      term: {
        glossaryId: 'class-loader',
        term: 'Class loader',
        definition: 'The part of the JVM that finds class files and turns them into classes.',
      },
      tryIt:
        'Step through the stages. Notice the resolution step: a name can wait until an instruction first needs it.',
      check: {
        id: 'loading-check',
        kind: 'ordering',
        prompt: "When does the JVM verify a class's bytecode?",
        options: [
          {
            id: 'linking',
            text: 'During linking, before the class is initialized',
            correct: true,
            explanation:
              'Right: loading, then linking (which includes verification), then initialization.',
          },
          {
            id: 'every',
            text: 'Every time an instruction runs',
            correct: false,
            explanation:
              'That would be very slow. The whole class is verified once, during linking.',
          },
          {
            id: 'never',
            text: 'Never: the compiler already checked it',
            correct: false,
            explanation:
              'Class files can come from any tool, so the JVM verifies them itself before running them.',
          },
        ],
      },
      listings: [CLASS_LOAD_LOG],
      accuracyNote:
        'Simplified: the JVM also loads hundreds of its own classes before yours (428 in our run of Hello, 422 of them from the class data sharing archive), and resolution happens entry by entry while the program runs.',
      references: [
        { source: 'jvms-5.3' },
        { source: 'jvms-5.4' },
        { source: 'jvms-4.10' },
        { source: 'jvms-5.5' },
        { source: 'api-classloader' },
      ],
    },
    {
      id: 'memory',
      title: 'Memory',
      question: 'When your program creates an object, where does it go?',
      takeaway:
        'Objects live in the heap; each method call gets a frame on its thread’s stack; a variable such as person holds a reference to its object, not the object itself.',
      minutes: 4,
      exhibit: 'memory',
      component: 'runtime-data-areas',
      prediction: {
        prompt:
          '`Person person = new Person("Mia");` creates a Person object. **Where do you think the object is stored?**',
        options: [
          {
            id: 'variable',
            text: 'Inside the variable `person`.',
            correct: false,
            feedback:
              'The variable holds a reference: a way for the JVM to find the object. The object itself is stored elsewhere.',
          },
          {
            id: 'heap',
            text: 'In the heap, a shared area of memory for objects.',
            correct: true,
            feedback:
              'Yes. Objects live in the heap; the variable holds a reference to the object.',
          },
          {
            id: 'classfile',
            text: 'In the class file.',
            correct: false,
            feedback:
              'The class file describes the class. Objects are created while the program runs, in memory.',
          },
        ],
      },
      explanation: {
        simple:
          'Two places matter most. Each thread has a [[jvm-stack|stack]] with one [[frame|frame]] for every method that is running; the frame holds that method\'s local variables, such as `person`. The [[heap|heap]] is shared memory where objects live.\n\n`new Person("Mia")` creates the object in the heap. The variable `person` does not contain the object: it holds a [[reference|reference]], a way for the JVM to find the object. Two variables can refer to the same object.',
        developer:
          'Local variables of primitive types (`int`, `double` and so on) hold their values directly in the frame; local variables of reference types hold references. Fields live inside their object in the heap, so “every variable lives on the stack” is not true.\n\nA frame exists only while its method runs. When `main` returns, its frame and local variables are gone, and objects that nothing else refers to become garbage (chapter 7). `Person other = person;` copies the reference, not the object.',
        deep: "JVMS §2.5.2 and §2.5.3 define the per-thread JVM stack and the shared heap; §2.6 defines frames, each with a [[local-variable-array|local variable array]] and an [[operand-stack|operand stack]]. In `main`, `new #7` allocates the object with its fields set to defaults (HotSpot usually allocates in a thread-local buffer in eden), `dup` and `ldc #9` prepare the constructor's arguments, `invokespecial #11` runs `Person.<init>` in a new frame whose `putfield` stores the name, and `astore_1` stores the reference in local variable slot 1. A reference is an opaque value: HotSpot often stores it as a 32-bit [[compressed-oops|compressed oop]] rather than a raw address, and the JIT's [[escape-analysis|escape analysis]] can avoid the heap allocation entirely for objects that never leave a compiled method.",
      },
      term: {
        glossaryId: 'reference',
        term: 'Reference',
        definition: 'A value the JVM uses to find an object. A variable of a class type holds one.',
      },
      tryIt:
        'Step through the bytecode: the instructions in `main` that create the object and store its reference, and two inside the constructor. Select any part of the picture (the frame, a variable, an object) to see what it is.',
      check: {
        id: 'memory-check',
        kind: 'memory-state',
        prompt:
          'After `Person person = new Person("Mia");` runs, what does the variable `person` hold?',
        options: [
          {
            id: 'reference',
            text: 'A reference to the Person object in the heap',
            correct: true,
            explanation: 'Right. The object is in the heap; the variable refers to it.',
          },
          {
            id: 'object',
            text: 'The Person object itself',
            correct: false,
            explanation:
              'Objects are never stored inside local variables; the variable holds a reference.',
          },
          {
            id: 'text',
            text: 'The text "Mia"',
            correct: false,
            explanation:
              '"Mia" is a separate String object. The Person object\'s `name` field refers to it.',
          },
        ],
      },
      listings: [PERSON_JAVA, PERSON_JAVAP],
      accuracyNote:
        'A simplified picture, not a memory map. Real frames also hold a return address and other frame data, objects carry a header, the garbage collector divides the heap into regions, and positions on screen say nothing about real addresses.',
      references: [
        { source: 'jvms-2.5.2' },
        { source: 'jvms-2.5.3' },
        { source: 'jvms-2.6' },
        { source: 'jvms-6.5-new' },
        { source: 'jvms-6.5-invokespecial' },
      ],
    },
    {
      id: 'execution',
      title: 'Execution',
      question: 'How does the JVM actually run the bytecode?',
      takeaway:
        'The interpreter runs bytecode at once; the JIT compiler turns busy code into machine code for the CPU.',
      minutes: 3,
      exhibit: 'execution',
      component: 'execution-engine',
      prediction: {
        prompt:
          '**Does the JVM turn your whole program into machine code before it starts running?**',
        options: [
          {
            id: 'all',
            text: 'Yes, all of it, before running.',
            correct: false,
            feedback:
              'A common belief, but no: HotSpot starts straight away by interpreting bytecode, and compiles only the code that runs often.',
          },
          {
            id: 'hot',
            text: 'No: it starts by interpreting, then compiles busy code while the program runs.',
            correct: true,
            feedback:
              'Yes. Interpreting starts instantly; compiling the busiest code makes it fast.',
          },
          {
            id: 'never',
            text: 'No: it never produces machine code.',
            correct: false,
            feedback: "It does, for the code that runs most: that is the JIT compiler's job.",
          },
        ],
      },
      explanation: {
        simple:
          'Your processor (the CPU) only understands [[machine-code|machine code]]: instructions for its own kind of chip. Bytecode is not machine code, so the JVM bridges the gap in two ways.\n\nFirst, the [[interpreter|interpreter]] reads bytecode instructions one at a time and carries each one out. That starts instantly. Then, when a method runs often, the [[jit-compilation|JIT compiler]] translates it into machine code while the program keeps running, and from then on the CPU runs that machine code directly, much faster.',
        developer:
          'Watch it happen with `java -XX:+PrintCompilation Hot`. A line such as `11  3  Hot::square (4 bytes)` says `square` was compiled at tier 3 (C1, with profiling); `12  4  Hot::square` says tier 4 (C2, fully optimized).\n\nThis is why Java programs warm up: measure performance after code has been running for a while, or use a benchmark harness such as JMH. A short program can finish before anything is compiled.',
        deep: 'HotSpot uses [[tiered-compilation|tiered compilation]]: tier 0 is the template interpreter (itself machine code, generated at start-up, one template per bytecode), tier 3 is C1 with full profiling and tier 4 is C2. Thresholds such as `Tier3InvocationThreshold` (200) and `Tier4InvocationThreshold` (5000) are scaled by compiler-queue load, compilation runs in background threads while the method keeps executing, long loops are compiled by on-stack replacement, and compiled code that relied on an assumption that stops being true is deoptimized back to the interpreter. The specification allows all of this (JVMS §2.13): it defines what bytecode means, not how it is executed.',
      },
      term: {
        glossaryId: 'jit-compilation',
        term: 'JIT compiler',
        definition:
          'The part of the JVM that turns frequently run bytecode into machine code while the program runs.',
      },
      tryIt:
        'Call `square()` until it reaches tier 3 (about 200 calls), then keep going until C2 takes over at tier 4.',
      check: {
        id: 'execution-check',
        kind: 'concept',
        prompt:
          'Why does HotSpot interpret code first instead of compiling everything at start-up?',
        options: [
          {
            id: 'hot',
            text: 'Compiling takes time, and most code runs too rarely to be worth it',
            correct: true,
            explanation:
              'Right. It compiles only hot code, and uses what it observed while interpreting to optimize it.',
          },
          {
            id: 'cpu',
            text: 'Because the CPU cannot run machine code',
            correct: false,
            explanation: 'Machine code is exactly what the CPU runs.',
          },
          {
            id: 'faster',
            text: 'Because interpreted code is faster than compiled code',
            correct: false,
            explanation:
              'Compiled code is much faster once it exists; interpreting simply starts without waiting.',
          },
        ],
      },
      listings: [HOT_JAVA, PRINT_COMPILATION],
      accuracyNote:
        'A teaching model of HotSpot JDK 25: the call counts are the documented thresholds, but real thresholds are scaled by compiler load, compilation happens in the background while calls continue, and a method this small is usually inlined into its caller.',
      references: [
        { source: 'jvms-2.13' },
        { source: 'src-compilation-policy' },
        { source: 'src-template-interpreter' },
      ],
    },
    {
      id: 'gc',
      title: 'Garbage collection',
      question: 'What happens to objects your program no longer uses?',
      takeaway:
        'Objects nothing can reach become eligible for collection; the garbage collector reclaims them later.',
      minutes: 4,
      exhibit: 'reachability',
      component: 'garbage-collector',
      prediction: {
        prompt: 'No variable refers to an object any more. **When is its memory freed?**',
        options: [
          {
            id: 'immediately',
            text: 'Immediately, at that exact moment.',
            correct: false,
            feedback:
              'No. The object becomes eligible for collection, but its memory is freed only when the garbage collector runs and reaches it.',
          },
          {
            id: 'later',
            text: 'Later, when the garbage collector runs and finds it unreachable.',
            correct: true,
            feedback: 'Yes. Becoming unreachable and being reclaimed are two different moments.',
          },
          {
            id: 'never',
            text: 'Never: Java programs keep all their memory.',
            correct: false,
            feedback:
              'The garbage collector reclaims unreachable objects, so the memory is reused.',
          },
        ],
      },
      explanation: {
        simple:
          'Java cleans up memory for you. The [[garbage-collection|garbage collector]] looks for objects your program can no longer reach: no variable leads to them, directly or through other objects.\n\nThree moments matter. An object is **reachable** while some path of references leads to it. When the last path disappears it becomes **unreachable**, and so **eligible** for collection, but it is still in memory. Only when the garbage collector runs is its memory actually **reclaimed**.',
        developer:
          "Setting `person = null` frees nothing immediately, and neither does a method returning: the object becomes unreachable, and a later collection reclaims it. `System.gc()` is only a request. Objects that refer to each other but that nothing else reaches are still garbage, because Java's collectors trace from roots instead of counting references. Watch collections happen with `java -Xlog:gc`.",
        deep: "JLS §12.6: a reachable object is one that can be accessed in any potential continuing computation from any live thread. Collectors start from [[gc-roots|GC roots]] (local variables in active frames, static fields, JNI handles and more) and trace references. HotSpot's default collector, G1, divides the heap into regions and collects the young generation often; an unreachable object is reclaimed when its region is collected, so the timing depends on the collector and the heap, not on your code. Optimizing compilers may also stop treating a variable as a root once it is no longer used, so an object can become unreachable earlier than the source suggests (JLS §12.6.1).",
      },
      term: {
        glossaryId: 'garbage-collection',
        term: 'Garbage collector',
        definition: 'The part of the JVM that finds unreachable objects and reclaims their memory.',
      },
      tryIt:
        'Set `a` to null and run a collection. Then make two objects refer to each other, cut them off from every variable, and collect again.',
      check: {
        id: 'gc-check',
        kind: 'memory-state',
        prompt:
          'Two objects refer to each other, but no variable refers to either of them. What happens to them?',
        options: [
          {
            id: 'both',
            text: 'Both are eligible for collection',
            correct: true,
            explanation:
              'Right. No path from a root reaches them, so references between them do not matter.',
          },
          {
            id: 'forever',
            text: 'They keep each other alive forever',
            correct: false,
            explanation:
              "That is what happens with reference counting. Java's collectors trace from roots, so a cut-off cycle is garbage.",
          },
          {
            id: 'one',
            text: 'Only one of them is collected',
            correct: false,
            explanation: 'Both are unreachable, so both are eligible.',
          },
        ],
      },
      accuracyNote:
        "A teaching model of reachability, the rule all of HotSpot's tracing collectors apply. Real collectors find many more roots, and decide when and which regions to collect; nothing here shows how a specific collector schedules its work.",
      references: [{ source: 'jls-12.6' }, { source: 'guide-gc' }, { source: 'api-java-lang-ref' }],
    },
  ],
};

export const CHAPTER_IDS = FIRST_RUN.chapters.map((chapter) => chapter.id);

/** The five-question check at the end of the lesson. */
export const FIRST_RUN_QUIZ: Quiz = {
  id: 'first-run-recap',
  title: 'What happens when you run a Java program?',
  questions: [
    {
      id: 'javac-output',
      kind: 'concept',
      prompt: 'What does `javac Hello.java` produce?',
      options: [
        {
          id: 'class',
          text: 'A class file containing bytecode',
          correct: true,
          explanation: 'Right: `Hello.class`, with instructions for the JVM.',
        },
        {
          id: 'exe',
          text: 'Machine code for your processor',
          correct: false,
          explanation:
            'Machine code is produced later, by the JVM, for code that runs often. javac writes bytecode.',
        },
        {
          id: 'output',
          text: 'The text the program prints',
          correct: false,
          explanation: 'Nothing is printed until the program runs on a JVM.',
        },
      ],
    },
    {
      id: 'loading-order',
      kind: 'ordering',
      prompt: 'Which order does the JVM follow to get a class ready?',
      options: [
        {
          id: 'right',
          text: 'Load, then link (verify, prepare, resolve), then initialize',
          correct: true,
          explanation:
            'Right. Resolution, the last part of linking, can happen later, when a name is first used.',
        },
        {
          id: 'init-first',
          text: 'Initialize, then load, then verify',
          correct: false,
          explanation: 'A class cannot be initialized before it is loaded and verified.',
        },
        {
          id: 'no-check',
          text: 'Load, then initialize; the compiler already checked the bytecode',
          correct: false,
          explanation:
            'The JVM verifies every class file itself, during linking, before initialization.',
        },
      ],
    },
    {
      id: 'object-home',
      kind: 'memory-state',
      prompt: 'Where does the object created by `new Person("Mia")` live?',
      options: [
        {
          id: 'heap',
          text: 'In the heap',
          correct: true,
          explanation: 'Right. Variables hold references to it.',
        },
        {
          id: 'stack',
          text: 'In the stack frame of the method that created it',
          correct: false,
          explanation:
            'The frame holds the local variable, which holds a reference. The object is in the heap.',
        },
        {
          id: 'method-area',
          text: 'In the method area',
          correct: false,
          explanation: 'The method area holds class information, not objects.',
        },
      ],
    },
    {
      id: 'jit',
      kind: 'concept',
      prompt: 'How does HotSpot get your bytecode running on the CPU?',
      options: [
        {
          id: 'both',
          text: 'It interprets bytecode at first, then compiles frequently run code to machine code',
          correct: true,
          explanation:
            'Right: the interpreter starts at once; the JIT compiler makes hot code fast.',
        },
        {
          id: 'ahead',
          text: 'It compiles the whole program to machine code before running it',
          correct: false,
          explanation:
            'HotSpot compiles while the program runs, and only the code that runs often.',
        },
        {
          id: 'cpu-bytecode',
          text: 'The CPU understands bytecode directly',
          correct: false,
          explanation: 'Processors run machine code; bytecode needs the JVM.',
        },
      ],
    },
    {
      id: 'unreachable',
      kind: 'memory-state',
      prompt: 'The last variable referring to an object is set to null. What is true?',
      options: [
        {
          id: 'eligible',
          text: 'The object is now eligible for collection; its memory is reclaimed when the collector gets to it',
          correct: true,
          explanation: 'Right. Unreachable and reclaimed are two different moments.',
        },
        {
          id: 'freed',
          text: 'Its memory is freed at that exact moment',
          correct: false,
          explanation: 'Nothing is freed until a garbage collection runs.',
        },
        {
          id: 'leak',
          text: 'The object stays in memory forever',
          correct: false,
          explanation: 'The garbage collector reclaims unreachable objects.',
        },
      ],
    },
  ],
};
