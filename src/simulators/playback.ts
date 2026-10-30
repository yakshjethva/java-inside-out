/**
 * Step playback model shared by every timeline (execution scenarios now,
 * memory and GC labs later). Pure functions: no timers, no DOM.
 */
export interface PlaybackState {
  step: number;
  total: number;
  playing: boolean;
}

export const PLAYBACK_SPEEDS = [0.5, 1, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

/** Milliseconds a step stays on screen during autoplay at 1×. */
export const BASE_STEP_MS = 4200;

export function clampStep(step: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(Math.trunc(step), 0), total - 1);
}

export function next(state: PlaybackState): PlaybackState {
  const step = clampStep(state.step + 1, state.total);
  const atEnd = step === state.total - 1;
  return { ...state, step, playing: state.playing && !atEnd };
}

export function previous(state: PlaybackState): PlaybackState {
  return { ...state, step: clampStep(state.step - 1, state.total), playing: false };
}

export function reset(state: PlaybackState): PlaybackState {
  return { ...state, step: 0, playing: false };
}

export function seek(state: PlaybackState, step: number): PlaybackState {
  return { ...state, step: clampStep(step, state.total), playing: false };
}

/** Play from the start again when play is pressed on the last step. */
export function togglePlay(state: PlaybackState): PlaybackState {
  if (state.playing) return { ...state, playing: false };
  if (state.step >= state.total - 1) return { ...state, step: 0, playing: true };
  return { ...state, playing: true };
}

export function stepDuration(speed: PlaybackSpeed): number {
  return BASE_STEP_MS / speed;
}
