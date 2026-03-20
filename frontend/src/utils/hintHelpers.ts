const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const MAX_HINTS = 5;

export function getEffectiveHints(
  storedHints: number,
  lastHintRegenTimeNs: number,
): number {
  const lastRegenMs = lastHintRegenTimeNs / 1_000_000;
  const elapsedMs = Date.now() - lastRegenMs;
  const regenCount = elapsedMs > 0 ? Math.floor(elapsedMs / TWO_HOURS_MS) : 0;
  return Math.min(storedHints + regenCount, MAX_HINTS);
}

export function getNextHintCountdownMs(
  storedHints: number,
  lastHintRegenTimeNs: number,
): number | null {
  const effective = getEffectiveHints(storedHints, lastHintRegenTimeNs);
  if (effective >= MAX_HINTS) return null;
  const lastRegenMs = lastHintRegenTimeNs / 1_000_000;
  const elapsedMs = Date.now() - lastRegenMs;
  const regenCount = elapsedMs > 0 ? Math.floor(elapsedMs / TWO_HOURS_MS) : 0;
  const nextRegenMs = lastRegenMs + (regenCount + 1) * TWO_HOURS_MS;
  return Math.max(0, nextRegenMs - Date.now());
}

export function formatCountdown(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
