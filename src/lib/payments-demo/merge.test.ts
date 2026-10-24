import { describe, expect, it } from "vitest";
import { mergePayments } from "./merge";
import { demoPayment } from "./test-data";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const at = (second: number) => new Date(Date.UTC(2026, 9, 24, 10, 0, second)).toISOString();

describe("mergePayments", () => {
  it("keeps the higher version when merging", () => {
    const newer = demoPayment({ id: id(1), stage: "settled", version: 4 });
    const older = demoPayment({ id: id(1), stage: "processing", version: 3 });
    expect(mergePayments([newer], [older], 10)).toEqual([newer]);
    expect(mergePayments([older], [newer], 10)).toEqual([newer]);
  });

  it("takes the incoming copy when either side has no version", () => {
    const held = demoPayment({ id: id(1), stage: "settled", version: 4 });
    const incoming = demoPayment({ id: id(1), stage: "processing" });
    expect(mergePayments([held], [incoming], 10)).toEqual([incoming]);
  });

  it("keeps the order details that a stream event leaves out", () => {
    const order = { id: id(9), item: "Coffee", price: "500" };
    const held = demoPayment({ id: id(1), orderId: order.id, order, stage: "processing" });
    const incoming = demoPayment({ id: id(1), orderId: order.id, stage: "settled" });
    expect(mergePayments([held], [incoming], 10)).toEqual([{ ...incoming, order }]);
  });

  it("sorts newest first by sent or received time, then by id", () => {
    const first = demoPayment({ id: id(1), sentAt: at(1) });
    const received = demoPayment({ id: id(2), sentAt: null, receivedAt: at(3) });
    const tieLow = demoPayment({ id: id(3), sentAt: at(2) });
    const tieHigh = demoPayment({ id: id(4), sentAt: at(2) });
    expect(mergePayments([first, tieLow], [received, tieHigh], 10).map((p) => p.id)).toEqual([
      id(2),
      id(4),
      id(3),
      id(1),
    ]);
  });

  it("keeps the list bounded", () => {
    const held = Array.from({ length: 6 }, (_, n) => demoPayment({ id: id(n), sentAt: at(n) }));
    const incoming = [demoPayment({ id: id(10), sentAt: at(10) })];
    const merged = mergePayments(held, incoming, 5);
    expect(merged).toHaveLength(5);
    expect(merged.map((p) => p.id)).toEqual([id(10), id(5), id(4), id(3), id(2)]);
  });
});
