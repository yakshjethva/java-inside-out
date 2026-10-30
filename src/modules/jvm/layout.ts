import type { ComponentId } from '@/content/jvm/ids';
import type { Anchor, Point, Rect } from '@/lib/geometry';

/**
 * Anatomy-mode geometry for the JVM plate, in diagram units.
 * Content (what a component is) lives in src/content/jvm; this file only
 * decides where things are drawn and how connectors are routed.
 */
export const DIAGRAM_SIZE = { w: 1600, h: 1100 } as const;

export const NODE_RECTS: Record<ComponentId, Rect> = {
  // Build time
  'build-time': { x: 20, y: 16, w: 384, h: 104 },
  'source-file': { x: 36, y: 50, w: 108, h: 54 },
  javac: { x: 156, y: 50, w: 96, h: 54 },
  'class-file': { x: 264, y: 50, w: 124, h: 54 },

  // Process
  'java-process': { x: 20, y: 136, w: 1560, h: 868 },
  launcher: { x: 44, y: 940, w: 348, h: 52 },
  'native-libraries': { x: 1176, y: 940, w: 380, h: 52 },
  jvm: { x: 32, y: 166, w: 1536, h: 760 },

  // 01 Class loader subsystem
  'class-loader-subsystem': { x: 44, y: 200, w: 348, h: 714 },
  'parent-delegation': { x: 56, y: 262, w: 20, h: 256 },
  'bootstrap-loader': { x: 88, y: 262, w: 292, h: 52 },
  'platform-loader': { x: 88, y: 330, w: 292, h: 52 },
  'application-loader': { x: 88, y: 398, w: 292, h: 52 },
  'custom-loaders': { x: 88, y: 466, w: 292, h: 52 },
  loading: { x: 58, y: 556, w: 322, h: 44 },
  linking: { x: 58, y: 616, w: 322, h: 156 },
  verification: { x: 74, y: 648, w: 290, h: 30 },
  preparation: { x: 74, y: 688, w: 290, h: 30 },
  resolution: { x: 74, y: 728, w: 290, h: 30 },
  initialization: { x: 58, y: 790, w: 322, h: 44 },
  unloading: { x: 58, y: 852, w: 322, h: 44 },

  // 02 Runtime data areas
  'runtime-data-areas': { x: 432, y: 200, w: 700, h: 444 },
  'java-thread': { x: 448, y: 240, w: 668, h: 196 },
  'native-method-stack': { x: 462, y: 286, w: 104, h: 126 },
  'pc-register': { x: 580, y: 286, w: 100, h: 126 },
  'jvm-stack': { x: 694, y: 286, w: 408, h: 126 },
  'stack-frame': { x: 708, y: 312, w: 380, h: 90 },
  'local-variables': { x: 720, y: 340, w: 118, h: 54 },
  'operand-stack': { x: 846, y: 340, w: 118, h: 54 },
  'frame-data': { x: 972, y: 340, w: 104, h: 54 },
  'method-area': { x: 448, y: 460, w: 324, h: 172 },
  'runtime-constant-pool': { x: 464, y: 508, w: 292, h: 108 },
  heap: { x: 788, y: 460, w: 328, h: 172 },
  'young-generation': { x: 804, y: 494, w: 188, h: 122 },
  eden: { x: 816, y: 524, w: 102, h: 80 },
  survivor: { x: 926, y: 524, w: 54, h: 80 },
  'old-generation': { x: 1004, y: 494, w: 100, h: 122 },

  // 03 Execution engine
  'execution-engine': { x: 1176, y: 200, w: 380, h: 520 },
  interpreter: { x: 1192, y: 236, w: 348, h: 64 },
  profiler: { x: 1192, y: 316, w: 348, h: 46 },
  'jit-compiler': { x: 1192, y: 378, w: 348, h: 164 },
  compilation: { x: 1206, y: 410, w: 158, h: 56 },
  optimization: { x: 1368, y: 410, w: 158, h: 56 },
  c1: { x: 1206, y: 474, w: 158, h: 56 },
  c2: { x: 1368, y: 474, w: 158, h: 56 },
  'code-cache': { x: 1192, y: 558, w: 348, h: 64 },
  deoptimization: { x: 1192, y: 638, w: 348, h: 64 },

  // 04 Garbage collector
  'garbage-collector': { x: 432, y: 668, w: 700, h: 246 },
  'gc-roots': { x: 448, y: 706, w: 156, h: 62 },
  marking: { x: 620, y: 706, w: 156, h: 62 },
  sweeping: { x: 792, y: 706, w: 156, h: 62 },
  compaction: { x: 964, y: 706, w: 152, h: 62 },
  collectors: { x: 448, y: 786, w: 668, h: 112 },
  g1: { x: 460, y: 822, w: 99, h: 62 },
  zgc: { x: 569, y: 822, w: 99, h: 62 },
  shenandoah: { x: 678, y: 822, w: 99, h: 62 },
  'parallel-gc': { x: 787, y: 822, w: 99, h: 62 },
  'serial-gc': { x: 896, y: 822, w: 99, h: 62 },
  'epsilon-gc': { x: 1005, y: 822, w: 99, h: 62 },

  // 05 Native interface
  'native-interface': { x: 1176, y: 736, w: 380, h: 178 },
  jni: { x: 1192, y: 778, w: 348, h: 74 },

  // Platform
  platform: { x: 20, y: 1020, w: 1560, h: 72 },
  'os-threads': { x: 36, y: 1046, w: 370, h: 36 },
  'virtual-memory': { x: 422, y: 1046, w: 370, h: 36 },
  'system-calls': { x: 808, y: 1046, w: 370, h: 36 },
  cpu: { x: 1194, y: 1046, w: 370, h: 36 },
};

/** Drawing style for nodes that are not plain boxes. */
export type NodeShape = 'box' | 'rail' | 'phase' | 'chip' | 'memory';

export const NODE_SHAPES: Partial<Record<ComponentId, NodeShape>> = {
  'parent-delegation': 'rail',
  loading: 'phase',
  verification: 'phase',
  preparation: 'phase',
  resolution: 'phase',
  initialization: 'phase',
  unloading: 'phase',
  'gc-roots': 'phase',
  marking: 'phase',
  sweeping: 'phase',
  compaction: 'phase',
  g1: 'chip',
  zgc: 'chip',
  shenandoah: 'chip',
  'parallel-gc': 'chip',
  'serial-gc': 'chip',
  'epsilon-gc': 'chip',
  heap: 'memory',
  'method-area': 'memory',
  'jvm-stack': 'memory',
  'native-method-stack': 'memory',
  'pc-register': 'memory',
};

/** Subsystem plate numbers drawn in container headers. */
export const PLATE_NUMBERS: Partial<Record<ComponentId, string>> = {
  'class-loader-subsystem': '01',
  'runtime-data-areas': '02',
  'execution-engine': '03',
  'garbage-collector': '04',
  'native-interface': '05',
};

export interface EdgeRoute {
  from: Anchor;
  to: Anchor;
  /** Corner points in diagram units (anatomy mode only). */
  via?: Point[];
}

/**
 * Hand-routed connectors. Lanes run through the gutters between subsystems:
 * x 400–424 (left gutter), y 652/660 (between runtime data areas and GC),
 * x 1168 (right gutter) and x 1550/1572 (right edge).
 */
export const EDGE_ROUTES: Record<string, EdgeRoute> = {
  'source-to-javac': { from: { side: 'right' }, to: { side: 'left' } },
  'javac-to-class-file': { from: { side: 'right' }, to: { side: 'left' } },
  'class-file-to-loading': {
    from: { side: 'right' },
    to: { side: 'right', at: 0.36 },
    via: [
      { x: 400, y: 77 },
      { x: 400, y: 572 },
    ],
  },
  'launcher-creates-jvm': { from: { side: 'top', at: 0.511 }, to: { side: 'bottom', at: 0.1237 } },

  'custom-delegates-app': { from: { side: 'top' }, to: { side: 'bottom' } },
  'app-delegates-platform': { from: { side: 'top' }, to: { side: 'bottom' } },
  'platform-delegates-boot': { from: { side: 'top' }, to: { side: 'bottom' } },
  'delegation-selects-loader': { from: { side: 'bottom' }, to: { side: 'top', at: 0.0248 } },
  'loading-then-linking': { from: { side: 'bottom' }, to: { side: 'top' } },
  'verification-then-preparation': { from: { side: 'bottom' }, to: { side: 'top' } },
  'preparation-then-resolution': { from: { side: 'bottom' }, to: { side: 'top' } },
  'linking-then-initialization': { from: { side: 'bottom' }, to: { side: 'top' } },
  'loading-creates-metadata': {
    from: { side: 'right', at: 0.773 },
    to: { side: 'left', at: 0.494 },
    via: [
      { x: 416, y: 590 },
      { x: 416, y: 545 },
    ],
  },
  'resolution-updates-rcp': {
    from: { side: 'right', at: 0.533 },
    to: { side: 'left', at: 0.852 },
    via: [
      { x: 416, y: 744 },
      { x: 416, y: 600 },
    ],
  },
  'initialization-runs-on-engine': {
    from: { side: 'right', at: 0.5 },
    to: { side: 'left', at: 0.8692 },
    via: [
      { x: 408, y: 812 },
      { x: 408, y: 652 },
    ],
  },
  'gc-triggers-unloading': { from: { side: 'left', at: 0.833 }, to: { side: 'right', at: 0.5 } },

  'method-area-mirror-in-heap': {
    from: { side: 'right', at: 0.581 },
    to: { side: 'left', at: 0.581 },
  },

  'interpreter-uses-stack': {
    from: { side: 'left', at: 0.906 },
    to: { side: 'right', at: 0.0635 },
  },
  'interpreter-advances-pc': {
    from: { side: 'left', at: 0.1875 },
    to: { side: 'top', at: 0.5 },
    via: [{ x: 630, y: 248 }],
  },
  'engine-reads-bytecode': {
    from: { side: 'left', at: 0.4769 },
    to: { side: 'top', at: 0.7778 },
    via: [{ x: 700, y: 448 }],
  },
  'engine-uses-heap': { from: { side: 'left', at: 0.6635 }, to: { side: 'right', at: 0.4942 } },
  'interpreter-feeds-profiler': { from: { side: 'bottom' }, to: { side: 'top' } },
  'profiler-triggers-jit': { from: { side: 'bottom' }, to: { side: 'top' } },
  'jit-installs-code': { from: { side: 'bottom' }, to: { side: 'top' } },
  'code-cache-deopt': { from: { side: 'bottom' }, to: { side: 'top' } },
  'deopt-resumes-interpreter': {
    from: { side: 'right', at: 0.5 },
    to: { side: 'right', at: 0.5 },
    via: [
      { x: 1550, y: 670 },
      { x: 1550, y: 268 },
    ],
  },
  'code-runs-on-cpu': {
    from: { side: 'right', at: 0.656 },
    to: { side: 'top', at: 0.5 },
    via: [
      { x: 1572, y: 600 },
      { x: 1572, y: 1034 },
      { x: 1379, y: 1034 },
    ],
  },
  'engine-calls-jni': { from: { side: 'bottom', at: 0.5 }, to: { side: 'top', at: 0.5 } },

  'gc-reclaims-heap': { from: { side: 'top', at: 0.743 }, to: { side: 'bottom', at: 0.5 } },
  'stack-refs-are-roots': {
    from: { side: 'bottom', at: 0.211 },
    to: { side: 'top', at: 0.782 },
    via: [
      { x: 780, y: 697 },
      { x: 570, y: 697 },
    ],
  },
  'statics-are-roots': { from: { side: 'bottom', at: 0.13 }, to: { side: 'top', at: 0.269 } },
  'roots-seed-marking': { from: { side: 'right' }, to: { side: 'left' } },
  'marking-then-sweeping': { from: { side: 'right' }, to: { side: 'left' } },
  'sweeping-then-compaction': { from: { side: 'right' }, to: { side: 'left' } },

  'jni-uses-native-stack': {
    from: { side: 'left', at: 0.5 },
    to: { side: 'left', at: 0.5 },
    via: [
      { x: 1168, y: 815 },
      { x: 1168, y: 660 },
      { x: 424, y: 660 },
      { x: 424, y: 349 },
    ],
  },
  'jni-calls-libraries': { from: { side: 'bottom', at: 0.885 }, to: { side: 'top', at: 0.8526 } },
  'libraries-make-syscalls': {
    from: { side: 'bottom', at: 0.2 },
    to: { side: 'top', at: 0.5 },
    via: [
      { x: 1252, y: 1012 },
      { x: 993, y: 1012 },
    ],
  },
  'process-threads-os': { from: { side: 'bottom', at: 0.2179 }, to: { side: 'top', at: 0.8757 } },
  'process-memory-os': { from: { side: 'bottom', at: 0.376 }, to: { side: 'top', at: 0.5 } },
};

/** Annotations drawn on the plate that are not components (captions). */
export const PLATE_CAPTIONS: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'end' | 'middle';
  vertical?: boolean;
}[] = [
  { x: 440, y: 296, text: 'PER THREAD', vertical: true },
  { x: 440, y: 500, text: 'SHARED', vertical: true },
  { x: 88, y: 252, text: 'CLASS LOADERS' },
  { x: 86, y: 546, text: 'CLASS LIFECYCLE' },
  { x: 1192, y: 878, text: 'Newer alternative (JDK 22+): Foreign Function & Memory API' },
  {
    x: 784,
    y: 972,
    text: 'one address space: Java heap · Metaspace · code cache · thread stacks · native libraries',
    anchor: 'middle',
  },
];
