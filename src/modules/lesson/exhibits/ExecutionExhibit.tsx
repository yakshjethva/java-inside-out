import { ArrowRight, Cpu, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import {
  callMethod,
  INITIAL_TIERING,
  TIER3_CALLS,
  TIER4_CALLS_IN_C1,
  type Tier,
} from '@/simulators/tiering';
import { CodeText } from '../CodeText';
import { ExhibitFrame } from '../ExhibitFrame';

const TIERS: { tier: Tier; name: string; detail: string }[] = [
  { tier: 0, name: 'Interpreter', detail: 'tier 0 · reads bytecode one instruction at a time' },
  { tier: 3, name: 'C1 machine code', detail: 'tier 3 · compiled quickly, still counting' },
  { tier: 4, name: 'C2 machine code', detail: 'tier 4 · fully optimized' },
];

const EVENT_TEXT = {
  tier3:
    'About 200 calls in: C1 compiles `square` (tier 3), with counters to learn how it is used.',
  tier4: 'About 5,000 more calls: C2 compiles `square` again with full optimization (tier 4).',
  retired: 'The tier-3 version is no longer needed and is switched off (“made not entrant”).',
};

const format = (n: number) => new Intl.NumberFormat('en').format(n);

/** Chapter 6: call a method until HotSpot compiles it, tier by tier. */
export function ExecutionExhibit() {
  const [state, setState] = useState(INITIAL_TIERING);
  const [lastBatch, setLastBatch] = useState(0);
  const tierIndex = TIERS.findIndex((t) => t.tier === state.tier);
  const nextAt =
    state.tier === 0 ? TIER3_CALLS : state.tier === 3 ? TIER3_CALLS + TIER4_CALLS_IN_C1 : null;

  const call = (count: number) => {
    setState((s) => callMethod(s, count));
    setLastBatch(count);
  };

  const latest = state.events.at(-1);
  const caption =
    state.calls === 0
      ? 'Call the method and watch how HotSpot runs it.'
      : latest && lastBatch && latest.atCall > state.calls - lastBatch
        ? EVENT_TEXT[latest.kind === 'retired' ? 'tier4' : latest.kind] +
          (latest.kind === 'retired' ? ' ' + EVENT_TEXT.retired : '')
        : state.tier === 0
          ? `${format(state.calls)} calls, all interpreted: each bytecode instruction is carried out by the interpreter.`
          : state.tier === 3
            ? `${format(state.calls)} calls. The CPU now runs C1’s machine code for \`square\` directly.`
            : `${format(state.calls)} calls. The CPU runs C2’s optimized machine code.`;

  return (
    <ExhibitFrame
      title="Running Hot.square(int)"
      caption={<CodeText text={caption} />}
      note="A teaching model of HotSpot JDK 25. The call counts are the documented thresholds (Tier3InvocationThreshold 200, Tier4InvocationThreshold 5000); real thresholds are scaled by compiler load, compilation happens in the background while calls continue, and a method this small is usually inlined into its caller."
    >
      <div className="grid gap-3 @[600px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div>
          <pre
            translate="no"
            className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900/90 p-3 font-mono text-[12.5px] leading-relaxed text-fg-muted"
          >
            <span className="text-rt-300">static int</span> square(
            <span className="text-rt-300">int</span> x) {'{\n'}
            {'    '}
            <span className="text-rt-300">return</span> x * x;{'\n}'}
          </pre>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[1, 100, 1000].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => call(count)}
                className="inline-flex h-9 items-center rounded-md border border-exec-500/70 bg-exec-900/50 px-3 text-[13px] text-exec-200 transition-colors hover:border-exec-400 hover:bg-exec-900"
              >
                {count === 1 ? 'Call once' : `Call ${format(count)} times`}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setState(INITIAL_TIERING);
                setLastBatch(0);
              }}
              aria-label="Start again"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-600 text-fg-muted hover:text-fg"
            >
              <RotateCcw size={15} aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-[13.5px] text-fg-muted tabular">
            Calls so far: <span className="font-medium text-fg">{format(state.calls)}</span>
            {nextAt !== null && (
              <span className="text-fg-subtle"> · next change at about {format(nextAt)}</span>
            )}
          </p>
          {nextAt !== null && (
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-700"
              role="progressbar"
              aria-label="Calls until the next tier"
              aria-valuemin={0}
              aria-valuemax={nextAt}
              aria-valuenow={Math.min(state.calls, nextAt)}
            >
              <div
                className="h-full origin-left rounded-full bg-exec-400 transition-transform duration-300"
                style={{ transform: `scaleX(${Math.min(1, state.calls / nextAt)})` }}
              />
            </div>
          )}
        </div>

        <div>
          <ol className="space-y-1.5" aria-label="How square() is executed">
            {TIERS.map((t, i) => (
              <li
                key={t.tier}
                aria-current={i === tierIndex ? 'true' : undefined}
                className={cn(
                  'rounded-lg border px-3 py-2 transition-colors',
                  i === tierIndex
                    ? 'border-exec-400 bg-exec-900/50'
                    : i < tierIndex
                      ? 'border-ink-600 bg-ink-900/60 opacity-60'
                      : 'border-dashed border-ink-600 bg-transparent',
                )}
              >
                <p
                  className={cn(
                    'text-[14px] font-medium',
                    i === tierIndex ? 'text-exec-200' : 'text-fg-muted',
                  )}
                >
                  {t.name}
                  {i === tierIndex && <span className="sr-only"> (in use)</span>}
                </p>
                <p className="text-[12.5px] text-fg-subtle">{t.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px] text-fg-muted">
            <span className="rounded border border-ink-600 px-1.5 py-0.5">
              {state.tier === 0 ? 'bytecode' : 'machine code'}
            </span>
            <ArrowRight size={13} aria-hidden />
            {state.tier === 0 && (
              <>
                <span className="rounded border border-exec-500/60 px-1.5 py-0.5 text-exec-200">
                  interpreter
                </span>
                <ArrowRight size={13} aria-hidden />
              </>
            )}
            <span className="inline-flex items-center gap-1 rounded border border-dotted border-plat-500 px-1.5 py-0.5">
              <Cpu size={13} aria-hidden className="text-plat-400" /> CPU
            </span>
          </p>
        </div>
      </div>

      {state.events.length > 0 && (
        <div className="mt-3">
          <p className="text-[12.5px] text-fg-subtle">
            What{' '}
            <code translate="no" className="font-mono">
              -XX:+PrintCompilation
            </code>{' '}
            printed for{' '}
            <code translate="no" className="font-mono">
              square
            </code>{' '}
            (JDK 25.0.4; the first column is milliseconds since start, and timings and compile ids
            vary)
          </p>
          <pre
            translate="no"
            className="mt-1 overflow-x-auto rounded-lg border border-ink-700 bg-ink-900/90 p-2.5 font-mono text-[12px] leading-relaxed text-ok-300"
          >
            {state.events.map((event) => event.log).join('\n')}
          </pre>
        </div>
      )}
    </ExhibitFrame>
  );
}
