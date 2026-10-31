import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { lazy, Suspense, useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ButtonLink } from '@/components/ui/Button';
import { COMPONENT_LIST } from '@/content/jvm';
import { SCENARIOS } from '@/content/jvm/scenarios';
import { FIRST_RUN } from '@/content/lesson/firstRun';
import { REFERENCE_IDS } from '@/data/references';
import { useProgress } from '@/hooks/useLearningState';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/cn';
import { JourneyMachine } from '@/modules/journey/JourneyMachine';
import { DISSECTIONS } from '@/modules/jvm/internals/registry';

// The full plate is for people who already know Java; it loads after the page.
const AnatomyPreview = lazy(() =>
  import('@/modules/jvm/AnatomyPreview').then((m) => ({ default: m.AnatomyPreview })),
);

const CHAPTERS = FIRST_RUN.chapters;

/**
 * Mounts its children only when the placeholder comes near the viewport, so a
 * visitor who never scrolls that far does not download or render them.
 * Without IntersectionObserver the children mount at once.
 */
function WhenNearViewport({
  children,
  fallback,
  className,
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
}) {
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');
  const ref = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || near) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setNear(true);
            observer.disconnect();
          }
        },
        { rootMargin: '400px 0px' },
      );
      observer.observe(element);
      return () => observer.disconnect();
    },
    [near],
  );
  return (
    <div ref={ref} className={className}>
      {near ? children : fallback}
    </div>
  );
}

const MAP_FALLBACK = (
  <div className="flex h-full items-center justify-center text-[14px] text-fg-subtle">
    Loading the map…
  </div>
);
const LESSON_MINUTES = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0);

const DISCOVER: {
  question: string;
  chapter: string;
  glyph: 'compile' | 'memory' | 'run' | 'gc';
}[] = [
  {
    question: 'What does a compiler do, and what is bytecode?',
    chapter: 'compiler',
    glyph: 'compile',
  },
  { question: 'Where do your objects and variables live?', chapter: 'memory', glyph: 'memory' },
  {
    question: 'How does Java run your code, and why does it get faster?',
    chapter: 'execution',
    glyph: 'run',
  },
  { question: 'What happens to memory your program stops using?', chapter: 'gc', glyph: 'gc' },
];

/** Small drawings in the plate's own visual language, one per question. */
function Glyph({ kind }: { kind: (typeof DISCOVER)[number]['glyph'] }) {
  const common = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const };
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" aria-hidden className="shrink-0">
      {kind === 'compile' && (
        <>
          <rect
            x="4"
            y="10"
            width="15"
            height="20"
            rx="2"
            stroke="var(--color-plat-400)"
            {...common}
          />
          <path d="M22 20 h6" stroke="var(--color-exec-400)" {...common} />
          <path d="M26 17 l3 3 -3 3" stroke="var(--color-exec-400)" {...common} />
          <rect
            x="31"
            y="10"
            width="13"
            height="20"
            rx="2"
            stroke="var(--color-rt-400)"
            {...common}
          />
          <path d="M34 16 h7 M34 20 h5 M34 24 h7" stroke="var(--color-rt-300)" {...common} />
        </>
      )}
      {kind === 'memory' && (
        <>
          <rect
            x="4"
            y="8"
            width="16"
            height="10"
            rx="2"
            stroke="var(--color-exec-400)"
            {...common}
          />
          <rect
            x="4"
            y="22"
            width="16"
            height="10"
            rx="2"
            stroke="var(--color-exec-400)"
            {...common}
          />
          <circle cx="16" cy="27" r="1.8" fill="var(--color-rt-300)" />
          <path d="M18 27 C 26 27, 26 18, 30 18" stroke="var(--color-rt-300)" {...common} />
          <rect
            x="30"
            y="12"
            width="14"
            height="12"
            rx="3"
            stroke="var(--color-rt-400)"
            {...common}
          />
        </>
      )}
      {kind === 'run' && (
        <>
          <path d="M6 34 h36" stroke="var(--color-ink-400)" {...common} />
          <path d="M8 30 l6 -6 6 3 7 -9 7 -6 7 -4" stroke="var(--color-exec-400)" {...common} />
          <rect
            x="34"
            y="34"
            width="10"
            height="8"
            rx="1.5"
            stroke="var(--color-plat-400)"
            strokeDasharray="2 2"
            {...common}
          />
        </>
      )}
      {kind === 'gc' && (
        <>
          <rect
            x="4"
            y="16"
            width="12"
            height="10"
            rx="2"
            stroke="var(--color-ok-400)"
            {...common}
          />
          <path d="M16 21 h8" stroke="var(--color-rt-300)" {...common} />
          <rect
            x="24"
            y="16"
            width="12"
            height="10"
            rx="2"
            stroke="var(--color-ok-400)"
            {...common}
          />
          <rect
            x="30"
            y="32"
            width="14"
            height="10"
            rx="2"
            stroke="var(--color-warn-400)"
            strokeDasharray="3 2.5"
            {...common}
          />
          <path d="M8 36 l4 4 M12 36 l-4 4" stroke="var(--color-warn-400)" {...common} />
        </>
      )}
    </svg>
  );
}

export function HomePage() {
  usePageTitle();
  const progress = useProgress();
  const done = progress.lessons[FIRST_RUN.id] ?? {};
  const nextChapter = CHAPTERS.find((chapter) => !(chapter.id in done));
  const started = CHAPTERS.some((chapter) => chapter.id in done);
  const finished = !nextChapter;

  return (
    <>
      {/* 1. What is this, who is it for, where do I begin? */}
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="relative mx-auto grid max-w-[1320px] gap-10 px-4 pt-12 pb-14 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-20">
          <div>
            <h1 className="font-serif text-[42px] leading-[1.04] tracking-tight text-balance text-fg sm:text-[60px]">
              Ever wondered what happens when you run Java code?
            </h1>
            <p className="mt-6 max-w-[34rem] text-[18px] leading-relaxed text-fg-muted sm:text-[19px]">
              Follow your Java program on a journey through the JVM. See how code becomes
              instructions, where objects live, and how your computer runs everything.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/start" variant="primary" size="lg">
                Start learning <ArrowRight size={17} aria-hidden />
              </ButtonLink>
              <ButtonLink to="/anatomy" variant="secondary" size="lg">
                I already know Java. Explore the JVM.
              </ButtonLink>
            </div>
            {started && nextChapter && (
              <p className="mt-5 text-[15px] text-fg-muted">
                Welcome back.{' '}
                <Link
                  to={`/start?chapter=${nextChapter.id}`}
                  className="text-exec-300 underline underline-offset-2 hover:text-exec-200"
                >
                  Continue with chapter {CHAPTERS.indexOf(nextChapter) + 1}: {nextChapter.title}
                </Link>
              </p>
            )}
            <p className="mt-8 max-w-[34rem] text-[15px] text-fg-subtle">
              For curious beginners, students and working Java developers. Free, open source, and it
              works offline.
            </p>
          </div>
          <JourneyMachine />
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        {/* 2. What you'll discover */}
        <section aria-labelledby="discover" className="py-16 lg:py-20">
          <h2 id="discover" className="font-serif text-[32px] leading-tight text-fg sm:text-[38px]">
            What you’ll discover
          </h2>
          <ul className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {DISCOVER.map((item) => (
              <li key={item.chapter}>
                <Link
                  to={`/start?chapter=${item.chapter}`}
                  className="group flex items-center gap-4 rounded-xl py-1"
                >
                  <Glyph kind={item.glyph} />
                  <span className="text-[18px] leading-snug text-fg group-hover:text-exec-200">
                    {item.question}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. The beginner path */}
        <section
          aria-labelledby="first-path"
          className="grid gap-10 border-t border-ink-700 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20"
        >
          <div>
            <h2
              id="first-path"
              className="font-serif text-[32px] leading-tight text-fg sm:text-[38px]"
            >
              Start with one question
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-fg-muted">
              <span className="text-fg">{FIRST_RUN.title}</span> Seven short chapters, about{' '}
              {LESSON_MINUTES} minutes, no programming knowledge needed. Each one asks you to
              predict, shows you what really happens, and checks that it made sense.
            </p>
            <ButtonLink
              to={
                finished
                  ? '/start?chapter=recap'
                  : started && nextChapter
                    ? `/start?chapter=${nextChapter.id}`
                    : '/start'
              }
              variant="primary"
              className="mt-6"
            >
              {finished
                ? 'Review what you now know'
                : started && nextChapter
                  ? `Continue with chapter ${CHAPTERS.indexOf(nextChapter) + 1}`
                  : 'Begin the first lesson'}
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
          </div>
          <ol
            className="grid gap-x-8 gap-y-1 sm:grid-cols-2"
            aria-label="Chapters of the first lesson"
          >
            {CHAPTERS.map((chapter, i) => (
              <li key={chapter.id}>
                <Link
                  to={`/start?chapter=${chapter.id}`}
                  className="group flex gap-3.5 rounded-xl px-2 py-3 hover:bg-ink-850"
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[12.5px]',
                      chapter.id in done
                        ? 'border-ok-500/60 text-ok-300'
                        : 'border-ink-500 text-fg-muted',
                    )}
                  >
                    {chapter.id in done ? <Check size={14} aria-label="Completed" /> : i + 1}
                  </span>
                  <span>
                    <span className="block text-[16px] font-medium text-fg group-hover:text-exec-200">
                      {chapter.title}
                    </span>
                    <span className="block text-[14.5px] text-fg-muted">{chapter.question}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. A direct route for experienced developers */}
        <section
          aria-labelledby="experienced"
          className="grid gap-10 border-t border-ink-700 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20"
        >
          <div>
            <h2
              id="experienced"
              className="font-serif text-[32px] leading-tight text-fg sm:text-[38px]"
            >
              Already write Java?
            </h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-fg-muted">
              Go straight to the machinery: {COMPONENT_LIST.length} components on one plate,{' '}
              {Object.keys(DISSECTIONS).length} dissections, {SCENARIOS.length} walkthroughs with
              real <code className="font-mono text-[0.9em] text-fg">javap</code> output, and{' '}
              {REFERENCE_IDS.length} primary sources, from the JVM Specification to the OpenJDK
              source.
            </p>
            <ul className="mt-6 space-y-2.5 text-[16px]">
              {[
                ['/anatomy?view=full', 'Open the full map of the JVM'],
                ['/anatomy?c=heap&mode=internal', 'Look inside the heap'],
                ['/anatomy?mode=execution&s=jit', 'Watch a hot method become machine code'],
                ['/references', 'Read the sources'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to!}
                    className="inline-flex items-center gap-1.5 text-exec-300 underline decoration-exec-500/40 underline-offset-4 hover:text-exec-200 hover:decoration-exec-300"
                  >
                    {label} <ArrowRight size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            {progress.recent.length > 0 && (
              <div className="mt-8">
                <p
                  id="home-recently-explored"
                  className="flex items-center gap-1.5 text-[14px] text-fg-muted"
                >
                  <Clock3 size={14} aria-hidden /> Recently explored
                </p>
                <ul aria-labelledby="home-recently-explored" className="mt-2 flex flex-wrap gap-2">
                  {progress.recent.slice(0, 6).map((item) => (
                    <li key={item.key}>
                      <Link
                        to={item.href}
                        className="inline-block rounded-md border border-ink-600 px-2.5 py-1 text-[14px] text-fg-muted hover:border-exec-400 hover:text-fg"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <WhenNearViewport
            className="surface-instrument h-[340px] overflow-hidden rounded-2xl border border-ink-600 bg-ink-950 sm:h-[460px]"
            fallback={MAP_FALLBACK}
          >
            <Suspense fallback={MAP_FALLBACK}>
              <AnatomyPreview />
            </Suspense>
          </WhenNearViewport>
        </section>

        {/* 5. Accuracy */}
        <section
          aria-labelledby="accuracy"
          className="grid gap-8 border-t border-ink-700 py-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:py-20"
        >
          <h2 id="accuracy" className="font-serif text-[32px] leading-tight text-fg sm:text-[38px]">
            How we keep it accurate
          </h2>
          <div className="max-w-2xl space-y-4 text-[17px] leading-relaxed text-fg-muted">
            <p>
              Simple explanations are short, never false. Every simplified picture says what it
              leaves out, and every analogy says where it stops being true.
            </p>
            <p>
              What the Java specification requires is always kept apart from how OpenJDK’s HotSpot
              JVM happens to do it. Bytecode, logs and numbers come from running a real JDK (OpenJDK
              25.0.4), never from memory.
            </p>
            <p>
              Every claim cites its source.{' '}
              <Link
                to="/about"
                className="text-exec-300 underline underline-offset-2 hover:text-exec-200"
              >
                Read the accuracy policy
              </Link>{' '}
              or{' '}
              <Link
                to="/references"
                className="text-exec-300 underline underline-offset-2 hover:text-exec-200"
              >
                browse the references
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
