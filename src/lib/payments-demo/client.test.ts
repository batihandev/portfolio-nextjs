import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoClient, PURCHASE_DEADLINE_MS, READ_DEADLINE_MS, STREAM_REOPEN_MS, type PurchaseResult } from "./client";
import { noticeFor } from "./copy";
import { demoPayment } from "./test-data";
import { FakeStream } from "./test-stream";

const API = "http://demo.test";

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });

function client(request: (input: string, init?: RequestInit) => Promise<Response>) {
  FakeStream.opened = [];
  const fetch = vi.fn(request);
  return { fetch, demo: new DemoClient(`${API}/`, fetch, FakeStream.create) };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("DemoClient.purchase", () => {
  const order = {
    orderId: "6f1c4a52-3a43-4c38-9a71-0c2b8f1d2e3a",
    item: "Coffee",
    price: "500",
    expiresAt: "2026-10-24T10:05:00.000Z",
  };

  it("posts the rail and returns the accepted order", async () => {
    const { fetch, demo } = client(async () => json({ ...order, position: 2 }, 202));
    await expect(demo.purchase("card")).resolves.toEqual({ kind: "accepted", ...order, position: 2 });
    expect(fetch).toHaveBeenCalledWith(`${API}/test-purchases`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rail: "card" }),
      signal: expect.any(AbortSignal),
    });
  });

  const refusals: [string, () => Promise<Response>, PurchaseResult][] = [
    ["paused", async () => json({ error: "paused" }, 503), { kind: "closed", reason: "paused" }],
    [
      "purchases_unavailable",
      async () => json({ error: "purchases_unavailable" }, 503),
      { kind: "closed", reason: "purchases_unavailable" },
    ],
    [
      "card_unavailable",
      async () => json({ error: "card_unavailable" }, 503),
      { kind: "closed", reason: "card_unavailable" },
    ],
    [
      "purchase_pending",
      async () => json({ error: "purchase_pending" }, 503),
      { kind: "closed", reason: "purchase_pending" },
    ],
    ["daily_limit", async () => json({ error: "daily_limit" }, 409), { kind: "closed", reason: "daily_limit" }],
    [
      "rate_limited",
      async () => json({ error: "rate_limited" }, 429, { "Retry-After": "37" }),
      { kind: "busy", retryAfterSeconds: 37 },
    ],
    ["busy", async () => json({ error: "busy" }, 429, { "Retry-After": "2" }), { kind: "busy", retryAfterSeconds: 2 }],
    [
      "invalid_purchase_body",
      async () => json({ error: "invalid_purchase_body" }, 400),
      { kind: "closed", reason: "unavailable" },
    ],
    ["internal", async () => json({ error: "internal" }, 500), { kind: "closed", reason: "unavailable" }],
    ["unreachable", () => Promise.reject(new TypeError("Failed to fetch")), { kind: "closed", reason: "unreachable" }],
  ];

  it("maps each refusal to calm copy", async () => {
    for (const [code, respond, expected] of refusals) {
      const { demo } = client(respond);
      const result = await demo.purchase("chain");
      expect(result, code).toEqual(expected);
      const copy = noticeFor(result);
      expect(copy, code).toBeTruthy();
      expect(copy, code).not.toMatch(/[\u2013\u2014]/);
    }
  });

  it("returns the order from a pending reply as accepted", async () => {
    const { demo } = client(async () => json({ error: "purchase_pending", ...order }, 503));
    await expect(demo.purchase("chain")).resolves.toEqual({ kind: "accepted", ...order });
  });

  it("waits a minute when a refusal gives no usable Retry-After", async () => {
    const { demo } = client(async () => json({ error: "rate_limited" }, 429));
    await expect(demo.purchase("chain")).resolves.toEqual({ kind: "busy", retryAfterSeconds: 60 });
  });

  it("treats an accepted answer with a broken body as unavailable", async () => {
    const { demo } = client(async () => new Response("not json", { status: 202 }));
    await expect(demo.purchase("chain")).resolves.toEqual({ kind: "closed", reason: "unavailable" });
  });
});

describe("DemoClient.subscribe", () => {
  it("reports paused when the stream errors and live when it reopens", () => {
    const { demo } = client(async () => json({}, 200));
    const onStatus = vi.fn();
    demo.subscribe({ onStatus });
    const [stream] = FakeStream.opened;
    expect(stream?.url).toBe(`${API}/events`);
    stream?.open();
    stream?.drop();
    stream?.drop();
    stream?.open();
    expect(onStatus.mock.calls.map(([status]) => status)).toEqual(["live", "paused", "live"]);
    expect(FakeStream.opened).toHaveLength(1);
  });

  it("reopens a stream the browser gave up on", () => {
    vi.useFakeTimers();
    const { demo } = client(async () => json({}, 200));
    const onStatus = vi.fn();
    demo.subscribe({ onStatus });
    FakeStream.opened[0]?.fail();
    expect(FakeStream.opened[0]?.closed).toBe(true);
    vi.advanceTimersByTime(STREAM_REOPEN_MS - 1);
    expect(FakeStream.opened).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(FakeStream.opened).toHaveLength(2);
    FakeStream.opened[1]?.open();
    expect(onStatus.mock.calls.map(([status]) => status)).toEqual(["paused", "live"]);
  });

  it("dispatches payment, order and queue events and skips unreadable ones", () => {
    const { demo } = client(async () => json({}, 200));
    const onPayment = vi.fn();
    const onOrder = vi.fn();
    const onQueue = vi.fn();
    demo.subscribe({ onPayment, onOrder, onQueue });
    const stream = FakeStream.opened[0];
    stream?.open();
    stream?.send(demoPayment({ version: 2 }));
    stream?.send("not json");
    stream?.send({ id: "x" });
    stream?.send({ type: "order", id: "o1", closed: true }, "order");
    stream?.send({ type: "order", id: "o1" }, "order");
    stream?.send({ type: "queue", waiting: ["o2", "o3"] }, "queue");
    stream?.send({ type: "queue", waiting: [1] }, "queue");
    expect(onPayment.mock.calls).toEqual([[demoPayment({ version: 2 })]]);
    expect(onOrder.mock.calls).toEqual([[{ id: "o1", closed: true }]]);
    expect(onQueue.mock.calls).toEqual([[["o2", "o3"]]]);
  });

  it("reads the order once when the stream opens", async () => {
    const { fetch, demo } = client(async () => json({ position: 3, closed: false }, 200));
    const onOrder = vi.fn();
    let openOrder: string | null = "6f1c4a52-3a43-4c38-9a71-0c2b8f1d2e3a";
    demo.subscribe({ onOrder, openOrderId: () => openOrder });
    const stream = FakeStream.opened[0];
    stream?.open();
    await vi.waitFor(() => expect(onOrder).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(`${API}/test-purchases/${openOrder}`, { signal: expect.any(AbortSignal) });
    expect(onOrder).toHaveBeenCalledWith({ id: openOrder, closed: false, position: 3 });
    stream?.send(demoPayment());
    stream?.send({ type: "queue", waiting: [] }, "queue");
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    openOrder = null;
    stream?.drop();
    stream?.open();
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("stops dispatching after unsubscribe", async () => {
    const { demo } = client(async () => json({ position: 0, closed: true }, 200));
    const onOrder = vi.fn();
    const stop = demo.subscribe({ onOrder, openOrderId: () => "o1" });
    const stream = FakeStream.opened[0];
    stream?.open();
    stop();
    expect(stream?.closed).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onOrder).not.toHaveBeenCalled();
  });
});

describe("DemoClient.stats", () => {
  const stats = { settledCount: 7, averageTimeToSettleMs: null, duplicatesSkipped: 3, failuresRecovered: 1 };

  it("reads today's figures", async () => {
    const { fetch, demo } = client(async () => json(stats, 200));
    await expect(demo.stats()).resolves.toEqual(stats);
    expect(fetch).toHaveBeenCalledWith(`${API}/stats`, { signal: expect.any(AbortSignal) });
  });

  it("returns null for figures it cannot read", async () => {
    for (const respond of [
      async () => json({ ...stats, settledCount: "7" }, 200),
      async () => json({ error: "internal" }, 500),
      () => Promise.reject(new TypeError("Failed to fetch")),
    ]) {
      const { demo } = client(respond);
      await expect(demo.stats()).resolves.toBeNull();
    }
  });
});

describe("DemoClient.health", () => {
  it("reads whether the card rail is available and the confirmation target", async () => {
    const { demo } = client(async () => json({ cardAvailable: true, confirmations: 10 }, 200));
    await expect(demo.health()).resolves.toEqual({ cardAvailable: true, confirmations: 10 });
  });

  it("returns null when health cannot be read", async () => {
    const { demo } = client(() => Promise.reject(new TypeError("Failed to fetch")));
    await expect(demo.health()).resolves.toBeNull();
  });
});

/** A request that never answers and only ends when its signal aborts, as a half-open connection does. */
const hangs = (_input: string, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
  });

describe("request deadlines", () => {
  it("times out a request without AbortSignal.timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("AbortSignal", { abort: AbortSignal.abort.bind(AbortSignal) });
    const { demo } = client(hangs);
    const read = demo.stats();
    await vi.advanceTimersByTimeAsync(READ_DEADLINE_MS);
    await expect(read).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it("clears the request timer on every path", async () => {
    vi.useFakeTimers();
    const answers: (() => Promise<Response>)[] = [
      async () =>
        json({ settledCount: 1, averageTimeToSettleMs: null, duplicatesSkipped: 0, failuresRecovered: 0 }, 200),
      async () => json({ error: "internal" }, 500),
      () => Promise.reject(new TypeError("Failed to fetch")),
    ];
    for (const answer of answers) {
      const { demo } = client(answer);
      await demo.stats();
      await demo.health();
      await demo.payments(5);
      await demo.order("a");
      await demo.purchase("card");
      expect(vi.getTimerCount()).toBe(0);
    }
    const { demo } = client(hangs);
    const pending = demo.stats();
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(READ_DEADLINE_MS);
    await pending;
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows a purchase that times out as uncertain", async () => {
    vi.useFakeTimers();
    const { demo } = client(hangs);
    const result = demo.purchase("card");
    await vi.advanceTimersByTimeAsync(PURCHASE_DEADLINE_MS - 1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toEqual({ kind: "uncertain" });
  });

  it("treats a purchase reply that stalls mid-body as uncertain", async () => {
    vi.useFakeTimers();
    const { demo } = client(async (_input, init) => {
      const body = new ReadableStream({
        start(controller) {
          init?.signal?.addEventListener("abort", () => controller.error(init.signal?.reason));
        },
      });
      return new Response(body, { status: 202 });
    });
    const result = demo.purchase("card");
    await vi.advanceTimersByTimeAsync(PURCHASE_DEADLINE_MS);
    await expect(result).resolves.toEqual({ kind: "uncertain" });
  });
});
