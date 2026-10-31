import type { ComponentId } from '@/content/jvm/ids';
import type { ReferenceId } from '@/data/references';

/**
 * Inline rich text used throughout the content layer. Supported syntax
 * (see src/lib/richText.ts):
 *   `code`                 inline code
 *   **strong**             emphasis
 *   [[glossary-id]]        clickable glossary term (label = term name)
 *   [[glossary-id|label]]  clickable glossary term with a custom label
 *   [label](https://...)   external link
 * Blank lines separate paragraphs; lines starting with "- " form a list.
 */
export type RichText = string;

/** Where a structure comes from. Drives the outline style in diagrams. */
export type Provenance = 'spec' | 'hotspot' | 'platform';

export type Scope = 'shared' | 'per-thread' | 'per-class' | 'process' | 'build';

export interface Citation {
  source: ReferenceId;
  /** What the source supports, when it is not obvious from the title. */
  note?: string;
}

export type CodeLanguage = 'java' | 'shell' | 'text' | 'c';

export interface CodeExample {
  title: string;
  language: CodeLanguage;
  code: string;
  output?: string;
  /** Toolchain the example was compiled/run with, e.g. "OpenJDK 25.0.4 · Linux x64". */
  verifiedWith: string;
}

export interface Misconception {
  myth: string;
  truth: RichText;
}

/**
 * An analogy that opens the door to a concept without replacing it: every
 * important part of the picture is mapped to the real thing, and the point
 * where the picture stops being accurate is stated.
 */
export interface Analogy {
  /** The familiar picture, in one or two sentences. */
  picture: RichText;
  /** Each part of the picture and what it stands for. */
  mapping: { picture: string; real: RichText }[];
  /** Where the analogy stops being accurate. */
  limits: RichText;
}

/** Interactive models from the first lesson, reused in the inspector. */
export type DemoId =
  'compile' | 'jvm-parts' | 'class-loading' | 'memory' | 'execution' | 'reachability';

export interface ComponentDoc {
  id: ComponentId;
  /** Full name, e.g. "Run-time constant pool". */
  name: string;
  /** Short label drawn on the diagram. Defaults to `name`. */
  label?: string;
  /** Small monospace caption drawn under the label. */
  caption?: string;
  /** Structural parent (containment). */
  parent?: ComponentId;
  provenance: Provenance;
  scope?: Scope;
  /** One sentence, used for hover labels and lists ("What is this?"). */
  summary: string;
  /** Simple level: plain words, no programming knowledge assumed. */
  simple: RichText;
  /**
   * Developer level: real Java code and APIs, and what a developer observes.
   * Optional while content is written; the deep dive stands in, and says so.
   */
  developer?: RichText;
  /** Deep dive: specification sections, HotSpot implementation, exact terms. */
  deep: RichText;
  /** An analogy for the simple level, mapped to the real concept, with its limits. */
  analogy?: Analogy;
  /** Interactive from the first lesson that shows this component at work. */
  demo?: DemoId;
  /** One question for "Check your understanding". */
  check?: QuizQuestion;
  purpose: RichText;
  /** Internal structure, one item per part. */
  internals: RichText[];
  inputs: string[];
  outputs: string[];
  example?: CodeExample;
  /** Real-world application: tuning flags, diagnostics, failure modes. */
  practice: RichText;
  misconceptions: Misconception[];
  /** Mandatory where the JVM Specification and HotSpot differ. */
  specVsImpl?: { spec: RichText; implementation: RichText };
  /** What the diagram simplifies about this component. */
  accuracyNote?: RichText;
  /** Version the implementation-specific details describe. */
  version?: string;
  /** Exceptional conditions associated with this component. */
  errors?: { name: string; when: RichText }[];
  references: Citation[];
}

export type RelationshipKind =
  'control' | 'data' | 'delegation' | 'lifecycle' | 'exception' | 'native';

export interface Relationship {
  id: string;
  from: ComponentId;
  to: ComponentId;
  kind: RelationshipKind;
  /** Verb phrase drawn on the connector, read as "<from> <label> <to>". */
  label: string;
  description: RichText;
  provenance?: Provenance;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  aliases?: string[];
  simple: RichText;
  developer?: RichText;
  deep: RichText;
  whyItExists: RichText;
  /** Where the concept lives in the JVM anatomy, when it has a place there. */
  componentId?: ComponentId;
  related?: string[];
  misconception?: Misconception;
  references?: Citation[];
}

export type ReferenceKind = 'specification' | 'jep' | 'source' | 'guide' | 'api' | 'tool';

export interface Reference {
  title: string;
  publisher: string;
  url: string;
  version: string;
  kind: ReferenceKind;
  description: string;
}

export interface CodeListing {
  id: string;
  title: string;
  language: CodeLanguage;
  code: string;
  verifiedWith?: string;
}

export type NodeState = 'active' | 'ok' | 'warn';

export interface ScenarioFlow {
  from: ComponentId;
  to: ComponentId;
  label?: string;
  kind?: RelationshipKind;
}

/** State of the current frame after a step, shown inside the frame's parts on the plate. */
export interface FrameSnapshot {
  /** Method of the current frame, e.g. "main(String[])". */
  method: string;
  pc: number;
  locals: string[];
  /** Operand stack, bottom first. */
  stack: string[];
}

export interface ScenarioStep {
  id: string;
  title: string;
  simple: RichText;
  developer?: RichText;
  deep: RichText;
  /** Components that take part in this step. */
  active: ComponentId[];
  /** Animated movement between components. */
  flows?: ScenarioFlow[];
  /** Highlight state per component (defaults to "active"). */
  states?: Partial<Record<ComponentId, NodeState>>;
  /** 1-based line to highlight in a listing of the scenario. */
  focus?: { listing: string; line: number }[];
  /** Current frame after this step (when the step is about one frame). */
  frame?: FrameSnapshot;
  note?: RichText;
}

export interface Scenario {
  id: string;
  title: string;
  summary: string;
  accuracyNote: RichText;
  listings: CodeListing[];
  steps: ScenarioStep[];
  references: Citation[];
}

export type QuestionKind = 'concept' | 'predict-output' | 'memory-state' | 'ordering';

export interface QuizOption {
  id: string;
  text: RichText;
  correct: boolean;
  explanation: RichText;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: RichText;
  code?: CodeListing;
  options: QuizOption[];
  references?: Citation[];
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export type Milestone = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | 'M7' | 'M8';

export interface LearningPath {
  id: string;
  code: string;
  title: string;
  summary: string;
  milestone: Milestone;
  /** Only set when the path has a working page in this release. */
  route?: string;
  topics: string[];
  /** Interactive experiences the path will contain. */
  labs: string[];
}
