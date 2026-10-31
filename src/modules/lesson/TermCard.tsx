import { BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { RichText } from '@/components/learning/RichText';
import type { LessonTerm } from '@/types/lesson';

/** The technical term a chapter introduces, with a link to its full glossary entry. */
export function TermCard({ term }: { term: LessonTerm }) {
  return (
    <aside
      aria-label={`New term: ${term.term}`}
      className="flex gap-3 rounded-xl border border-rt-500/35 bg-rt-900/15 p-4"
    >
      <BookOpen size={18} aria-hidden className="mt-1 shrink-0 text-rt-300" />
      <div>
        <p className="text-[13px] text-rt-300">New term</p>
        <p className="mt-0.5 font-serif text-[22px] leading-tight text-fg">{term.term}</p>
        <RichText className="prose-ij reading mt-1" text={term.definition} />
        <Link
          to={`/glossary#${term.glossaryId}`}
          className="mt-1.5 inline-block text-[13.5px] text-exec-300 underline underline-offset-2 hover:text-exec-200"
        >
          Read the full glossary entry
        </Link>
      </div>
    </aside>
  );
}
