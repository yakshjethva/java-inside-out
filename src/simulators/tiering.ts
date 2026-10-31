/**
 * A teaching model of HotSpot's tiered compilation for one small method,
 * `Hot.square(int)` (see the "A hot method becomes machine code" scenario).
 *
 * HotSpot JDK 25 starts a method in the interpreter (tier 0). Around
 * `Tier3InvocationThreshold` (200) calls it queues the method for C1 with full
 * profiling (tier 3); after about `Tier4InvocationThreshold` (5000) calls in
 * that profiled code it queues C2 (tier 4) and retires the tier-3 version.
 *
 * Simplified on purpose, and the exhibit says so: real thresholds are scaled
 * by compiler-queue load, compilation runs in background threads while calls
 * continue in the old code, loops add back-edge counts, and a callee this small
 * is usually inlined into its caller.
 */

export const TIER3_CALLS = 200;
export const TIER4_CALLS_IN_C1 = 5_000;

export type Tier = 0 | 3 | 4;

export interface TierEvent {
  kind: 'tier3' | 'tier4' | 'retired';
  /** Call number at which the change happens in this model. */
  atCall: number;
  /** The matching line from `java -XX:+PrintCompilation -cp . Hot` (JDK 25.0.4). */
  log: string;
}

export interface TieringState {
  calls: number;
  tier: Tier;
  events: TierEvent[];
}

export const INITIAL_TIERING: TieringState = { calls: 0, tier: 0, events: [] };

const TIER4_AT = TIER3_CALLS + TIER4_CALLS_IN_C1;

/** Calls the method `count` more times and applies every tier change crossed on the way. */
export function callMethod(state: TieringState, count: number): TieringState {
  const calls = state.calls + Math.max(0, Math.trunc(count));
  const events = [...state.events];
  let tier = state.tier;
  if (tier === 0 && calls >= TIER3_CALLS) {
    tier = 3;
    events.push({
      kind: 'tier3',
      atCall: TIER3_CALLS,
      log: '11       3       Hot::square (4 bytes)',
    });
  }
  if (tier === 3 && calls >= TIER4_AT) {
    tier = 4;
    events.push(
      { kind: 'tier4', atCall: TIER4_AT, log: '12       4       Hot::square (4 bytes)' },
      {
        kind: 'retired',
        atCall: TIER4_AT,
        log: '11       3       Hot::square (4 bytes)   made not entrant: not used',
      },
    );
  }
  return { calls, tier, events };
}
