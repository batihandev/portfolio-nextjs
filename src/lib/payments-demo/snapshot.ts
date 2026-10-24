import { demoApiUrl } from "./config";
import { isDay, isHealth, isListOf, isPayment, isStats } from "./parse";
import type { DemoSnapshot } from "./types";

export const SNAPSHOT_REVALIDATE_SECONDS = 10;
export const SNAPSHOT_TIMEOUT_MS = 2500;
export const SNAPSHOT_PAYMENTS = 20;

/**
 * Rejects once the deadline passes. The fetch signal alone is not enough: when Next regenerates
 * a page whose cached data is stale, it calls the origin without the signal.
 */
function withDeadline<T>(work: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Demo API ${label} timed out after ${SNAPSHOT_TIMEOUT_MS} ms`)),
      SNAPSHOT_TIMEOUT_MS,
    );
  });
  return Promise.race([work, deadline]).finally(() => clearTimeout(timer));
}

async function read(base: string, path: string): Promise<unknown> {
  return withDeadline(
    (async () => {
      const response = await fetch(`${base}${path}`, {
        next: { revalidate: SNAPSHOT_REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(SNAPSHOT_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`Demo API ${path} answered ${response.status}`);
      return (await response.json()) as unknown;
    })(),
    path,
  );
}

/**
 * The demo's recent payments and figures for the first paint, cached with ISR.
 *
 * Returns null only when the demo is not configured. Every failure throws, so a background
 * regeneration fails and Next keeps serving the last good page instead of caching an empty one.
 */
export async function getDemoSnapshot(): Promise<DemoSnapshot | null> {
  const base = demoApiUrl();
  if (!base) return null;
  const [payments, stats, daily, health] = await Promise.all([
    read(base, `/payments?limit=${SNAPSHOT_PAYMENTS}`),
    read(base, "/stats"),
    read(base, "/stats/daily"),
    read(base, "/health"),
  ]);
  if (!isListOf(payments, isPayment)) throw new Error("Demo API /payments sent an unexpected body");
  if (!isStats(stats)) throw new Error("Demo API /stats sent an unexpected body");
  if (!isListOf(daily, isDay)) throw new Error("Demo API /stats/daily sent an unexpected body");
  if (!isHealth(health)) throw new Error("Demo API /health sent an unexpected body");
  return { payments, stats, daily, confirmations: health.confirmations, fetchedAt: new Date().toISOString() };
}
