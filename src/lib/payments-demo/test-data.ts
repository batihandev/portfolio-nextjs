import type { DemoPayment } from "./types";

/** A settled test card payment; tests override the fields they care about. */
export function demoPayment(overrides: Partial<DemoPayment> = {}): DemoPayment {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    provider: "stripe",
    amount: "500",
    stage: "settled",
    confirmations: 0,
    donation: false,
    final: true,
    orderId: null,
    transactionHash: null,
    receiptUrl: null,
    sentAt: "2026-10-24T10:00:00.000Z",
    receivedAt: null,
    confirmingAt: null,
    processingAt: null,
    settledAt: "2026-10-24T10:00:03.000Z",
    notifiedAt: null,
    donorName: null,
    ...overrides,
  };
}
