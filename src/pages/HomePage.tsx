import { ArrowRight, BookmarkCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router';
import { CodeBlock } from '@/components/code/CodeBlock';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { COMPONENT_LIST } from '@/content/jvm';
import { SCENARIOS } from '@/content/jvm/scenarios';
import { LEARNING_PATHS } from '@/content/paths';
import { useProgress } from '@/hooks/useLearningState';
import { usePageTitle } from '@/hooks/usePageTitle';
import { AnatomyPreview } from '@/modules/jvm/AnatomyPreview';

const PERSON_SCENARIO = SCENARIOS.find((s) => s.id === 'new-person')!;

const STOPS = [
  { step: 0, title: 'Resolve and load Person', where: 'Class loader subsystem' },
  { step: 1, title: 'Allocate 16 bytes in eden', where: 'Heap · TLAB' },
  { step: 3, title: 'Push "Alex" from the constant pool', where: 'Operand stack' },
  { step: 4, title: 'Push a frame for the constructor', where: 'JVM stack' },
  { step: 6, title: 'Store the reference in p1', where: 'Local variables' },
  { step: 9, title: 'Drop both references: eligible for GC', where: 'GC roots' },
];

const LABS = [
  {
    name: 'JVM Anatomy',
    what: 'Explore every subsystem; anatomy, exploded, internal and execution views',
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
    what: 'Step through stack and heap, reference by reference',
    milestone: 'M4',
  },
  {
    name: 'Bytecode Explorer',
    what: 'Verified javap output with operand stack and locals',
    milestone: 'M5',
  },
  {
    name: 'Garbage Collection Lab',
    what: 'Build object graphs and run a simulated collection',
    milestone: 'M6',
  },
  { name: 'Concurrency Lab', what: 'Reorder two threads and watch lost updates', milestone: 'M7' },
  {
    name: 'Collections Explorer',
    what: 'HashMap buckets, collisions, treeification, resizing',
    milestone: 'M7',
  },
];

export function HomePage() {
  usePageTitle();
  const progress = useProgress();
  const explored = Object.keys(progress.explored).length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-700">
        <div className="blueprint absolute inset-0 opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-[1680px] gap-8 px-4 pt-10 pb-8 sm:px-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:pt-14">
          <div className="flex flex-col justify-center">
            <p className="kicker">An open-source atlas of the JVM · Java SE 25</p>
            <h1 className="mt-3 font-serif text-[52px] leading-[0.95] tracking-tight text-fg sm:text-[68px]">
              <span className="block text-[13px] font-sans font-semibold tracking-[0.42em] text-rt-300 uppercase sm:text-[14px]">
                Inside Java
              </span>
              <span className="mt-3 block">Understand Java from the inside out.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-fg-muted">
              Explore the machinery behind every line of Java code. Every part of the plate on this
              page is a real component of the JVM: select one.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/anatomy" variant="primary">
                Explore JVM Anatomy <ArrowRight size={16} aria-hidden />
              </ButtonLink>
              <ButtonLink to="/paths" variant="secondary">
                Start Learning
              </ButtonLink>
            </div>
            <p className="mt-4 text-[13px] text-fg-subtle">
              Memory Lab: in development (milestone M4).{' '}
              <Link
                to="/paths#memory"
                className="text-exec-300 underline underline-offset-2 hover:text-exec-200"
              >
                See what it will cover
              </Link>
              .
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-ink-600 pt-5">
              <div>
                <dt className="kicker">Components</dt>
                <dd className="mt-1 font-serif text-3xl text-fg tabular">
                  {COMPONENT_LIST.length}
                </dd>
              </div>
              <div>
                <dt className="kicker">Dissections</dt>
                <dd className="mt-1 font-serif text-3xl text-fg tabular">12</dd>
              </div>
              <div>
                <dt className="kicker">Walkthroughs</dt>
                <dd className="mt-1 font-serif text-3xl text-fg tabular">{SCENARIOS.length}</dd>
              </div>
            </dl>
          </div>
          <div className="h-[460px] overflow-hidden rounded-xl border border-ink-600 bg-ink-950/80 shadow-[0_40px_120px_-40px_rgb(79_155_245/0.25)] sm:h-[560px] lg:h-[640px]">
            <AnatomyPreview />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
        <section
          aria-labelledby="one-line"
          className="grid gap-8 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          <div>
            <p className="kicker">Follow one line through the machine</p>
            <h2 id="one-line" className="mt-2 font-serif text-[34px] leading-tight text-fg">
              What really happens when Java runs{' '}
              <code className="font-mono text-[0.8em] text-exec-200">new Person("Alex")</code>?
            </h2>
            <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-fg-muted">
              One statement touches the class loader, the run-time constant pool, the heap, the
              operand stack, a new stack frame and, eventually, the garbage collector. Each stop
              below opens the execution walkthrough at that instruction, with the real bytecode from
              JDK 25.
            </p>
            <CodeBlock
              className="mt-5"
              code={PERSON_SCENARIO.listings[0]!.code}
              language="java"
              title="Main.java"
              verifiedWith="OpenJDK 25.0.4"
            />
          </div>
          <ol className="relative space-y-2.5 lg:pt-10">
            {STOPS.map((stop, index) => (
              <li key={stop.step}>
                <Link
                  to={`/anatomy?mode=execution&s=new-person${stop.step ? `&step=${stop.step}` : ''}`}
                  className="group flex items-center gap-4 rounded-lg border border-ink-600 bg-ink-900/70 px-4 py-3 transition-colors hover:border-exec-500/60 hover:bg-ink-850"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-exec-500/50 font-mono text-[13px] text-exec-200">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-fg">{stop.title}</span>
                    <span className="block text-[12.5px] text-fg-subtle">{stop.where}</span>
                  </span>
                  <ArrowRight
                    size={16}
                    aria-hidden
                    className="text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-exec-300"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="your-progress" className="border-t border-ink-700 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Pick up where you left off</p>
              <h2 id="your-progress" className="mt-2 font-serif text-[30px] text-fg">
                {progress.recent.length ? 'Recently explored' : 'Good places to start'}
              </h2>
            </div>
            {explored > 0 && (
              <p className="text-[13.5px] text-fg-subtle">
                {explored} of {COMPONENT_LIST.length} components explored · stored only in this
                browser
              </p>
            )}
          </div>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {(progress.recent.length
              ? progress.recent.slice(0, 8).map((item) => ({
                  key: item.key,
                  title: item.title,
                  href: item.href,
                  hint: 'Explored',
                  icon: <Clock3 size={14} aria-hidden />,
                }))
              : [
                  {
                    key: 'heap',
                    title: 'Heap',
                    href: '/anatomy?c=heap',
                    hint: 'Where objects live',
                    icon: null,
                  },
                  {
                    key: 'stack-frame',
                    title: 'Stack frame',
                    href: '/anatomy?c=stack-frame&mode=internal',
                    hint: 'Spec vs HotSpot, side by side',
                    icon: null,
                  },
                  {
                    key: 'parent-delegation',
                    title: 'Parent delegation',
                    href: '/anatomy?c=parent-delegation',
                    hint: 'Who loads your classes',
                    icon: null,
                  },
                  {
                    key: 'jit',
                    title: 'A hot method becomes machine code',
                    href: '/anatomy?mode=execution&s=jit',
                    hint: 'Execution walkthrough',
                    icon: null,
                  },
                ]
            ).map((item) => (
              <li key={item.key}>
                <Link
                  to={item.href}
                  className="block rounded-lg border border-ink-600 bg-ink-900/60 px-4 py-3 hover:border-rt-500/60 hover:bg-ink-850"
                >
                  <span className="flex items-center gap-1.5 text-[12px] text-fg-subtle">
                    {item.icon}
                    {item.hint}
                  </span>
                  <span className="mt-1 block text-[15px] text-fg">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          {progress.bookmarks.length > 0 && (
            <div className="mt-6">
              <p className="flex items-center gap-1.5 text-[13px] text-fg-subtle">
                <BookmarkCheck size={14} aria-hidden /> Bookmarks
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {progress.bookmarks.map((bookmark) => (
                  <li key={bookmark.key}>
                    <Link
                      to={bookmark.href}
                      className="rounded border border-exec-500/40 bg-exec-900/40 px-2.5 py-1 text-[13px] text-exec-200 hover:border-exec-400"
                    >
                      {bookmark.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section aria-labelledby="labs" className="border-t border-ink-700 py-14">
          <p className="kicker">Laboratories</p>
          <h2 id="labs" className="mt-2 font-serif text-[30px] text-fg">
            Interactive, not illustrated
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] text-fg-muted">
            Each laboratory is built and verified one milestone at a time. Only finished ones are
            linked.
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-ink-600">
            <table className="w-full text-left text-[14px]">
              <caption className="sr-only">Laboratories and their status</caption>
              <thead className="bg-ink-850 text-[12px] text-fg-subtle">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Laboratory
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                    What you do
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700">
                {LABS.map((lab) => (
                  <tr key={lab.name} className="bg-ink-900/40">
                    <th scope="row" className="px-4 py-3 font-medium text-fg">
                      {lab.to ? (
                        <Link
                          to={lab.to}
                          className="text-exec-200 underline decoration-exec-500/40 underline-offset-2 hover:decoration-exec-300"
                        >
                          {lab.name}
                        </Link>
                      ) : (
                        lab.name
                      )}
                    </th>
                    <td className="hidden px-4 py-3 text-fg-muted sm:table-cell">{lab.what}</td>
                    <td className="px-4 py-3">
                      {lab.to ? (
                        <Badge tone="ok">Available</Badge>
                      ) : (
                        <Badge>In development · {lab.milestone}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="paths-overview" className="border-t border-ink-700 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Curriculum</p>
              <h2 id="paths-overview" className="mt-2 font-serif text-[30px] text-fg">
                {LEARNING_PATHS.length} learning paths, from first principles to JIT internals
              </h2>
            </div>
            <Link
              to="/paths"
              className="inline-flex items-center gap-1.5 text-[14px] text-exec-300 hover:text-exec-200"
            >
              All learning paths <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
          <ul className="mt-5 grid gap-x-8 gap-y-2 text-[14.5px] sm:grid-cols-2 lg:grid-cols-3">
            {LEARNING_PATHS.map((path) => (
              <li
                key={path.id}
                className="flex items-baseline gap-2 border-b border-ink-700/70 py-2"
              >
                <span className="w-7 shrink-0 font-mono text-[12px] text-fg-subtle">
                  {path.code}
                </span>
                <span className="flex-1 text-fg-muted">{path.title}</span>
                <span className="font-mono text-[11px] text-fg-subtle">
                  {path.route ? 'now' : path.milestone}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="accuracy" className="border-t border-ink-700 py-14">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <p className="kicker">Accuracy policy</p>
              <h2 id="accuracy" className="mt-2 font-serif text-[30px] leading-tight text-fg">
                Specification, implementation, simplification: always labelled.
              </h2>
            </div>
            <ul className="space-y-3 text-[15px] text-fg-muted">
              <li>
                <span className="text-fg">Solid outlines</span> are concepts defined by the Java SE
                25 JVM Specification. <span className="text-fg">Dashed</span> ones are OpenJDK
                HotSpot JDK 25 structures that other JVMs may not have.
              </li>
              <li>
                Every bytecode listing, flag default and log line was produced with OpenJDK 25.0.4,
                not written from memory.
              </li>
              <li>
                Every diagram and walkthrough states what it simplifies. Simulations are labelled as
                educational models.
              </li>
              <li>
                Every component cites primary sources: the specifications, JEPs and the OpenJDK
                source at tag <code className="font-mono text-[0.9em] text-fg">jdk-25-ga</code>.{' '}
                <Link to="/references" className="text-exec-300 underline underline-offset-2">
                  See the references
                </Link>
                .
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
