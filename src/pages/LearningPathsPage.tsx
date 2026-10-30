import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { PageHeader } from '@/components/layout/PageHeader';
import { InlineRichText } from '@/components/learning/RichText';
import { Badge } from '@/components/ui/Badge';
import { COMPONENT_LIST } from '@/content/jvm';
import { ANATOMY_QUIZ } from '@/content/jvm/quiz';
import { LEARNING_PATHS } from '@/content/paths';
import { useProgress } from '@/hooks/useLearningState';
import { usePageTitle } from '@/hooks/usePageTitle';

export function LearningPathsPage() {
  usePageTitle('Learning Paths');
  const progress = useProgress();
  const location = useLocation();
  const explored = Object.keys(progress.explored).length;
  const quiz = progress.quizzes[ANATOMY_QUIZ.id];

  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, [location.hash]);

  const available = LEARNING_PATHS.filter((p) => p.route);
  const upcoming = LEARNING_PATHS.filter((p) => !p.route);

  return (
    <>
      <PageHeader kicker="Curriculum" title="Learning paths">
        <p>
          A structured route from "what is a class file?" to JIT internals. Paths are released one
          milestone at a time, and only finished ones are linked. Your progress is stored in this
          browser only.
        </p>
      </PageHeader>
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
        <h2 className="kicker">Available now</h2>
        {available.map((path) => (
          <article
            key={path.id}
            id={path.id}
            className="mt-4 scroll-mt-20 rounded-xl border border-exec-500/40 bg-ink-900/70 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-mono text-[12px] text-fg-subtle">
                  Path {path.code} · {path.milestone}
                </p>
                <h3 className="mt-1 font-serif text-[28px] text-fg">{path.title}</h3>
                <p className="mt-2 text-[15.5px] text-fg-muted">
                  <InlineRichText text={path.summary} />
                </p>
              </div>
              <Link
                to={path.route!}
                className="inline-flex items-center gap-2 rounded-md border border-exec-400 bg-exec-500 px-4 py-2 text-[14px] font-medium text-ink-950 hover:bg-exec-400"
              >
                {explored ? 'Continue' : 'Start'} <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div>
                <p className="kicker">Topics</p>
                <ul className="mt-2 space-y-1.5 text-[14.5px] text-fg-muted">
                  {path.topics.map((topic) => (
                    <li key={topic} className="flex gap-2">
                      <span aria-hidden className="text-exec-400">
                        ·
                      </span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="kicker">Your progress</p>
                <div className="mt-2 space-y-3 text-[14px]">
                  <div>
                    <div className="flex justify-between text-fg-muted">
                      <span>Components explored</span>
                      <span className="tabular">
                        {explored} / {COMPONENT_LIST.length}
                      </span>
                    </div>
                    <div
                      className="mt-1 h-1.5 rounded-full bg-ink-700"
                      role="progressbar"
                      aria-label="Components explored"
                      aria-valuemin={0}
                      aria-valuemax={COMPONENT_LIST.length}
                      aria-valuenow={explored}
                    >
                      <div
                        className="h-full rounded-full bg-exec-400"
                        style={{ width: `${(explored / COMPONENT_LIST.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-fg-muted">
                    <span>Marked as understood</span>
                    <span className="tabular">{Object.keys(progress.understood).length}</span>
                  </div>
                  <div className="flex justify-between text-fg-muted">
                    <span>Knowledge check</span>
                    <span className="tabular">
                      {quiz ? `${quiz.correct} / ${quiz.total} correct` : 'not started'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {path.labs.map((lab) => (
                      <Badge key={lab} tone="exec">
                        {lab}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        <h2 className="kicker mt-14">In development</h2>
        <p className="mt-2 max-w-2xl text-[14.5px] text-fg-muted">
          These paths are planned and scheduled by milestone (see the project plan on GitHub). They
          are listed so you can see where the curriculum is going; they are not linked until they
          work.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcoming.map((path) => (
            <article
              key={path.id}
              id={path.id}
              className="scroll-mt-20 rounded-xl border border-ink-600 bg-ink-900/40 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[12px] text-fg-subtle">Path {path.code}</p>
                  <h3 className="mt-1 font-serif text-[22px] text-fg">{path.title}</h3>
                </div>
                <Badge>In development · {path.milestone}</Badge>
              </div>
              <p className="mt-2 text-[14.5px] text-fg-muted">
                <InlineRichText text={path.summary} />
              </p>
              <ul className="mt-3 space-y-1 text-[13.5px] text-fg-subtle">
                {path.topics.map((topic) => (
                  <li key={topic}>· {topic}</li>
                ))}
              </ul>
              {path.labs.length > 0 && (
                <p className="mt-3 text-[13px] text-fg-subtle">
                  Planned: <span className="text-fg-muted">{path.labs.join(' · ')}</span>
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
