import { useState } from 'react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { AccuracyNote } from '@/components/learning/AccuracyNote';
import { LevelSwitch } from '@/components/learning/LevelSwitch';
import { LevelText } from '@/components/learning/LevelText';
import { InlineRichText } from '@/components/learning/RichText';
import { SourceList } from '@/components/learning/SourceReference';
import { ExecutionTimeline } from '@/components/timeline/ExecutionTimeline';
import { StepController } from '@/components/timeline/StepController';
import { getComponentDoc, type ComponentId } from '@/content/jvm';
import type { ExplanationLevel } from '@/hooks/useLearningState';
import { usePlayback } from '@/hooks/usePlayback';
import type { Scenario } from '@/types/content';

/** Narrative, controls and code for the execution scenarios. */
export function ExecutionPanel({
  scenario,
  step,
  level,
  onLevelChange,
  onStep,
  onNavigate,
  furthest,
  follow,
  onFollow,
}: {
  scenario: Scenario;
  step: number;
  level: ExplanationLevel;
  onLevelChange: (level: ExplanationLevel) => void;
  onScenario: (id: string) => void;
  onStep: (step: number) => void;
  onNavigate: (id: string) => void;
  furthest: number;
  follow: boolean;
  onFollow: (follow: boolean) => void;
}) {
  const current = scenario.steps[step]!;
  const playback = usePlayback({
    step,
    total: scenario.steps.length,
    onStep,
    resetKey: scenario.id,
  });
  const focusedListings = new Map((current.focus ?? []).map((f) => [f.listing, f.line]));
  // A listing the learner picked stays chosen until the step changes.
  const [choice, setChoice] = useState<{ stepKey: string; id: string } | null>(null);
  const stepKey = `${scenario.id}:${current.id}`;
  const preferred =
    scenario.listings.find((l) => focusedListings.has(l.id)) ?? scenario.listings[0]!;
  const chosen =
    choice?.stepKey === stepKey ? scenario.listings.find((l) => l.id === choice.id) : undefined;
  const listing = chosen ?? preferred;

  return (
    <div className="flex flex-col">
      <div className="border-b border-ink-700 px-5 pt-4 pb-3">
        <p className="kicker">Execution · educational walkthrough</p>
        <h2 className="mt-1 font-serif text-[22px] leading-tight text-fg">
          <InlineRichText text={scenario.title} />
        </h2>
        <p className="mt-1 text-[13.5px] text-fg-muted">{scenario.summary}</p>
        <div className="mt-3">
          <StepController
            step={step}
            total={scenario.steps.length}
            playing={playback.playing}
            speed={playback.speed}
            onPrevious={playback.previous}
            onNext={playback.next}
            onReset={playback.reset}
            onTogglePlay={playback.togglePlay}
            onSpeed={playback.setSpeed}
          />
          <ExecutionTimeline
            steps={scenario.steps}
            current={step}
            furthest={Math.max(furthest, step)}
            onSeek={playback.seek}
          />
        </div>
        <label className="mt-1 flex items-center gap-2 text-[12.5px] text-fg-subtle">
          <input
            type="checkbox"
            checked={follow}
            onChange={(event) => onFollow(event.target.checked)}
            className="accent-[var(--color-exec-500)]"
          />
          Camera follows the active components
        </label>
      </div>

      <section aria-live="polite" aria-atomic="true" className="px-5 py-4">
        <p className="font-mono text-[11px] tracking-wider text-exec-300 uppercase">
          Step {step + 1} of {scenario.steps.length}
        </p>
        <h3 className="mt-1 text-[17px] font-semibold text-fg">
          <InlineRichText text={current.title} />
        </h3>
        <div className="mt-2">
          <LevelSwitch value={level} onChange={onLevelChange} />
        </div>
        <div className="mt-3">
          <LevelText content={current} level={level} />
        </div>
        {current.note && (
          <p className="mt-3 rounded-md border border-warn-500/30 bg-warn-900/25 p-2.5 text-[13px] text-warn-300">
            <span className="font-medium">Note: </span>
            <InlineRichText text={current.note} />
          </p>
        )}
        <div className="mt-3">
          <p className="text-[12.5px] text-fg-subtle">Components in this step</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {current.active.map((id: ComponentId) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  className="rounded border border-exec-500/40 bg-exec-900/40 px-2 py-0.5 text-[12.5px] text-exec-200 hover:border-exec-400"
                >
                  {getComponentDoc(id).name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-ink-700 px-5 py-4">
        <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Code listing">
          {scenario.listings.map((l) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={l.id === listing.id}
              onClick={() => setChoice({ stepKey, id: l.id })}
              className={
                l.id === listing.id
                  ? 'rounded border border-ink-400 bg-ink-700 px-2 py-0.5 text-[12px] text-fg'
                  : 'rounded border border-ink-600 px-2 py-0.5 text-[12px] text-fg-subtle hover:text-fg'
              }
            >
              {l.title}
              {focusedListings.has(l.id) && (
                <span className="ml-1 text-exec-300" aria-label="has the current line">
                  ●
                </span>
              )}
            </button>
          ))}
        </div>
        <CodeBlock
          code={listing.code}
          language={listing.language}
          title={listing.title}
          verifiedWith={listing.verifiedWith}
          highlightLines={
            focusedListings.has(listing.id) ? [focusedListings.get(listing.id)!] : undefined
          }
        />
      </section>

      <div className="border-t border-ink-700 px-5 py-4">
        <AccuracyNote compact text={scenario.accuracyNote} />
      </div>
      <section className="border-t border-ink-700 px-5 py-4">
        <h3 className="kicker mb-2">Sources</h3>
        <SourceList citations={scenario.references} />
      </section>
    </div>
  );
}
