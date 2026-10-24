import { demoApiUrl } from "./config";
import { paymentCursor } from "./cursor";
import { isHealth, isListOf, isPayment, isStats, readJson } from "./parse";
import type { DemoHealth, DemoPayment, DemoRail, DemoStats } from "./types";

/** How long to wait before reopening a stream the browser gave up on. */
export const STREAM_REOPEN_MS = 30_000;
const DEFAULT_RETRY_SECONDS = 60;
/** How long a read may take, answer included, before it counts as failed. */
export const READ_DEADLINE_MS = 10_000;
/** How long the purchase POST may take. */
export const PURCHASE_DEADLINE_MS = 15_000;
/** EventSource.CLOSED, written out so the module also loads where EventSource is missing. */
const CLOSED = 2;

export type StreamStatus = "live" | "paused";

/** Why a purchase did not start. `unavailable` covers any answer the site does not know. */
export type ClosedReason =
  | "paused"
  | "purchases_unavailable"
  | "card_unavailable"
  | "purchase_pending"
  | "daily_limit"
  | "unavailable"
  | "unreachable";

export type PurchaseResult =
  | {
      kind: "accepted";
      orderId: string;
      item: string;
      price: string;
      expiresAt: string;
      position?: number;
    }
  | { kind: "closed"; reason: ClosedReason }
  | { kind: "busy"; retryAfterSeconds: number }
  /** The request went out but no complete reply came back in time, so the order may exist. */
  | { kind: "uncertain" };

/** An order changed: `closed` means it ended without a payment being sent. */
export type OrderUpdate = { id: string; closed: boolean; position?: number };

export type StreamHandlers = {
  onStatus?: (status: StreamStatus) => void;
  onPayment?: (payment: DemoPayment) => void;
  onOrder?: (update: OrderUpdate) => void;
  /** The ids of the visitor orders still waiting to be sent, in queue order. */
  onQueue?: (waiting: string[]) => void;
  /** The visitor's open order, read again each time the stream opens in case updates were missed. */
  openOrderId?: () => string | null | undefined;
};

/** The parts of EventSource the client uses. */
export type DemoStream = Pick<
  EventSource,
  "readyState" | "onopen" | "onerror" | "onmessage" | "addEventListener" | "close"
>;

type Request = (input: string, init?: RequestInit) => Promise<Response>;

const closedCodes = new Set<string>([
  "paused",
  "purchases_unavailable",
  "card_unavailable",
  "purchase_pending",
  "daily_limit",
]);

function retryAfterSeconds(header: string | null): number {
  if (!header) return DEFAULT_RETRY_SECONDS;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds > 0) return Math.ceil(seconds);
  const date = Date.parse(header);
  if (Number.isNaN(date)) return DEFAULT_RETRY_SECONDS;
  return Math.max(1, Math.ceil((date - Date.now()) / 1000));
}

/** Named events arrive as MessageEvents; the DOM types only promise an Event. */
const dataOf = (event: Event): string =>
  event instanceof MessageEvent && typeof event.data === "string" ? event.data : "";

function readOrderUpdate(data: string): OrderUpdate | null {
  const update = readJson(data) as Record<string, unknown> | undefined;
  return typeof update?.id === "string" && typeof update.closed === "boolean"
    ? { id: update.id, closed: update.closed }
    : null;
}

function readQueue(data: string): string[] | null {
  const update = readJson(data) as Record<string, unknown> | undefined;
  const waiting = update?.waiting;
  return Array.isArray(waiting) && waiting.every((id) => typeof id === "string") ? waiting : null;
}

/** The order in an accepted or pending reply, or null when the body does not carry one. */
function acceptedOrder(
  body: Record<string, unknown> | undefined,
): Extract<PurchaseResult, { kind: "accepted" }> | null {
  const { orderId, item, price, expiresAt, position } = body ?? {};
  if (
    typeof orderId !== "string" ||
    typeof item !== "string" ||
    typeof price !== "string" ||
    typeof expiresAt !== "string"
  )
    return null;
  return { kind: "accepted", orderId, item, price, expiresAt, ...(typeof position === "number" && { position }) };
}

/**
 * Runs one request with a deadline that covers the answer's body too. A controller and a timer
 * stand in for AbortSignal.timeout, which older Safari lacks; the timer is cleared on every path.
 */
async function withDeadline<T>(ms: number, run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("The request timed out", "TimeoutError")), ms);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

/** The demo API from the browser: the live stream, test purchases and the card rail's health. */
export class DemoClient {
  readonly baseUrl: string;

  constructor(
    baseUrl: string,
    private readonly request: Request = (input, init) => fetch(input, init),
    private readonly createStream: (url: string) => DemoStream = (url) => new EventSource(url),
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  /**
   * Opens the event stream. The browser reconnects a dropped stream by itself; only a stream it
   * gave up on, such as one the server refused, is reopened after a pause. Returns the unsubscribe.
   */
  subscribe(handlers: StreamHandlers): () => void {
    let active = true;
    let stream: DemoStream | undefined;
    let status: StreamStatus | undefined;
    let reopen: ReturnType<typeof setTimeout> | undefined;
    const report = (next: StreamStatus) => {
      if (next === status) return;
      status = next;
      handlers.onStatus?.(next);
    };
    const open = () => {
      const current = this.createStream(`${this.baseUrl}/events`);
      stream = current;
      current.onopen = () => {
        report("live");
        const id = handlers.openOrderId?.();
        if (!id) return;
        void this.order(id).then((order) => {
          if (active && order) handlers.onOrder?.({ id, ...order });
        });
      };
      current.onerror = () => {
        report("paused");
        if (current.readyState !== CLOSED) return;
        current.close();
        clearTimeout(reopen);
        reopen = setTimeout(() => {
          if (active) open();
        }, STREAM_REOPEN_MS);
      };
      current.onmessage = (event) => {
        const payment = readJson(dataOf(event));
        if (isPayment(payment)) handlers.onPayment?.(payment);
      };
      current.addEventListener("order", (event) => {
        const update = readOrderUpdate(dataOf(event));
        if (update) handlers.onOrder?.(update);
      });
      current.addEventListener("queue", (event) => {
        const waiting = readQueue(dataOf(event));
        if (waiting) handlers.onQueue?.(waiting);
      });
    };
    open();
    return () => {
      active = false;
      clearTimeout(reopen);
      stream?.close();
    };
  }

  /** Starts a test purchase. Never throws: every refusal and failure is a result. */
  async purchase(rail: DemoRail): Promise<PurchaseResult> {
    let response: Response;
    let text: string;
    let replied = false;
    try {
      ({ response, text } = await withDeadline(PURCHASE_DEADLINE_MS, async (signal) => {
        const reply = await this.request(`${this.baseUrl}/test-purchases`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rail }),
          signal,
        });
        replied = true;
        return { response: reply, text: await reply.text() };
      }));
    } catch (error) {
      // Once the request is out, a stalled or broken reply leaves the order's fate unknown.
      const timedOut = error instanceof DOMException && error.name === "TimeoutError";
      return replied || timedOut ? { kind: "uncertain" } : { kind: "closed", reason: "unreachable" };
    }
    const body = readJson(text) as Record<string, unknown> | undefined;
    if (response.ok) return acceptedOrder(body) ?? { kind: "closed", reason: "unavailable" };
    // The API created the order but could not confirm it is queued. It is still the visitor's order, so it is
    // followed like an accepted one.
    if (body?.error === "purchase_pending") {
      const order = acceptedOrder(body);
      if (order) return order;
    }
    if (response.status === 429)
      return { kind: "busy", retryAfterSeconds: retryAfterSeconds(response.headers.get("retry-after")) };
    const code = body?.error;
    return {
      kind: "closed",
      reason: typeof code === "string" && closedCodes.has(code) ? (code as ClosedReason) : "unavailable",
    };
  }

  /** The order's queue position and whether it closed unpaid, or null when it cannot be read. */
  async order(id: string): Promise<{ position: number; closed: boolean } | null> {
    try {
      return await withDeadline(READ_DEADLINE_MS, async (signal) => {
        const response = await this.request(`${this.baseUrl}/test-purchases/${encodeURIComponent(id)}`, { signal });
        if (!response.ok) return null;
        const body = (await response.json()) as Record<string, unknown>;
        return typeof body.position === "number" && typeof body.closed === "boolean"
          ? { position: body.position, closed: body.closed }
          : null;
      });
    } catch {
      return null;
    }
  }

  /**
   * The newest payments, or with `before` the ones just older than it, or null when they cannot be
   * read. The band reads the newest to fill a gap in the stream; the details page pages back.
   */
  async payments(limit: number, before?: DemoPayment): Promise<DemoPayment[] | null> {
    const query = before ? `&before=${paymentCursor(before)}` : "";
    try {
      return await withDeadline(READ_DEADLINE_MS, async (signal) => {
        const response = await this.request(`${this.baseUrl}/payments?limit=${limit}${query}`, { signal });
        if (!response.ok) return null;
        const body: unknown = await response.json();
        return isListOf(body, isPayment) ? body : null;
      });
    } catch {
      return null;
    }
  }

  /** Today's figures, or null when they cannot be read. */
  async stats(): Promise<DemoStats | null> {
    try {
      return await withDeadline(READ_DEADLINE_MS, async (signal) => {
        const response = await this.request(`${this.baseUrl}/stats`, { signal });
        if (!response.ok) return null;
        const body: unknown = await response.json();
        return isStats(body) ? body : null;
      });
    } catch {
      return null;
    }
  }

  /** Whether the test card rail can take a purchase and the confirmation target, or null when health cannot be read. */
  async health(): Promise<DemoHealth | null> {
    try {
      return await withDeadline(READ_DEADLINE_MS, async (signal) => {
        const response = await this.request(`${this.baseUrl}/health`, { signal });
        if (!response.ok) return null;
        const body: unknown = await response.json();
        return isHealth(body) ? { cardAvailable: body.cardAvailable, confirmations: body.confirmations } : null;
      });
    } catch {
      return null;
    }
  }
}

/** The client for the configured demo, or null when the demo is not configured. */
export function createDemoClient(): DemoClient | null {
  const base = demoApiUrl();
  return base ? new DemoClient(base) : null;
}
