import type { DemoOrder } from "./types";

// The visitor's own orders, kept in this browser so the list still marks them after a reload.
const MINE_KEY = "payments-demo-orders";
/** The list shows at most this many payments, so older orders can never be marked. */
const MINE_LIMIT = 20;

const isOrder = (value: unknown): value is DemoOrder =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as DemoOrder).id === "string" &&
  typeof (value as DemoOrder).item === "string" &&
  typeof (value as DemoOrder).price === "string";

const parse = (raw: string | null): Map<string, DemoOrder> => {
  try {
    const stored: unknown = JSON.parse(raw ?? "[]");
    return new Map(Array.isArray(stored) ? stored.filter(isOrder).map((order) => [order.id, order]) : []);
  } catch {
    return new Map();
  }
};

const read = () => {
  try {
    return localStorage.getItem(MINE_KEY);
  } catch {
    return null;
  }
};

const none: ReadonlyMap<string, DemoOrder> = new Map();
const listeners = new Set<() => void>();
// The parsed orders and the stored text they came from; a browser that refuses storage keeps them in memory.
let current = none;
let currentRaw: string | null | undefined;

export const mine = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },
  getSnapshot(): ReadonlyMap<string, DemoOrder> {
    const raw = read();
    if (raw !== currentRaw) {
      currentRaw = raw;
      current = parse(raw);
    }
    return current;
  },
  getServerSnapshot: () => none,
  add(order: DemoOrder) {
    const next = new Map(mine.getSnapshot()).set(order.id, order);
    current = new Map([...next].slice(-MINE_LIMIT));
    try {
      localStorage.setItem(MINE_KEY, JSON.stringify([...current.values()]));
    } catch {
      // Marking "Yours" is a convenience; without storage it lasts until the page reloads.
    }
    currentRaw = read();
    listeners.forEach((notify) => notify());
  },
};
