import type { DemoId } from '@/types/content';
import { ClassLoadingExhibit } from './ClassLoadingExhibit';
import { CompileExhibit } from './CompileExhibit';
import { ExecutionExhibit } from './ExecutionExhibit';
import { JvmPartsExhibit } from './JvmPartsExhibit';
import { MemoryExhibit } from './MemoryExhibit';
import { ProgramExhibit } from './ProgramExhibit';
import { ReachabilityExhibit } from './ReachabilityExhibit';

/**
 * The interactive models of the first lesson. The same components appear in
 * the inspector under "See it working", so a learner meets one model of each
 * mechanism wherever they are.
 */
export function Exhibit({ id }: { id: DemoId | 'program' }) {
  switch (id) {
    case 'program':
      return <ProgramExhibit />;
    case 'compile':
      return <CompileExhibit />;
    case 'jvm-parts':
      return <JvmPartsExhibit />;
    case 'class-loading':
      return <ClassLoadingExhibit />;
    case 'memory':
      return <MemoryExhibit />;
    case 'execution':
      return <ExecutionExhibit />;
    case 'reachability':
      return <ReachabilityExhibit />;
  }
}
