import { useEffect, useState } from 'react';
import * as playback from '@/simulators/playback';

/**
 * Drives a step timeline. The current step is owned by the caller (often the
 * URL); this hook owns play/pause and speed, and advances on a timer.
 */
export function usePlayback({
  step,
  total,
  onStep,
  resetKey,
  stepMs,
}: {
  step: number;
  total: number;
  onStep: (step: number) => void;
  resetKey: string;
  /** Milliseconds per step at 1× (defaults to the scenario timeline's length). */
  stepMs?: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<playback.PlaybackSpeed>(1);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  // Stop playing when the timeline itself changes (another scenario).
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => {
        const nextState = playback.next({ step, total, playing });
        onStep(nextState.step);
        if (!nextState.playing) setPlaying(false);
      },
      playback.stepDuration(speed, stepMs),
    );
    return () => window.clearTimeout(timer);
  }, [playing, step, total, speed, onStep, stepMs]);

  const apply = (state: playback.PlaybackState) => {
    if (state.step !== step) onStep(state.step);
    setPlaying(state.playing);
  };
  const current = { step, total, playing };

  return {
    playing,
    speed,
    setSpeed,
    next: () => apply(playback.next({ ...current, playing: false })),
    previous: () => apply(playback.previous(current)),
    reset: () => apply(playback.reset(current)),
    seek: (target: number) => apply(playback.seek(current, target)),
    togglePlay: () => apply(playback.togglePlay(current)),
  };
}
