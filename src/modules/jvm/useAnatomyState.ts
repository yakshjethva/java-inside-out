import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { isComponentId, type ComponentId } from '@/content/jvm';
import { SCENARIOS } from '@/content/jvm/scenarios';
import type { MapView } from '@/hooks/useLearningState';

export const MODES = ['anatomy', 'exploded', 'internal', 'execution'] as const;
export type ExplorerMode = (typeof MODES)[number];

/** `view=overview` or `view=full`; absent means "the learner's last choice". */
const isView = (value: string | null): value is MapView => value === 'overview' || value === 'full';

const isMode = (value: string | null): value is ExplorerMode =>
  MODES.includes(value as ExplorerMode);

/**
 * Explorer state that belongs in the URL (shareable, back-button friendly):
 * selected component, mode, scenario and step.
 */
export function useAnatomyState() {
  const [params, setParams] = useSearchParams();

  const rawSelection = params.get('c');
  const selectedId: ComponentId | null =
    rawSelection && isComponentId(rawSelection) ? rawSelection : null;
  const rawMode = params.get('mode');
  const mode: ExplorerMode = isMode(rawMode) ? rawMode : 'anatomy';
  const scenarioId = SCENARIOS.some((s) => s.id === params.get('s'))
    ? params.get('s')!
    : SCENARIOS[0]!.id;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const rawView = params.get('view');
  const view: MapView | null = isView(rawView) ? rawView : null;
  const rawStep = Number(params.get('step') ?? '0');
  const step = Number.isInteger(rawStep)
    ? Math.min(Math.max(rawStep, 0), scenario.steps.length - 1)
    : 0;

  const update = useCallback(
    (changes: Record<string, string | null>, replace = false) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace, preventScrollReset: true },
      );
    },
    [setParams],
  );

  return useMemo(
    () => ({
      selectedId,
      mode,
      view,
      scenario,
      step,
      setView: (next: MapView) => update({ view: next }, true),
      select: (id: ComponentId | null) => update({ c: id }),
      setMode: (next: ExplorerMode) => update({ mode: next === 'anatomy' ? null : next }),
      setScenario: (id: string) => update({ s: id, step: null }, true),
      setStep: (index: number) => update({ step: index === 0 ? null : String(index) }, true),
      /** Opens a walkthrough at a step ("Watch it run" from the inspector). */
      watch: (scenarioId: string, index: number) =>
        update({ mode: 'execution', s: scenarioId, step: index === 0 ? null : String(index) }),
    }),
    [selectedId, mode, view, scenario, step, update],
  );
}
