import clsx from "clsx";
import type { CSSProperties } from "react";
import type { DemoPayment } from "@/lib/payments-demo/types";
import { BandPrinter, BandSlot } from "@/components/home/PaymentsBand/BandFrame";
import { duration, money, paymentLink, printSteps, railName } from "@/components/home/PaymentsBand/format";
import {
  IntroPaper,
  Paper,
  purchaseFailed,
  RestingPaper,
  rowMotion,
  statusLine,
  type Purchase,
} from "@/components/home/PaymentsBand/Papers";
import { PurchaseSlot } from "@/components/home/PaymentsBand/PayKeys";
import type { usePrinter } from "@/components/home/PaymentsBand/usePrinter";
import type { usePurchase } from "@/components/home/PaymentsBand/usePurchase";
import { ReceiptRow } from "@/components/ui/Receipt";
import { timelineRows } from "./timeline";

/** The panel's anchor, so the page's Try a test payment button lands on it. */
export const TRY_PAYMENT_ID = "try-payment";

/** "+2.3 s" below a minute, then the band's durations. */
const gap = (ms: number) => (ms < 60_000 ? `+${(Math.max(0, ms) / 1000).toFixed(1)} s` : `+${duration(ms)}`);

/** The time with tenths of a second, in the visitor's locale. Only rendered after a purchase, so never on the server. */
const clock = (at: string) =>
  new Date(at).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 1,
  });

const Rule = () => <hr className="border-line my-2 border-t-[1.5px] border-dashed" />;

/** The visitor's purchase as a receipt: each step with its time, then the gap since the step before and what was recorded. */
const TimelinePaper = ({ purchase, confirmations }: { purchase: Purchase; confirmations: number }) => {
  const rows = timelineRows(purchase.rail, purchase.payment, confirmations);
  const steps = printSteps(rows);
  const link = paymentLink(purchase.payment);
  const failed = purchaseFailed(purchase);
  const first = rows[0]?.at;
  const last = rows.at(-1)?.at;
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
      <p className="text-muted text-[11px] tracking-[0.12em] uppercase">{railName(purchase.rail)}</p>
      <Rule />
      <ol aria-label="Payment steps" className="grid gap-1">
        {rows.map((row, i) => (
          // A new key when the row is reached remounts it, so its print-in plays once then.
          <li
            key={`${row.label}-${row.reached}`}
            data-current={row.current}
            style={{ "--print-step": steps[i] ?? 0 } as CSSProperties}
            className={rowMotion(row.current, row.reached)}
          >
            <ReceiptRow label={row.label} value={row.at ? clock(row.at) : row.current ? "…" : ""} />
            {(row.gapMs !== null || row.detail) && (
              <div className="text-muted flex justify-between gap-3 text-[12px] leading-5">
                <span>{row.gapMs === null ? "" : gap(row.gapMs)}</span>
                <span className="text-right">{row.detail}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
      <Rule />
      <p>
        <span aria-live="polite" className={clsx(failed && "text-accent-strong font-bold")}>
          {statusLine(purchase)}
        </span>
        {first && last && ` Sent to shop notified in ${duration(Date.parse(last) - Date.parse(first))}.`}
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

const at = (s: number) => new Date(Date.UTC(2026, 0, 1, 12, 0, s)).toISOString();
const SIZER_PAYMENT: DemoPayment = {
  id: "",
  provider: "chain",
  amount: "1300000",
  stage: "notified",
  confirmations: 10,
  donation: false,
  final: true,
  orderId: null,
  transactionHash: null,
  blockNumber: "99999999",
  explorerUrl: "https://sepolia.basescan.org/tx/sizer",
  receiptUrl: null,
  sentAt: at(0),
  receivedAt: at(2),
  confirmingAt: at(4),
  processingAt: null,
  settledAt: at(130),
  notifiedAt: at(150),
  donorName: null,
};

/** The tallest paper the panel prints: a long item name, every step with its details, the total and a link. */
const TimelineSizer = () => (
  <TimelinePaper
    purchase={{
      orderId: "",
      item: "Slightly haunted spoon",
      price: "1300000",
      rail: "chain",
      payment: SIZER_PAYMENT,
      closed: false,
    }}
    confirmations={10}
  />
);

type Props = { buyer: ReturnType<typeof usePurchase>; printer: ReturnType<typeof usePrinter> };

/** The details page's purchase panel: the band's printer, printing a timeline of the visitor's payment. */
export const TryPayment = ({ buyer, printer }: Props) => {
  const shown = printer.shown(buyer.purchase);
  return (
    <div id={TRY_PAYMENT_ID} className="scroll-mt-8">
      <BandPrinter
        slot={<PurchaseSlot buyer={buyer} printing={printer.phase === "feeding"} />}
        sizer={<TimelineSizer />}
        {...printer.feed}
      >
        <div role="region" aria-label={shown ? "Your test payment" : "Test shop"} className="h-full">
          {shown ? (
            <TimelinePaper purchase={shown} confirmations={buyer.confirmations} />
          ) : (
            <IntroPaper state={buyer.shopState} />
          )}
        </div>
      </BandPrinter>
    </div>
  );
};

/** The panel without a snapshot: the same printer, resting, with no keys. */
export const TryPaymentResting = () => (
  <div id={TRY_PAYMENT_ID} className="scroll-mt-8">
    <BandPrinter slot={<BandSlot>{null}</BandSlot>} sizer={<TimelineSizer />} phase="idle" paperKey={0}>
      <RestingPaper />
    </BandPrinter>
  </div>
);
