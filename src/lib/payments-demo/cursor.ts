import type { DemoPayment } from "./types";

/**
 * The demo API's `before` cursor for the payment: URL-safe base64 of `{at, id}`, where `at` is the
 * feed's sort time (sent, else received). A page read before it continues just after this payment.
 */
export function paymentCursor(payment: Pick<DemoPayment, "id" | "sentAt" | "receivedAt">): string {
  return btoa(
    JSON.stringify({
      at: payment.sentAt ?? payment.receivedAt,
      id: payment.id,
    }),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
