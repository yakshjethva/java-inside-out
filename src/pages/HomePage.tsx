import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock3, Layers3, Route } from 'lucide-react';
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
import { RuntimeModel } from '@/modules/jvm/RuntimeModel';
import { DISSECTIONS } from '@/modules/jvm/internals/registry';

const CHAPTERS = FIRST_RUN.chapters;
const LESSON_MINUTES = CHAPTERS.reduce((sum, chapter) => sum + chapter.minutes, 0);

const DISCOVER = [
  { title: 'From source to bytecode', detail: 'See what the compiler emits and how a class file is structured.', to: '/start?chapter=compiler', number: '01' },
  { title: 'Inside runtime memory', detail: 'Separate the heap, thread stacks, frames and class metadata.', to: '/anatomy?c=heap&mode=internal', number: '02' },
  { title: 'How code gets faster', detail: 'Follow interpretation, profiling and just-in-time compilation.', to: '/anatomy?mode=execution&s=jit', number: '03' },
  { title: 'Where objects go next', detail: 'Explore object reachability, collection and reclaimed memory.', to: '/start?chapter=gc', number: '04' },
];

export function HomePage() {
  usePageTitle();
  const progress = useProgress();
  const done = progress.lessons[FIRST_RUN.id] ?? {};
  const nextChapter = CHAPTERS.find((chapter) => !(chapter.id in done));
  const started = CHAPTERS.some((chapter) => chapter.id in done);
  const finished = !nextChapter;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 72% 12%, rgba(110,150,130,.16), transparent 44%), radial-gradient(ellipse at 10% 70%, rgba(74,105,91,.10), transparent 45%)' }} />
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:pt-24">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#9bb8ad]/25 bg-[#9bb8ad]/[0.07] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#bdd4c9]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9bb8ad]" />
              An interactive guide to runtime architecture
            </p>
            <h1 className="mt-7 max-w-[680px] font-serif text-[clamp(3.2rem,6.5vw,6.25rem)] leading-[.98] tracking-[-.055em] text-white text-balance">
              The machine behind <span className="text-[#a7c1b4] italic">your code.</span>
            </h1>
            <p className="mt-7 max-w-[560px] text-[16px] leading-[1.8] text-white/60 sm:text-[18px]">
              Trace a line of code through the Java Virtual Machine. Open the layers, follow the data, and see how a program moves from bytecode to execution.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink to="/anatomy" variant="primary" size="lg" className="!rounded-full !bg-[#b8d0c4] !text-[#101813] hover:!bg-[#d0e0d7]">
                Explore the machine <ArrowRight size={16} aria-hidden />
              </ButtonLink>
              <ButtonLink to="/start" variant="secondary" size="lg" className="!rounded-full !border-white/15 !bg-white/[0.035] !text-white hover:!bg-white/10">
                Start with the basics
              </ButtonLink>
            </div>
            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-[11px] text-white/45">
              <span className="inline-flex items-center gap-2"><Layers3 size={14} className="text-[#9bb8ad]" /> {COMPONENT_LIST.length} components mapped</span>
              <span className="inline-flex items-center gap-2"><Route size={14} className="text-[#9bb8ad]" /> {SCENARIOS.length} guided walkthroughs</span>
              <span className="inline-flex items-center gap-2"><BookOpen size={14} className="text-[#9bb8ad]" /> {REFERENCE_IDS.length} primary references</span>
            </div>
          </div>
          <div className="relative min-w-0">
            <div className="absolute -inset-6 rounded-[36px] bg-[#9bb8ad]/[0.035] blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1115]/90 p-2 shadow-[0_40px_120px_-55px_rgba(0,0,0,.95)] sm:p-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-3 pb-3 pt-2">
                <div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">Execution trace</p><p className="mt-1 text-[12px] text-white/75">A program, from instruction to output</p></div>
                <span className="rounded-full border border-[#9bb8ad]/20 bg-[#9bb8ad]/[0.06] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-[#bdd4c9]">Live model</span>
              </div>
              <div className="min-h-[260px] sm:min-h-[310px]"><JourneyMachine /></div>
              <div className="flex items-center justify-between border-t border-white/[0.08] px-3 py-3 text-[10px] text-white/35">
                <span>Follow the sequence. Change the input. Watch the output.</span>
                <span className="font-mono">01 / 07</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb8ad]">Open the architecture</p>
            <h2 className="mt-3 max-w-[700px] font-serif text-[clamp(2.1rem,4vw,3.7rem)] leading-[1.05] tracking-[-.04em] text-white">A runtime you can take apart.</h2>
          </div>
          <p className="max-w-[390px] text-[13px] leading-relaxed text-white/50">Select a layer. See what it receives, what it produces and how it fits into the larger system.</p>
        </div>
        <RuntimeModel />
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-4">
          <p className="max-w-[650px] text-[12px] leading-relaxed text-white/45">This is a conceptual map, not a physical layout. Specification-defined concepts are distinguished from implementation-specific HotSpot structures throughout the atlas.</p>
          <Link to="/anatomy" className="inline-flex shrink-0 items-center gap-2 text-[12px] font-medium text-[#bdd4c9] transition hover:text-white">Enter the full atlas <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-[#0c1114]">
        <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb8ad]">Start with a question</p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.4rem)] leading-tight tracking-[-.04em] text-white">Make the invisible make sense.</h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/55">Four useful entry points into the parts of runtime architecture developers ask about most.</p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            {DISCOVER.map((item) => (
              <Link key={item.number} to={item.to} className="group bg-[#0c1114] p-6 transition-colors hover:bg-[#131d1a] sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[11px] text-[#9bb8ad]/70">{item.number}</span>
                  <ArrowUpRight size={17} className="text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#bdd4c9]" />
                </div>
                <h3 className="mt-7 text-[17px] font-medium text-white">{item.title}</h3>
                <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-white/50">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9bb8ad]">A guided first pass</p>
          <h2 className="mt-3 font-serif text-[clamp(2rem,4vw,3.4rem)] leading-tight tracking-[-.04em] text-white">New to the internals?</h2>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/55">{FIRST_RUN.title}. Seven short chapters, about {LESSON_MINUTES} minutes. Predict what happens, inspect an interactive exhibit, then check your understanding.</p>
          <ButtonLink to={finished ? '/start?chapter=recap' : started && nextChapter ? `/start?chapter=${nextChapter.id}` : '/start'} variant="primary" className="mt-7 !rounded-full !bg-[#b8d0c4] !text-[#101813] hover:!bg-[#d0e0d7]">
            {finished ? 'Review the lesson' : started && nextChapter ? `Continue: ${nextChapter.title}` : 'Begin the first lesson'} <ArrowRight size={15} />
          </ButtonLink>
        </div>
        <div className="grid gap-1 sm:grid-cols-2">
          {CHAPTERS.map((chapter, index) => (
            <Link key={chapter.id} to={`/start?chapter=${chapter.id}`} className="group flex gap-4 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/[0.025]">
              <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]', chapter.id in done ? 'border-[#8ac9a5]/50 text-[#a5d8b9]' : 'border-white/15 text-white/45')}>
                {chapter.id in done ? <Check size={13} aria-label="Completed" /> : String(index + 1).padStart(2, '0')}
              </span>
              <span><span className="block text-[13px] font-medium text-white/85 group-hover:text-[#dcebe3]">{chapter.title}</span><span className="mt-1 block text-[11px] leading-relaxed text-white/40">{chapter.question}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.08] bg-[#0a0f12]">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-14 sm:px-8 sm:py-18 md:grid-cols-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb8ad]">For curious minds</p><h3 className="mt-3 text-[15px] font-medium text-white">One atlas. Different depths.</h3><p className="mt-2 text-[12px] leading-relaxed text-white/45">Beginner explanations, developer context and deep technical dissections live side by side.</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb8ad]">Built on primary sources</p><h3 className="mt-3 text-[15px] font-medium text-white">Accuracy is part of the interface.</h3><p className="mt-2 text-[12px] leading-relaxed text-white/45">The Java Virtual Machine Specification and OpenJDK sources are distinguished from implementation-specific behaviour.</p><Link to="/references" className="mt-3 inline-flex items-center gap-1 text-[11px] text-[#bdd4c9] hover:text-white">Browse {REFERENCE_IDS.length} references <ArrowRight size={12} /></Link></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9bb8ad]">Open by design</p><h3 className="mt-3 text-[15px] font-medium text-white">Fast, focused and free.</h3><p className="mt-2 text-[12px] leading-relaxed text-white/45">No account, tracking or backend. Your learning progress stays in your browser, and the site can work offline after the first visit.</p></div>
        </div>
      </section>

      {progress.recent.length > 0 && (
        <section className="mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8">
          <p className="flex items-center gap-2 text-[11px] font-medium text-white/45"><Clock3 size={14} /> Recently explored</p>
          <div className="mt-3 flex flex-wrap gap-2">{progress.recent.slice(0, 6).map((item) => <Link key={item.key} to={item.href} className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/55 transition hover:border-[#9bb8ad]/40 hover:text-white">{item.title}</Link>)}</div>
        </section>
      )}
    </>
  );
}
