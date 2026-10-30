/**
 * Every component of the JVM anatomy. Adding an id here makes TypeScript
 * require a content entry (components.ts) and a position (modules/jvm/layout.ts).
 */
export const COMPONENT_IDS = [
  // Build time (outside the JVM)
  'build-time',
  'source-file',
  'javac',
  'class-file',

  // The OS process that hosts the JVM
  'java-process',
  'launcher',
  'native-libraries',
  'jvm',

  // 01 · Class loader subsystem
  'class-loader-subsystem',
  'parent-delegation',
  'bootstrap-loader',
  'platform-loader',
  'application-loader',
  'custom-loaders',
  'loading',
  'linking',
  'verification',
  'preparation',
  'resolution',
  'initialization',
  'unloading',

  // 02 · Runtime data areas
  'runtime-data-areas',
  'java-thread',
  'pc-register',
  'native-method-stack',
  'jvm-stack',
  'stack-frame',
  'local-variables',
  'operand-stack',
  'frame-data',
  'method-area',
  'runtime-constant-pool',
  'heap',
  'young-generation',
  'eden',
  'survivor',
  'old-generation',

  // 03 · Execution engine
  'execution-engine',
  'interpreter',
  'profiler',
  'jit-compiler',
  'compilation',
  'optimization',
  'c1',
  'c2',
  'code-cache',
  'deoptimization',

  // 04 · Garbage collector
  'garbage-collector',
  'gc-roots',
  'marking',
  'sweeping',
  'compaction',
  'collectors',
  'g1',
  'zgc',
  'shenandoah',
  'parallel-gc',
  'serial-gc',
  'epsilon-gc',

  // 05 · Native interface
  'native-interface',
  'jni',

  // Platform
  'platform',
  'os-threads',
  'virtual-memory',
  'system-calls',
  'cpu',
] as const;

export type ComponentId = (typeof COMPONENT_IDS)[number];

export const isComponentId = (value: string): value is ComponentId =>
  (COMPONENT_IDS as readonly string[]).includes(value);
