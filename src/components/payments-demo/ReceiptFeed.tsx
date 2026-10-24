import clsx from "clsx";
import { useSyncExternalStore, type ReactNode } from "react";
import { LIVE_PAUSED } from "@/lib/payments-demo/copy";
import type { DemoPayment } from "@/lib/payments-demo/types";
import { duration, isPaid, money, paymentLink, railOf } from "@/components/home/PaymentsBand/format";
import { Receipt, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";

const noop = () => () => {};
/** False on the server and during hydration, true after, so times render in the visitor's locale without a mismatch. */
const useMounted = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

function stage(payment: DemoPayment, needed?: number): string {
  switch (payment.stage) {
    case "sent":
      return "Sent";
    case "received":
      return "Received";
    case "confirming":
      return needed
        ? `Confirming ${Math.min(payment.confirmations, needed)}/${needed}`
        : `Confirming ${payment.confirmations}`;
    case "processing":
      return "Processing";
    case "settled":
      return "Settled";
    case "notified":
      return "Shop notified";
    case "failed":
      return "Did not go through";
  }
}

function settledIn(payment: DemoPayment): string | null {
  const start = payment.sentAt ?? payment.receivedAt;
  if (!isPaid(payment) || !start || !payment.settledAt) return null;
  const ms = Date.parse(payment.settledAt) - Date.parse(start);
  return Number.isFinite(ms) && ms >= 0 ? `settled in ${duration(ms)}` : null;
}

const itemOf = (payment: DemoPayment) =>
  payment.order?.item ?? (payment.donation ? `Gift from ${payment.donorName ?? "a visitor"}` : "Test purchase");

const when = (payment: DemoPayment) => {
  const at = payment.sentAt ?? payment.receivedAt;
  return at
    ? new Date(at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
};

type RowProps = { payment: DemoPayment; mounted: boolean; needed?: number; yours: boolean };

const Row = ({ payment, mounted, needed, yours }: RowProps) => {
  const failed = payment.stage === "failed";
  const link = paymentLink(payment);
  const details = [railOf(payment) === "card" ? "Test card" : "Test network", settledIn(payment)].filter(Boolean);
  return (
    <li className="border-line border-b-[1.5px] border-dashed py-2 last:border-0">
      <div className="flex gap-1.5 font-bold">
        <span className="min-w-0 truncate">{itemOf(payment)}</span>
        {yours && (
          <span className="bg-ink text-paper self-center rounded-sm px-1 text-[11px] leading-4 tracking-[0.08em] uppercase">
            Yours
          </span>
        )}
        <span
          aria-hidden="true"
          className="border-muted min-w-3 flex-1 -translate-y-1.5 border-b-[1.5px] border-dotted"
        />
        <span>{money(payment.order?.price ?? payment.amount)}</span>
      </div>
      <div className="flex justify-between gap-3 text-[12px] leading-5">
        <span className={clsx(failed && "text-accent-strong font-bold")}>{stage(payment, needed)}</span>
        <span className="text-muted whitespace-nowrap">{mounted ? when(payment) : ""}</span>
      </div>
      <div className="text-muted flex justify-between gap-3 text-[12px] leading-5">
        <span>{details.join(", ")}</span>
        {link && (
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap underline underline-offset-4"
          >
            {link.label} ↗
          </a>
        )}
      </div>
    </li>
  );
};

type Props = {
  payments: DemoPayment[];
  paused: boolean;
  /** The Show more button, the calm failure line or the end line. */
  footer: ReactNode;
  /** The line shown when there are no receipts. */
  empty?: string;
  /** Confirmations a network payment settles at, when known. */
  confirmations?: number;
  /** The visitor's own order ids, whose receipts are marked "Yours". */
  mine?: ReadonlyMap<string, unknown>;
};

/** The recent receipts, newest first, as one long receipt. */
export const ReceiptFeed = ({
  payments,
  paused,
  footer,
  empty = "No test purchases yet.",
  confirmations,
  mine,
}: Props) => {
  const mounted = useMounted();
  return (
    <Receipt className="px-5 pt-6 pb-10 text-[14px] leading-6 sm:px-6">
      <ReceiptTitle>RECENT RECEIPTS</ReceiptTitle>
      <div className="text-muted mt-1 flex h-5 justify-center text-[12px]">{paused && <span>{LIVE_PAUSED}</span>}</div>
      <ReceiptRule />
      {payments.length ? (
        <ul aria-label="Recent receipts">
          {payments.map((payment) => (
            <Row
              key={payment.id}
              payment={payment}
              mounted={mounted}
              needed={confirmations}
              yours={!!payment.orderId && !!mine?.has(payment.orderId)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted py-4 text-center">{empty}</p>
      )}
      <ReceiptRule />
      <div className="text-center">{footer}</div>
    </Receipt>
  );
};
