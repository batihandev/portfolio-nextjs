/** The rails a visitor can pay with: "test card" and "test network". */
export type DemoRail = "card" | "chain";

export const demoStages = ["sent", "received", "confirming", "processing", "settled", "notified", "failed"] as const;
export type DemoStage = (typeof demoStages)[number];

/** A payment as the demo API publishes it. Times are ISO strings; amounts are integer strings. */
export type DemoPayment = {
  id: string;
  provider: "chain" | "stripe";
  amount: string;
  stage: DemoStage;
  confirmations: number;
  donation: boolean;
  final: boolean;
  orderId: string | null;
  transactionHash: string | null;
  /** The block a network payment's transfer is in, as a decimal string; list reads and stream events carry it. */
  blockNumber?: string | null;
  /** Stripe's receipt page for a card payment. */
  receiptUrl: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  confirmingAt: string | null;
  processingAt: string | null;
  settledAt: string | null;
  notifiedAt: string | null;
  donorName: string | null;
  /** Raised by every update to the payment; the copy with the higher one is newer. */
  version?: number;
  /** Present on list reads; stream events leave it out. */
  order?: DemoOrder | null;
  /** The block explorer page for the transfer; older copies may leave it out. */
  explorerUrl?: string | null;
};

export type DemoOrder = {
  id: string;
  item: string;
  price: string;
  customer?: { cardBrand: string | null; cardLast4: string | null } | null;
};

/** Today's figures, in UTC. */
export type DemoStats = {
  settledCount: number;
  averageTimeToSettleMs: number | null;
  duplicatesSkipped: number;
  failuresRecovered: number;
};

/** One UTC day of settled payments, oldest day first in the list. */
export type DemoDay = {
  day: string;
  settled: number;
  scheduled: number;
  visitor: number;
  averageTimeToSettleMs: number | null;
};

/** `confirmations` is the number of blocks on top a network payment waits for before it settles. */
export type DemoHealth = { cardAvailable: boolean; confirmations: number };

export type DemoSnapshot = {
  payments: DemoPayment[];
  stats: DemoStats;
  /** Blocks on top a network payment waits for, from the demo's health. */
  confirmations: number;
  daily: DemoDay[];
  /** When the server read the snapshot, as an ISO string. */
  fetchedAt: string;
};
