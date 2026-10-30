import { describe, expect, it } from 'vitest';
import * as playback from '@/simulators/playback';

const state = (step: number, playing = false) => ({ step, total: 5, playing });

describe('playback model', () => {
  it('moves forward and stops at the last step', () => {
    expect(playback.next(state(0)).step).toBe(1);
    expect(playback.next(state(4)).step).toBe(4);
    expect(playback.next(state(3, true))).toEqual({ step: 4, total: 5, playing: false });
    expect(playback.next(state(1, true)).playing).toBe(true);
  });

  it('moves back, resets and seeks, pausing playback', () => {
    expect(playback.previous(state(0, true))).toEqual({ step: 0, total: 5, playing: false });
    expect(playback.previous(state(3)).step).toBe(2);
    expect(playback.reset(state(4, true))).toEqual({ step: 0, total: 5, playing: false });
    expect(playback.seek(state(0), 9).step).toBe(4);
    expect(playback.seek(state(0), -3).step).toBe(0);
  });

  it('restarts from the beginning when play is pressed on the last step', () => {
    expect(playback.togglePlay(state(4))).toEqual({ step: 0, total: 5, playing: true });
    expect(playback.togglePlay(state(2))).toEqual({ step: 2, total: 5, playing: true });
    expect(playback.togglePlay(state(2, true)).playing).toBe(false);
  });

  it('scales step duration with speed', () => {
    expect(playback.stepDuration(2)).toBe(playback.BASE_STEP_MS / 2);
    expect(playback.clampStep(3.7, 5)).toBe(3);
    expect(playback.clampStep(1, 0)).toBe(0);
  });
});
