import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { isComponentId, type ComponentId } from '@/content/jvm';
import { SCENARIOS } from '@/content/jvm/scenarios';

export const MODES = ['anatomy', 'exploded', 'internal', 'execution'] as const;
export type ExplorerMode = (typeof MODES)[number];

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
      scenario,
      step,
      select: (id: ComponentId | null) => update({ c: id }),
      setMode: (next: ExplorerMode) => update({ mode: next === 'anatomy' ? null : next }),
      setScenario: (id: string) => update({ s: id, step: null }, true),
      setStep: (index: number) => update({ step: index === 0 ? null : String(index) }, true),
    }),
    [selectedId, mode, scenario, step, update],
  );
}
