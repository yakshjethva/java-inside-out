import { useCallback, useState } from 'react';
import { usePlayback } from '@/hooks/usePlayback';

/** Step state for an exhibit: play, pause, step back and forth, restart. */
export function useStepper(total: number, stepMs = 1800, resetKey = '') {
  const [step, setStep] = useState(0);
  const onStep = useCallback((next: number) => setStep(next), []);
  const playback = usePlayback({ step, total, onStep, resetKey, stepMs });
  return { step, total, ...playback };
}

export type Stepper = ReturnType<typeof useStepper>;
