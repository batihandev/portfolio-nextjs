import type { ClosedReason, PurchaseResult } from "./client";

/** Everything the band can tell a visitor about a purchase that did not start or finish. */
export type DemoNotice = ClosedReason | "busy" | "visitor_daily_limit" | "not_completed";

export const DEMO_COPY: Record<DemoNotice, string> = {
  paused: "The test shop is closed for now. Try again soon.",
  purchases_unavailable: "The test shop is closed for now. Try again soon.",
  card_unavailable: "Test card payments are closed for now. The test network still works.",
  purchase_pending: "The test shop is slow right now. Your purchase may still show up in the list.",
  daily_limit: "The test shop has sold out for today. Come back tomorrow.",
  unavailable: "The test shop is closed for now. Try again soon.",
  unreachable: "The test shop cannot be reached right now. Try again soon.",
  busy: "Lots of test purchases right now. Try again in a moment.",
  visitor_daily_limit: "You have sent today's test purchases. Come back tomorrow.",
  not_completed: "This test purchase did not go through. Try again.",
};

/** The calm line for a refused purchase, or null for one that was accepted. */
export function noticeFor(result: PurchaseResult): string | null {
  if (result.kind === "accepted") return null;
  if (result.kind === "uncertain") return DEMO_COPY.purchase_pending;
  return DEMO_COPY[result.kind === "busy" ? "busy" : result.reason];
}

/** The quiet note beside a list while its live stream is down. */
export const LIVE_PAUSED = "Live updates paused";

/** Why the test shop takes no purchases right now, as the idle receipt says it. */
export type ShopState = "closed" | "sold_out" | "visitor_done";

export const IDLE_COPY: Record<ShopState, string> = {
  closed: "The test shop is closed for now. The list shows the latest test purchases.",
  sold_out: "The test shop has sold out for today. The list shows the latest test purchases.",
  visitor_done: "You have sent today's test purchases. The list shows the latest ones.",
};
