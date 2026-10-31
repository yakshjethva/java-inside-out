import type { ComponentId } from '@/content/jvm/ids';
import type { LeveledText } from '@/lib/levels';
import type { Citation, CodeListing, DemoId, QuizQuestion, RichText } from './content';

/** A prediction asked before anything is shown: there is a right answer, revealed afterwards. */
export interface Prediction {
  prompt: RichText;
  options: { id: string; text: RichText; correct: boolean; feedback: RichText }[];
}

/** The technical term a chapter introduces, linked to its glossary entry. */
export interface LessonTerm {
  glossaryId: string;
  term: string;
  definition: RichText;
}

export type ChapterId = 'program' | 'compiler' | 'jvm' | 'loading' | 'memory' | 'execution' | 'gc';

/**
 * One chapter of a lesson, built around the teaching cycle: a question, a
 * prediction, what happens (the exhibit), why (the explanation at the chosen
 * level), the technical term, something to try, and a check.
 */
export interface LessonChapter {
  id: ChapterId;
  title: string;
  /** The question the chapter answers, in the learner's words. */
  question: string;
  /** What the learner should take away, in one sentence (used in the recap). */
  takeaway: string;
  minutes: number;
  /** Show the exhibit before the prediction (when the prediction is about it). */
  exhibitFirst?: boolean;
  prediction: Prediction;
  exhibit: DemoId | 'program';
  /** The component this chapter is about, opened on the JVM map. */
  component: ComponentId;
  explanation: LeveledText;
  term: LessonTerm;
  tryIt: RichText;
  check: QuizQuestion;
  /** Verified listings shown in the deep-dive section. */
  listings?: CodeListing[];
  accuracyNote: RichText;
  references: Citation[];
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  chapters: LessonChapter[];
}
