import type { DemoPayment, DemoRail } from "@/lib/payments-demo/types";

export type TimelineRow = {
  label: string;
  /** When the step was reached, as an ISO string, if the payment says. */
  at: string | null;
  /** Time since the step before it was reached, when both times are known. */
  gapMs: number | null;
  /** A short fact about the step, such as the block or the confirmation count. */
  detail: string | null;
  reached: boolean;
  /** The step the payment is waiting on now. */
  current: boolean;
};

type Step = { label: string; at: string | null; detail?: string | null; inProgress?: boolean };

/** One row per step of the visitor's payment, with real times; `needed` is the confirmations it settles at. */
export function timelineRows(rail: DemoRail, payment: DemoPayment | null, needed: number): TimelineRow[] {
  const settled = !!payment?.settledAt;
  const middle: Step[] =
    rail === "chain"
      ? [
          {
            label: "In a block",
            at: payment?.receivedAt ?? null,
            detail: payment?.blockNumber ? `block ${Number(payment.blockNumber).toLocaleString("en-US")}` : null,
          },
          {
            label: "Confirming",
            at: payment?.confirmingAt ?? null,
            detail:
              payment?.confirmingAt || settled
                ? `${settled ? needed : Math.min(payment?.confirmations ?? 0, needed)}/${needed}`
                : null,
            inProgress: payment?.stage === "confirming",
          },
        ]
      : [{ label: "Processing", at: payment?.processingAt ?? null, inProgress: payment?.stage === "processing" }];
  const steps: Step[] = [
    { label: "Sent", at: payment ? (payment.sentAt ?? payment.receivedAt) : null },
    ...middle,
    { label: "Settled", at: payment?.settledAt ?? null },
    {
      label: "Shop notified",
      at: payment?.notifiedAt ?? null,
      detail: payment?.notifiedAt ? "signed notice accepted" : null,
    },
  ];
  const failed = payment?.stage === "failed";
  const current = failed ? -1 : steps.findIndex((step) => step.inProgress || !step.at);
  let previous: number | null = null;
  return steps.map((step, i) => {
    const time = step.at ? Date.parse(step.at) : Number.NaN;
    const gapMs = Number.isFinite(time) && previous !== null ? time - previous : null;
    if (Number.isFinite(time)) previous = time;
    return {
      label: step.label,
      at: step.at,
      gapMs,
      detail: step.detail ?? null,
      reached: !!step.at,
      current: i === current,
    };
  });
}
