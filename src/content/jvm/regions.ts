import type { ComponentId } from './ids';

/**
 * The six main parts of the machine, in plain words. One source of truth for
 * the explorer's overview, the first lesson's JVM chapter and the guided tour,
 * so a learner meets the same names everywhere. Each region is a real
 * component of the anatomy plate.
 */
export interface JvmRegion {
  id: ComponentId;
  /** Plain-language title shown on the overview. */
  title: string;
  /** One line under the title. */
  blurb: string;
  /** One sentence for "what does this part do?". */
  role: string;
  /** Colour family on the anatomy plate: runtime (purple), execution (blue) or platform. */
  family: 'rt' | 'exec' | 'plat';
}

export const JVM_REGIONS: JvmRegion[] = [
  {
    id: 'class-loader-subsystem',
    title: 'Class loading',
    blurb: 'Finds and prepares Java classes.',
    role: 'The class loader finds class files and turns them into classes the JVM can use.',
    family: 'rt',
  },
  {
    id: 'runtime-data-areas',
    title: 'Memory',
    blurb: 'Stores objects and runtime data.',
    role: 'Runtime memory holds what a running program needs: objects, method calls in progress and class information.',
    family: 'rt',
  },
  {
    id: 'execution-engine',
    title: 'Execution engine',
    blurb: 'Runs bytecode.',
    role: 'The execution engine runs bytecode instructions, and compiles busy code into machine code.',
    family: 'exec',
  },
  {
    id: 'garbage-collector',
    title: 'Garbage collection',
    blurb: 'Reclaims memory that is no longer reachable.',
    role: 'The garbage collector finds objects the program can no longer reach and reclaims their memory.',
    family: 'rt',
  },
  {
    id: 'native-interface',
    title: 'Native interface',
    blurb: 'Connects Java to native code.',
    role: 'The native interface lets Java call code written for the operating system, such as C libraries, and lets that code call back.',
    family: 'rt',
  },
  {
    id: 'platform',
    title: 'Platform',
    blurb: 'The operating system and CPU.',
    role: 'The operating system and processor that the JVM itself runs on.',
    family: 'plat',
  },
];

export const REGION_IDS = JVM_REGIONS.map((region) => region.id);

export const regionOf = (id: ComponentId): JvmRegion | undefined =>
  JVM_REGIONS.find((region) => region.id === id);
