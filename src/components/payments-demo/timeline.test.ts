import { describe, expect, it } from "vitest";
import { demoPayment } from "@/lib/payments-demo/test-data";
import { timelineRows } from "./timeline";

const at = (ms: number) => new Date(Date.parse("2026-10-24T10:00:00.000Z") + ms).toISOString();

describe("timelineRows", () => {
  it("gives a network payment its block, confirmations and the gap between steps", () => {
    const rows = timelineRows(
      "chain",
      demoPayment({
        provider: "chain",
        stage: "notified",
        confirmations: 14,
        blockNumber: "49554051",
        sentAt: at(0),
        receivedAt: at(2300),
        confirmingAt: at(3000),
        settledAt: at(9500),
        notifiedAt: at(10100),
      }),
      10,
    );

    expect(rows.map((row) => [row.label, row.gapMs, row.detail])).toEqual([
      ["Sent", null, null],
      ["In a block", 2300, "block 49,554,051"],
      ["Confirming", 700, "10/10"],
      ["Settled", 6500, null],
      ["Shop notified", 600, "signed notice accepted"],
    ]);
    expect(rows.every((row) => row.reached)).toBe(true);
  });

  it("marks the step in progress and leaves later steps unreached", () => {
    const rows = timelineRows(
      "chain",
      demoPayment({
        provider: "chain",
        stage: "confirming",
        confirmations: 4,
        sentAt: at(0),
        receivedAt: at(2000),
        confirmingAt: at(2500),
        settledAt: null,
      }),
      10,
    );

    expect(rows.map((row) => [row.label, row.reached, row.current, row.detail])).toEqual([
      ["Sent", true, false, null],
      ["In a block", true, false, null],
      ["Confirming", true, true, "4/10"],
      ["Settled", false, false, null],
      ["Shop notified", false, false, null],
    ]);
  });

  it("gives a card payment its processing step", () => {
    const rows = timelineRows(
      "card",
      demoPayment({ sentAt: at(0), processingAt: at(200), settledAt: at(500), notifiedAt: null, stage: "settled" }),
      10,
    );

    expect(rows.map((row) => [row.label, row.gapMs, row.current])).toEqual([
      ["Sent", null, false],
      ["Processing", 200, false],
      ["Settled", 300, false],
      ["Shop notified", null, true],
    ]);
  });

  it("starts with Sent in progress before the payment is seen", () => {
    const rows = timelineRows("chain", null, 10);
    expect(rows[0]).toMatchObject({ label: "Sent", reached: false, current: true });
    expect(rows.slice(1).every((row) => !row.reached && !row.current)).toBe(true);
  });
});
