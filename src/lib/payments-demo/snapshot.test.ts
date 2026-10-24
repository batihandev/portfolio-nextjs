import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemoSnapshot, SNAPSHOT_TIMEOUT_MS } from "./snapshot";
import { demoPayment } from "./test-data";

const API = "http://demo.test";
const stats = { settledCount: 3, averageTimeToSettleMs: 4200, duplicatesSkipped: 0, failuresRecovered: 1 };
const daily = [{ day: "2026-10-24", settled: 3, scheduled: 2, visitor: 1, averageTimeToSettleMs: 4200 }];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function serve(routes: Record<string, () => Promise<Response>>) {
  const fetch = vi.fn((input: string | URL | Request) => {
    const path = String(input).slice(API.length);
    const route = routes[path];
    return route ? route() : Promise.resolve(json({ error: "not_found" }, 404));
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

const healthy = {
  "/payments?limit=20": async () => json([demoPayment()]),
  "/stats": async () => json(stats),
  "/stats/daily": async () => json(daily),
  "/health": async () => json({ cardAvailable: true, confirmations: 50 }),
};

describe("getDemoSnapshot", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_API_URL", `${API}/`);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns null without a configured API", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_API_URL", "");
    const fetch = serve(healthy);
    await expect(getDemoSnapshot()).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reads the payments, stats and daily figures with revalidation and a timeout", async () => {
    const fetch = serve(healthy);
    const snapshot = await getDemoSnapshot();
    expect(snapshot).toMatchObject({ payments: [demoPayment()], stats, daily, confirmations: 50 });
    expect(Number.isNaN(Date.parse(snapshot?.fetchedAt ?? ""))).toBe(false);
    for (const [, init] of fetch.mock.calls as unknown as [string, RequestInit & { next?: unknown }][]) {
      expect(init.next).toEqual({ revalidate: 45 });
      expect(init.signal).toBeInstanceOf(AbortSignal);
    }
  });

  // Next drops the fetch signal when it regenerates a page whose data is stale, so the
  // deadline must hold even for a fetch that never settles.
  it("throws on a timed-out fetch so the cached page stays", async () => {
    vi.useFakeTimers();
    serve({ ...healthy, "/stats": () => new Promise<Response>(() => {}) });
    const result = getDemoSnapshot();
    const settled = expect(result).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(SNAPSHOT_TIMEOUT_MS);
    await settled;
  });

  it("throws on a failed response", async () => {
    serve({ ...healthy, "/stats/daily": async () => json({ error: "internal" }, 500) });
    await expect(getDemoSnapshot()).rejects.toThrow(/500/);
  });

  it("throws on a health body without the confirmation target", async () => {
    serve({ ...healthy, "/health": async () => json({ cardAvailable: true }) });
    await expect(getDemoSnapshot()).rejects.toThrow(/health sent an unexpected body/);
  });

  it("throws on a body that is not the expected shape", async () => {
    serve({ ...healthy, "/payments?limit=20": async () => json({ rows: [] }) });
    await expect(getDemoSnapshot()).rejects.toThrow(/unexpected body/);
  });
});
