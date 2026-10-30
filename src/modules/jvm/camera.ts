import type { Rect } from '@/lib/geometry';

/** A camera target. A new `key` makes the canvas move, even to the same rectangle. */
export interface CameraFocus {
  rect: Rect;
  key: string;
  maxZoom?: number;
  /** The execution step being followed when this focus was requested, if any. */
  followKey?: string | null;
}

/**
 * While the camera follows an execution scenario, an explicit request (the Focus button, or
 * keyboard focus reaching a component off-screen) made during the current step wins; the next
 * step takes the camera back.
 */
export function chooseCameraFocus(
  following: CameraFocus | null,
  requested: CameraFocus | null,
): CameraFocus | null {
  if (following && requested?.followKey !== following.key) return following;
  return requested;
}
