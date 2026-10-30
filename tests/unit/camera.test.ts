import { describe, expect, it } from 'vitest';
import { chooseCameraFocus, type CameraFocus } from '@/modules/jvm/camera';

const rect = { x: 0, y: 0, w: 10, h: 10 };
const step = (key: string): CameraFocus => ({ rect, key });
const request = (key: string, followKey: string | null): CameraFocus => ({ rect, key, followKey });

describe('chooseCameraFocus', () => {
  it('uses the explicit focus when no scenario is followed', () => {
    expect(chooseCameraFocus(null, request('heap:1', null))?.key).toBe('heap:1');
    expect(chooseCameraFocus(null, null)).toBeNull();
  });

  it('follows the current step until something else is requested during it', () => {
    expect(chooseCameraFocus(step('new-person:resolve'), null)?.key).toBe('new-person:resolve');
    expect(
      chooseCameraFocus(step('new-person:resolve'), request('heap:1', 'new-person:resolve'))?.key,
    ).toBe('heap:1');
  });

  it('gives the camera back to the scenario on the next step', () => {
    expect(
      chooseCameraFocus(step('new-person:allocate'), request('heap:1', 'new-person:resolve'))?.key,
    ).toBe('new-person:allocate');
  });

  it('keeps an explicit focus made while following once following stops', () => {
    expect(chooseCameraFocus(null, request('heap:1', 'new-person:resolve'))?.key).toBe('heap:1');
  });
});
