"use client";

import { useRef, useState, type ReactNode } from "react";
import { createDemoClient, type DemoClient } from "@/lib/payments-demo/client";
import { mergePayments } from "@/lib/payments-demo/merge";
import { SNAPSHOT_PAYMENTS } from "@/lib/payments-demo/snapshot";
import type { DemoPayment, DemoSnapshot } from "@/lib/payments-demo/types";
import { BandBoundary } from "@/components/home/PaymentsBand/BandBoundary";
import { FiguresStrip } from "@/components/home/PaymentsBand/BandFrame";
import { RESTING_LINE } from "@/components/home/PaymentsBand/Papers";
import { bandFigures } from "@/components/home/PaymentsBand/format";
import { useLivePayments } from "@/components/home/PaymentsBand/useLivePayments";
import { usePrinter } from "@/components/home/PaymentsBand/usePrinter";
import { usePurchase } from "@/components/home/PaymentsBand/usePurchase";
import { ReceiptFeed } from "./ReceiptFeed";
import { SettleChart } from "./SettleChart";
import { TryPayment, TryPaymentResting } from "./TryPayment";

/** How many older receipts one Show more adds. */
export const PAGE_SIZE = 20;

export const OLDER_FAILED = "Older receipts did not load. Try again in a moment.";
export const NO_OLDER = "That is every receipt the demo still keeps.";

type Props = {
  snapshot: DemoSnapshot | null;
  /** The demo API in the browser; the configured one when left out. */
  client?: DemoClient | null;
};

/** The details page's live part: figures, the settle chart and the receipts, or a resting version without a snapshot. */
export const DemoDetails = ({ snapshot, client }: Props) =>
  snapshot ? (
    <BandBoundary fallback={<DetailsResting />}>
      <LiveDetails snapshot={snapshot} client={client} />
    </BandBoundary>
  ) : (
    <DetailsResting />
  );

type LayoutProps = { trial: ReactNode; figures: ReactNode; chart: ReactNode; feed: ReactNode };

/**
 * The figures across the top, then the purchase panel over the chart beside the receipts on a wide screen; on a
 * narrow one the chart comes before the panel. The left column stays in view while the receipts scroll, only on a
 * screen tall enough to show all of it.
 */
const Layout = ({ trial, figures, chart, feed }: LayoutProps) => (
  <div className="grid gap-8">
    {figures}
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 gap-8 lg:top-8 lg:[@media(min-height:52rem)]:sticky">
        {trial}
        <div className="order-first lg:order-none">{chart}</div>
      </div>
      <div className="min-w-0">{feed}</div>
    </div>
  </div>
);

type Paging = "idle" | "loading" | "failed" | "end";

const LiveDetails = ({ snapshot, client: given }: { snapshot: DemoSnapshot; client?: DemoClient | null }) => {
  const [client] = useState(() => (given === undefined ? createDemoClient() : given));
  const [payments, setPayments] = useState(snapshot.payments);
  const [paging, setPaging] = useState<Paging>(snapshot.payments.length < SNAPSHOT_PAYMENTS ? "end" : "idle");
  // The purchase reads this, so a payment that arrived before its purchase answer is found.
  const paymentsRef = useRef(payments);
  const printer = usePrinter();
  const buyer = usePurchase(client, {
    confirmations: snapshot.confirmations,
    payments: () => paymentsRef.current,
    locked: printer.locked,
    onAccepted: printer.print,
  });

  const take = (batch: DemoPayment[]) => {
    const owned = batch.map(buyer.own);
    const list = mergePayments(paymentsRef.current, owned, paymentsRef.current.length + owned.length);
    paymentsRef.current = list;
    setPayments(list);
    for (const payment of owned) buyer.track(payment);
  };
  const { status, stats, settledSince } = useLivePayments(client, snapshot, { onPayments: take, ...buyer.handlers });

  const showMore = async () => {
    const oldest = payments.at(-1);
    if (!client || !oldest || paging === "loading") return;
    setPaging("loading");
    const older = await client.payments(PAGE_SIZE, oldest);
    if (!older) return setPaging("failed");
    take(older);
    setPaging(older.length < PAGE_SIZE ? "end" : "idle");
  };

  const footer =
    paging === "end" ? (
      <p className="text-muted text-[13px]">{NO_OLDER}</p>
    ) : (
      <>
        {paging === "failed" && (
          <p role="status" className="text-muted mb-2 text-[13px]">
            {OLDER_FAILED}
          </p>
        )}
        {client && (
          <button
            type="button"
            onClick={() => void showMore()}
            aria-disabled={paging === "loading"}
            className="border-line bg-paper text-ink min-h-11 rounded border-[1.5px] px-4 text-[12px] font-bold tracking-[0.1em] uppercase aria-disabled:opacity-50"
          >
            Show more
          </button>
        )}
      </>
    );

  return (
    <Layout
      trial={<TryPayment buyer={buyer} printer={printer} />}
      figures={<FiguresStrip figures={bandFigures(stats, payments.slice(0, SNAPSHOT_PAYMENTS), settledSince)} />}
      chart={<SettleChart days={snapshot.daily} />}
      feed={
        <ReceiptFeed
          payments={payments}
          paused={status === "paused"}
          footer={footer}
          confirmations={snapshot.confirmations}
        />
      }
    />
  );
};

/** No snapshot to show, or the live part failed: the same places, each with a short line. */
export const DetailsResting = () => (
  <Layout
    trial={<TryPaymentResting />}
    figures={<FiguresStrip />}
    chart={
      <p className="bg-paper shadow-paper text-muted grid h-56 place-items-center px-4 text-center font-mono text-[13px]">
        The settle chart shows here while the demo runs.
      </p>
    }
    feed={
      <ReceiptFeed
        payments={[]}
        paused={false}
        empty="Receipts show here while the demo runs."
        footer={<p className="text-muted text-[13px]">{RESTING_LINE}</p>}
      />
    }
  />
);

/** Shown while the server reads the demo, at the resting size. */
export const DetailsPlaceholder = () => (
  <div aria-hidden="true" className="invisible">
    <DetailsResting />
  </div>
);
