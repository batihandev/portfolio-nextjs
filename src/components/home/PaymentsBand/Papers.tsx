import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import { DEMO_COPY, IDLE_COPY, type ShopState } from "@/lib/payments-demo/copy";
import type { DemoPayment, DemoRail } from "@/lib/payments-demo/types";
import { Receipt, ReceiptRow, ReceiptTitle } from "@/components/ui/Receipt";
import { isPaid, money, paymentLink, printSteps, railName, stageRows, type StageRow } from "./format";

/** A visitor's test purchase as the band follows it. */
export type Purchase = {
  orderId: string;
  item: string;
  price: string;
  rail: DemoRail;
  payment: DemoPayment | null;
  /** The order ended without a payment. */
  closed: boolean;
  /** Place in the queue of visitor orders, 1 being next. */
  position?: number;
  /** The order's expiry passed without it reporting back. */
  expired?: boolean;
};

/** Ended unpaid: the order closed, its payment failed, or it expired before a payment was sent. */
export const purchaseFailed = (purchase: Purchase) =>
  purchase.closed || purchase.payment?.stage === "failed" || (!!purchase.expired && !purchase.payment);
/** Nothing more to wait for. A payment still on its way at expiry keeps printing, but no longer holds the buttons. */
export const purchaseDone = (purchase: Purchase) =>
  purchaseFailed(purchase) || !!purchase.expired || (!!purchase.payment && isPaid(purchase.payment));

/** Band paper fills the printer's height, so a short receipt still reaches the sizer's torn edge. */
export const Paper = ({ children }: { children: ReactNode }) => (
  <div className="h-full *:*:h-full *:h-full">
    <Receipt className="px-5 pt-3.5 pb-5 text-[13px] leading-[20px]">{children}</Receipt>
  </div>
);

const Rule = () => <hr className="border-line my-2 border-t-[1.5px] border-dashed" />;

/** A dashed rule with a small label in the middle. */
const LabelledRule = ({ children }: { children: ReactNode }) => (
  <div className="text-muted my-1 flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase">
    <span aria-hidden="true" className="border-line flex-1 border-t-[1.5px] border-dashed" />
    {children}
    <span aria-hidden="true" className="border-line flex-1 border-t-[1.5px] border-dashed" />
  </div>
);

/** Shown before the first purchase; while the shop takes no purchases it says why instead. */
export const IntroPaper = ({ state = null }: { state?: ShopState | null }) => (
  <Paper>
    <ReceiptTitle>TEST SHOP</ReceiptTitle>
    <Rule />
    <p>
      {state ? (
        IDLE_COPY[state]
      ) : (
        <>
          <span className="text-accent-strong font-bold">Press a button above</span> to buy a small test item. Each step
          of the payment prints here as it happens.
        </>
      )}
    </p>
    <p className="text-muted mt-2">Test money only.</p>
  </Paper>
);

export const RESTING_LINE = "The demo is resting right now. Come back soon to send a test payment.";

/** Shown when there is nothing to show: no snapshot, or the band failed to render. */
export const RestingPaper = () => (
  <Paper>
    <ReceiptTitle>TEST SHOP</ReceiptTitle>
    <Rule />
    <p>{RESTING_LINE}</p>
  </Paper>
);

const time = (at: string | null) => (at ? new Date(at).toLocaleTimeString() : "");

/**
 * A receipt row's motion: the row in progress pulses, a reached one prints in behind rows that arrived with it, and
 * a later one is muted. Both animations set the animation, so a row has one or the other.
 */
export const rowMotion = (current: boolean, reached: boolean) =>
  current ? "motion-safe:animate-pulse" : reached ? "stage-print" : "text-muted";

/** A reached row prints in; `step` delays it behind rows that arrived with it. */
const Stage = ({ row, current, step }: { row: StageRow; current: boolean; step: number }) => (
  <div
    data-testid={`stage-${row.stage}`}
    data-reached={row.reached}
    data-current={current}
    data-print-step={step}
    style={{ "--print-step": step } as CSSProperties}
    className={rowMotion(current, row.reached)}
  >
    <ReceiptRow
      label={row.label}
      value={
        row.progress && (current || row.reached) ? row.progress : row.reached ? time(row.at) || "✓" : current ? "…" : ""
      }
    />
  </div>
);

export function statusLine(purchase: Purchase): string {
  if (purchaseFailed(purchase)) return DEMO_COPY.not_completed;
  if (purchase.payment && isPaid(purchase.payment)) return "Paid with test money. Thank you.";
  if (purchase.payment) return "On its way.";
  if (purchase.position && purchase.position > 1) return `In line, ${purchase.position - 1} ahead.`;
  return "Waiting to send.";
}

/** The receipt for the visitor's purchase. It is only ever rendered in the browser, so times use the visitor's locale. */
export const PurchasePaper = ({ purchase, confirmations }: { purchase: Purchase; confirmations: number }) => {
  const rows = stageRows(purchase.rail, purchase.payment, confirmations);
  const link = paymentLink(purchase.payment);
  const steps = printSteps(rows);
  const failed = purchaseFailed(purchase);
  const current = failed ? -1 : rows.findIndex((row) => row.active || !row.reached);
  return (
    <Paper>
      <div className="flex gap-1.5 font-bold">
        <span className="min-w-0 truncate">{purchase.item}</span>
        <span
          aria-hidden="true"
          className="border-muted min-w-3 flex-1 -translate-y-1.5 border-b-[1.5px] border-dotted"
        />
        <span>{money(purchase.price)}</span>
      </div>
      <LabelledRule>{railName(purchase.rail)}</LabelledRule>
      {rows.map((row, i) => (
        // A new key when the row is reached remounts it, so its print-in plays once then.
        <Stage key={`${row.stage}-${row.reached}`} row={row} current={i === current} step={steps[i] ?? 0} />
      ))}
      <Rule />
      <p>
        <span aria-live="polite" className={clsx(failed && "text-accent-strong font-bold")}>
          {statusLine(purchase)}
        </span>
      </p>
      {link && (
        <p className="mt-1">
          <a href={link.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {link.label} ↗
          </a>
        </p>
      )}
    </Paper>
  );
};

const SIZER_PAYMENT: DemoPayment = {
  id: "",
  provider: "stripe",
  amount: "1300000",
  stage: "failed",
  confirmations: 0,
  donation: false,
  final: true,
  orderId: null,
  transactionHash: null,
  receiptUrl: null,
  sentAt: null,
  receivedAt: null,
  confirmingAt: null,
  processingAt: null,
  settledAt: null,
  notifiedAt: null,
  donorName: null,
};

/** The tallest paper the band prints: a failed purchase with a long item name, a two-line notice and a link. */
export const SizerPaper = () => (
  <PurchasePaper
    purchase={{
      orderId: "",
      item: "Slightly haunted spoon",
      price: "1300000",
      rail: "card",
      payment: {
        ...SIZER_PAYMENT,
        receiptUrl: "https://pay.stripe.com/receipts/sizer",
      },
      closed: true,
    }}
    // A card purchase shows no confirmation count, so the target does not change its height.
    confirmations={1}
  />
);
