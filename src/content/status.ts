/**
 * What exists in this release and what is planned, shown under About →
 * Project status. Only finished experiences have a route; the others are not
 * linked anywhere (no dead navigation).
 */
export interface ProjectItem {
  name: string;
  what: string;
  milestone: string;
  /** Set only when the experience works in this release. */
  to?: string;
}

export const PROJECT_STATUS: ProjectItem[] = [
  {
    name: 'Start here',
    what: 'A guided first lesson: what happens when you run a Java program',
    milestone: 'Redesign',
    to: '/start',
  },
  {
    name: 'Explore the JVM',
    what: 'The six main parts, then the full map: overview, parts, inside views and walkthroughs',
    milestone: 'M2',
    to: '/anatomy',
  },
  {
    name: 'Class Loader Explorer',
    what: 'Delegation simulator and lifecycle walkthrough',
    milestone: 'M3',
  },
  {
    name: 'Memory Lab',
    what: 'Step through stack and heap, reference by reference, with your own code',
    milestone: 'M4',
  },
  {
    name: 'Bytecode Explorer',
    what: 'Verified javap output with operand stack and locals',
    milestone: 'M5',
  },
  {
    name: 'Garbage Collection Lab',
    what: 'Build object graphs and run simulated collections, collector by collector',
    milestone: 'M6',
  },
  { name: 'Concurrency Lab', what: 'Reorder two threads and watch lost updates', milestone: 'M7' },
  {
    name: 'Collections Explorer',
    what: 'HashMap buckets, collisions, treeification, resizing',
    milestone: 'M7',
  },
];
