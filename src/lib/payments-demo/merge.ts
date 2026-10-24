import type { DemoPayment } from "./types";

const newestFirst = (a: DemoPayment, b: DemoPayment) =>
  (b.sentAt ?? b.receivedAt ?? "").localeCompare(a.sentAt ?? a.receivedAt ?? "") || b.id.localeCompare(a.id);

/** The incoming copy, unless both carry a version and the held one is higher. */
function newer(held: DemoPayment, incoming: DemoPayment): DemoPayment {
  if (held.version !== undefined && incoming.version !== undefined && held.version > incoming.version) return held;
  // Stream events leave out the order; keep the one already known.
  return {
    ...incoming,
    order: incoming.order ?? (held.orderId === incoming.orderId ? held.order : undefined),
  };
}

const withoutUndefined = (payment: DemoPayment): DemoPayment =>
  Object.fromEntries(Object.entries(payment).filter(([, value]) => value !== undefined)) as DemoPayment;

/** The live list: one copy per payment id, newest first, at most `limit` long. */
export function mergePayments(held: DemoPayment[], incoming: DemoPayment[], limit: number): DemoPayment[] {
  const rows = new Map(held.map((payment) => [payment.id, payment]));
  for (const payment of incoming) {
    const previous = rows.get(payment.id);
    rows.set(payment.id, previous ? withoutUndefined(newer(previous, payment)) : payment);
  }
  return [...rows.values()].sort(newestFirst).slice(0, limit);
}
