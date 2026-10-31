import { ArrowRight, Play } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import {
  DEFAULT_MESSAGE,
  helloClassSize,
  helloMainBytecode,
  MAX_MESSAGE_LENGTH,
  sanitizeMessage,
} from '@/simulators/journey';
import { CodeText } from '@/modules/lesson/CodeText';
import { StepControls } from '@/modules/lesson/StepControls';
import { useStepper } from '@/modules/lesson/useStepper';

type Tone = 'plat' | 'rt' | 'exec' | 'ok';

interface Station {
  id: string;
  name: string;
  /** Label under the station on narrow screens. */
  short: string;
  /** Lesson chapter that explains this station. */
  chapter: string;
  tone: Tone;
  says: (message: string) => string;
  evidence: (message: string) => ReactNode;
}

const TONE: Record<Tone, { dot: string; on: string; text: string }> = {
  plat: { dot: 'border-plat-500', on: 'bg-plat-500 border-plat-400', text: 'text-plat-400' },
  rt: { dot: 'border-rt-500', on: 'bg-rt-500 border-rt-300', text: 'text-rt-300' },
  exec: { dot: 'border-exec-500', on: 'bg-exec-500 border-exec-300', text: 'text-exec-300' },
  ok: { dot: 'border-ok-500', on: 'bg-ok-500 border-ok-300', text: 'text-ok-300' },
};

const Mono = ({ children }: { children: ReactNode }) => (
  <pre
    translate="no"
    className="overflow-x-auto rounded-md border border-ink-700 bg-ink-900/90 px-2.5 py-2 font-mono text-[12px] leading-relaxed whitespace-pre text-fg-muted"
  >
    {children}
  </pre>
);

const STATIONS: Station[] = [
  {
    id: 'compiler',
    name: 'Compiler',
    short: 'Compiler',
    chapter: 'compiler',
    tone: 'plat',
    says: () =>
      'The compiler, `javac`, reads your source code, checks it for mistakes and translates it.',
    evidence: () => <Mono>$ javac Hello.java</Mono>,
  },
  {
    id: 'class-file',
    name: 'Class file',
    short: 'Class file',
    chapter: 'compiler',
    tone: 'plat',
    says: (m) =>
      `It writes \`Hello.class\`: ${helloClassSize(m)} bytes of bytecode, instructions for the JVM rather than for your processor. Your text is stored in it as a constant.`,
    evidence: (m) => (
      <Mono>
        {'Hello.class  CA FE BA BE 00 00 00 45 …\n'}
        <span className="text-ok-300">{helloMainBytecode(m)[1]!.replace(/ {2,}/g, '  ')}</span>
      </Mono>
    ),
  },
  {
    id: 'loader',
    name: 'Class loader',
    short: 'Loader',
    chapter: 'loading',
    tone: 'rt',
    says: () =>
      '`java Hello` starts the JVM. Its class loader finds `Hello.class`, checks it and prepares the class, and then `main` starts.',
    evidence: () => (
      <Mono>
        {'$ java Hello\n'}
        <span className="text-fg-subtle">[class,load] Hello source: file:./</span>
      </Mono>
    ),
  },
  {
    id: 'memory',
    name: 'Memory',
    short: 'Memory',
    chapter: 'memory',
    tone: 'rt',
    says: (m) =>
      `A frame for \`main\` is created on the thread’s stack. Your text becomes a String object, "${m}", in the heap, and the running code holds a reference to it.`,
    evidence: (m) => (
      <div className="flex flex-wrap items-center gap-2 text-[12px]" translate="no">
        <span className="rounded-md border border-exec-500/50 bg-exec-900/30 px-2 py-1 font-mono text-fg-muted">
          stack · frame main · ref
        </span>
        <ArrowRight size={14} aria-hidden className="text-rt-300" />
        <span className="rounded-md border border-rt-500/60 bg-rt-900/40 px-2 py-1 font-mono text-rt-200">
          heap · String "{m}"
        </span>
      </div>
    ),
  },
  {
    id: 'engine',
    name: 'Execution engine',
    short: 'Engine',
    chapter: 'execution',
    tone: 'exec',
    says: () =>
      'The interpreter carries out the bytecode, one instruction at a time: get `System.out`, push your text, call `println`. Code that runs often would be compiled to machine code; this line runs once.',
    evidence: (m) => (
      <Mono>
        {helloMainBytecode(m)
          .slice(0, 3)
          .map((line) => line.replace(/ {2,}\/\/.*$/, ''))
          .join('\n')}
      </Mono>
    ),
  },
  {
    id: 'cpu',
    name: 'CPU & OS',
    short: 'CPU',
    chapter: 'execution',
    tone: 'plat',
    says: () =>
      'Every step is carried out by machine code on your processor. In the end `println` asks the operating system to write the characters to your terminal.',
    evidence: () => <Mono>{'machine code → CPU\nwrite(stdout, …) → operating system'}</Mono>,
  },
  {
    id: 'output',
    name: 'Output',
    short: 'Output',
    chapter: 'recap',
    tone: 'ok',
    says: (m) =>
      m
        ? `Your program produced a result: "${m}" on the screen. Then \`main\` returns and the JVM exits.`
        : 'Your program printed an empty line. Then `main` returns and the JVM exits.',
    evidence: (m) => (
      <Mono>
        {'$ java Hello\n'}
        <span className="text-ok-300">{m}</span>
      </Mono>
    ),
  },
];

/**
 * One line of Java, followed from source code to the CPU. The bytecode,
 * class-file size and constant come from compiling this exact program with
 * javac 25.0.4 (see src/simulators/journey.ts).
 */
export function JourneyMachine({ className }: { className?: string }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [started, setStarted] = useState(false);
  const stepper = useStepper(STATIONS.length, 1900);
  const inputId = useId();
  const active = started ? stepper.step : -1;
  const station = active >= 0 ? STATIONS[active]! : null;

  const run = () => {
    setStarted(true);
    stepper.reset();
    stepper.togglePlay();
  };

  return (
    <figure
      aria-label="Follow one line of Java through the machine"
      className={cn('exhibit p-4 sm:p-5', className)}
    >
      <label htmlFor={inputId} className="text-[13px] font-medium text-fg-muted">
        Your line of Java
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div
          translate="no"
          className="flex w-full min-w-0 flex-wrap items-center gap-y-1 rounded-lg border border-ink-600 bg-ink-900/90 px-3 py-2.5 font-mono text-[13.5px] text-fg-muted sm:w-auto sm:flex-1 sm:text-[14.5px]"
        >
          <span className="whitespace-nowrap">System.out.println(</span>
          <span className="inline-flex items-center whitespace-nowrap">
            <span className="text-ok-300">"</span>
            <input
              id={inputId}
              name="message"
              value={message}
              onChange={(event) => setMessage(sanitizeMessage(event.target.value))}
              maxLength={MAX_MESSAGE_LENGTH * 2}
              autoComplete="off"
              spellCheck={false}
              style={{ width: `calc(${Math.max(1, [...message].length)}ch + 6px)` }}
              className="min-w-[3ch] rounded-[3px] border-b border-dashed border-ok-400/70 bg-ok-900/30 px-0.5 text-ok-300 outline-none focus-visible:border-solid focus-visible:bg-ok-900/60"
            />
            <span className="text-ok-300">"</span>
            <span>);</span>
          </span>
        </div>
        <button
          type="button"
          onClick={run}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-exec-400 bg-exec-500 px-4 text-[15px] font-medium text-ink-950 transition-colors hover:bg-exec-400"
        >
          <Play size={16} aria-hidden /> {started ? 'Run again' : 'Run it'}
        </button>
      </div>

      <ol className="relative mt-6 grid grid-cols-7 gap-x-1" aria-label="Stations on the journey">
        {/* The track, filling as the line travels. */}
        <span aria-hidden className="absolute top-[13px] right-[7%] left-[7%] h-0.5 bg-ink-600" />
        <span
          aria-hidden
          className="absolute top-[13px] left-[7%] h-0.5 origin-left bg-exec-400 transition-transform duration-500 ease-out"
          style={{
            right: '7%',
            transform: `scaleX(${active <= 0 ? 0 : active / (STATIONS.length - 1)})`,
          }}
        />
        {STATIONS.map((s, i) => {
          const tone = TONE[s.tone];
          const lit = i <= active;
          return (
            <li
              key={s.id}
              className="relative flex flex-col items-center text-center"
              style={{ gridColumn: i + 1, gridRow: 1 }}
            >
              <button
                type="button"
                onClick={() => {
                  setStarted(true);
                  stepper.seek(i);
                }}
                aria-current={i === active ? 'step' : undefined}
                aria-label={`${i + 1}. ${s.name}`}
                className={cn(
                  'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-[11px] transition-colors',
                  lit ? cn(tone.on, 'text-ink-950') : cn(tone.dot, 'bg-ink-950 text-fg-subtle'),
                  i === active && 'ring-4 ring-exec-400/25',
                )}
              >
                {i + 1}
              </button>
              <span
                aria-hidden
                className={cn(
                  'mt-1.5 text-[11px] leading-tight sm:text-[12.5px]',
                  lit ? 'text-fg' : 'text-fg-subtle',
                )}
              >
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.name}</span>
              </span>
            </li>
          );
        })}
        {/* The JVM groups stations 3 to 5. */}
        <li
          aria-hidden
          className="pointer-events-none col-start-3 col-end-6 row-start-1 -mx-0.5 -mt-4 h-[calc(100%+1.5rem)] rounded-lg border border-rt-500/40"
        >
          <span className="relative -top-2.5 left-2 bg-ink-950 px-1 text-[11.5px] text-rt-300">
            Java Virtual Machine
          </span>
        </li>
      </ol>

      <div aria-live="polite" className="mt-5 min-h-[9.5rem] border-t border-ink-700 pt-4">
        {station ? (
          <>
            <p className={cn('text-[13px] font-medium', TONE[station.tone].text)}>
              {active + 1} of {STATIONS.length} · {station.name}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-fg">
              <CodeText text={station.says(message)} />
            </p>
            <div className="mt-2.5">{station.evidence(message)}</div>
          </>
        ) : (
          <p className="text-[15px] leading-relaxed text-fg-muted">
            Type anything you like between the quotes, then press{' '}
            <span className="text-fg">Run it</span> to follow your line from the compiler to the
            processor.
          </p>
        )}
      </div>

      {started && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <StepControls stepper={stepper} label="Station" />
          {station && (
            <Link
              to={`/start?chapter=${station.chapter}`}
              className="inline-flex items-center gap-1 text-[13.5px] text-exec-300 underline underline-offset-2 hover:text-exec-200"
            >
              Learn how this works <ArrowRight size={13} aria-hidden />
            </Link>
          )}
        </div>
      )}
    </figure>
  );
}
