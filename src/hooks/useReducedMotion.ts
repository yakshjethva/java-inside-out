import { usePreferences } from './useLearningState';
import { useMediaQuery } from './useMediaQuery';

/** True when animations should be minimised (OS setting, unless overridden in the app). */
export function useReducedMotion(): boolean {
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { preferences } = usePreferences();
  if (preferences.motion === 'reduce') return true;
  if (preferences.motion === 'allow') return false;
  return systemReduce;
}
