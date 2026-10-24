import type { DemoPayment, DemoRail, DemoStats } from "@/lib/payments-demo/types";

const UNITS = 1_000_000n;

/** Amounts are integer strings in millionths of a dollar: "500000" is $0.50. */
export function money(value: string): string {
  try {
    const units = BigInt(value);
    return `$${units / UNITS}.${((units % UNITS) / 10_000n).toString().padStart(2, "0")}`;
  } catch {
    return value;
  }
}

export const railOf = (payment: Pick<DemoPayment, "provider">): DemoRail =>
  payment.provider === "stripe" ? "card" : "chain";

export const railName = (rail: DemoRail) => (rail === "card" ? "Test card" : "Test network");

const done = new Set(["settled", "notified"]);
export const isPaid = (payment: Pick<DemoPayment, "stage">) => done.has(payment.stage);

/** The one-word stage on a list stub. */
export function stubStage(payment: Pick<DemoPayment, "stage">): string {
  switch (payment.stage) {
    case "sent":
    case "received":
      return "Sent";
    case "confirming":
      return "Confirming";
    case "processing":
      return "Processing";
    case "failed":
      return "Not paid";
    default:
      return "Settled";
  }
}

/** "under 1 s", "4 s", "3 min 4 s" or "2 h 5 min". */
export function duration(ms: number): string {
  if (ms < 1000) return "under 1 s";
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return seconds % 60 ? `${minutes} min ${seconds % 60} s` : `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
}

export type PaymentLink = { href: string; label: string };

/** Where to see a payment outside the demo: the block explorer for a transfer, Stripe's receipt for a card. */
export function paymentLink(payment: DemoPayment | null): PaymentLink | null {
  const [href, label] =
    payment?.provider === "chain"
      ? [payment.explorerUrl, "View on block explorer"]
      : [payment?.receiptUrl, "Stripe receipt"];
  return href?.startsWith("https://") ? { href, label } : null;
}

const startOf = (payment: DemoPayment) => payment.sentAt ?? payment.receivedAt;

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

export type BandFigures = {
  /** Payments settled this UTC day; null while only an earlier day's figures are known. */
  settledToday: number | null;
  /** Median time from sent to settled, in ms, for each rail over the recent payments. */
  medianSettleMs: Record<DemoRail, number | null>;
  card: number;
  network: number;
  /** Repeated payment events the demo recognised and skipped this UTC day; null as for settledToday. */
  duplicatesSkipped: number | null;
};

const settleTimes = (payments: DemoPayment[]) =>
  payments.flatMap((payment) => {
    const start = startOf(payment);
    if (!start || !payment.settledAt) return [];
    const ms = Date.parse(payment.settledAt) - Date.parse(start);
    return Number.isFinite(ms) && ms >= 0 ? [ms] : [];
  });

/**
 * The strip's figures: the day's counts from the stats, the rest from the recent payments. Without
 * stats for today the day's counts are null.
 */
export function bandFigures(stats: DemoStats | null, recent: DemoPayment[], settledSinceStats = 0): BandFigures {
  const card = recent.filter((payment) => railOf(payment) === "card");
  const network = recent.filter((payment) => railOf(payment) === "chain");
  return {
    settledToday: stats && stats.settledCount + settledSinceStats,
    medianSettleMs: { card: median(settleTimes(card)), chain: median(settleTimes(network)) },
    card: card.length,
    network: network.length,
    duplicatesSkipped: stats && stats.duplicatesSkipped,
  };
}

export type StageRow = {
  stage: "sent" | "confirming" | "processing" | "settled" | "notified";
  label: string;
  /** When the stage was reached, as an ISO string, if the payment says. */
  at: string | null;
  reached: boolean;
  /** Reached but not finished: the payment is confirming or processing. */
  active?: boolean;
  /** Extra progress for the row, such as "4/10" confirmations. */
  progress?: string;
};

/** Stages reached within this long of the one before print one after another. */
const PRINT_TOGETHER_MS = 1000;

/** Each row's place in a run of reached rows that arrived together: 0 for the first, then 1, 2 and on. */
export function printSteps(rows: Pick<StageRow, "reached" | "at">[]): number[] {
  let run = 0;
  let last: number | null = null;
  return rows.map((row) => {
    const at = row.reached && row.at ? Date.parse(row.at) : Number.NaN;
    if (!Number.isFinite(at)) {
      last = null;
      run = 0;
      return 0;
    }
    run = last !== null && at - last < PRINT_TOGETHER_MS ? run + 1 : 0;
    last = at;
    return run;
  });
}

const order: Record<DemoPayment["stage"], number> = {
  sent: 0,
  received: 0,
  confirming: 1,
  processing: 1,
  settled: 2,
  notified: 3,
  failed: -1,
};

/**
 * The receipt's stage rows for a rail; a payment not yet seen has every row unreached. `needed` is
 * the number of confirmations a network payment settles at.
 */
export function stageRows(rail: DemoRail, payment: DemoPayment | null, needed: number): StageRow[] {
  const step = payment ? order[payment.stage] : -1;
  const reached = (index: number, at: string | null | undefined) => step >= index || !!at;
  const middle: StageRow =
    rail === "card"
      ? {
          stage: "processing",
          label: "Processing",
          at: payment?.processingAt ?? null,
          reached: reached(1, payment?.processingAt),
          active: step === 1,
        }
      : {
          stage: "confirming",
          label: "Confirming",
          at: payment?.confirmingAt ?? null,
          reached: reached(1, payment?.confirmingAt),
          active: step === 1,
          // Counted only once the tracker has seen the transfer's block.
          progress:
            payment && payment.stage !== "sent"
              ? `${step > 1 ? needed : Math.min(payment.confirmations, needed)}/${needed}`
              : undefined,
        };
  const sentAt = payment ? startOf(payment) : null;
  return [
    { stage: "sent", label: "Sent", at: sentAt ?? null, reached: !!payment && (step >= 0 || !!sentAt) },
    middle,
    { stage: "settled", label: "Settled", at: payment?.settledAt ?? null, reached: reached(2, payment?.settledAt) },
    {
      stage: "notified",
      label: "Shop notified",
      at: payment?.notifiedAt ?? null,
      reached: reached(3, payment?.notifiedAt),
    },
  ];
}
