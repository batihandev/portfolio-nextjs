"use client";

import { useMemo, useRef, useState } from "react";
import { createDemoClient, type DemoClient } from "@/lib/payments-demo/client";
import { mergePayments } from "@/lib/payments-demo/merge";
import { SNAPSHOT_PAYMENTS } from "@/lib/payments-demo/snapshot";
import type { DemoPayment, DemoSnapshot } from "@/lib/payments-demo/types";
import { BandBoundary } from "./BandBoundary";
import { BandLayout, BandPrinter, FiguresStrip, LIST_SIZE, ListFrame, RestingBand, Stub } from "./BandFrame";
import { bandFigures } from "./format";
import { IntroPaper, PurchasePaper, type Purchase } from "./Papers";
import { PurchaseSlot } from "./PayKeys";
import { useLivePayments } from "./useLivePayments";
import { usePrinter } from "./usePrinter";
import { usePurchase } from "./usePurchase";

/** A stub look from the payment's id, so a payment looks the same on every load and as the list moves. */
const lookOf = (id: string) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
};

type Props = {
  snapshot: DemoSnapshot | null;
  /** The demo API in the browser; the configured one when left out. */
  client?: DemoClient | null;
};

/** The home page's payment demo: the live band from a snapshot, or the resting band without one. */
export const PaymentsBand = ({ snapshot, client }: Props) =>
  snapshot ? (
    <BandBoundary>
      <LiveBand snapshot={snapshot} client={client} />
    </BandBoundary>
  ) : (
    <RestingBand />
  );

const LiveBand = ({ snapshot, client: given }: { snapshot: DemoSnapshot; client?: DemoClient | null }) => {
  const [client] = useState(() => (given === undefined ? createDemoClient() : given));
  const [payments, setPayments] = useState(snapshot.payments);

  const initialIds = useMemo(() => new Set(snapshot.payments.map((payment) => payment.id)), [snapshot]);
  // The stream handlers read this, so they always see the latest list.
  const paymentsRef = useRef(payments);

  const printer = usePrinter();
  const buyer = usePurchase(client, {
    confirmations: snapshot.confirmations,
    payments: () => paymentsRef.current,
    locked: printer.locked,
    onAccepted: printer.print,
  });

  /** Takes payments in arrival order, oldest first. */
  const take = (incoming: DemoPayment[]) => {
    let list = paymentsRef.current;
    for (const event of incoming) {
      const payment = buyer.own(event);
      list = mergePayments(list, [payment], SNAPSHOT_PAYMENTS);
      buyer.track(payment);
    }
    paymentsRef.current = list;
    setPayments(list);
  };

  const { status, stats, settledSince } = useLivePayments(client, snapshot, { onPayments: take, ...buyer.handlers });

  const shown = printer.shown(buyer.purchase);
  const recent = payments.slice(0, SNAPSHOT_PAYMENTS);

  return (
    <BandLayout
      printer={
        <BandPrinter slot={<PurchaseSlot buyer={buyer} printing={printer.phase === "feeding"} />} {...printer.feed}>
          <div role="region" aria-label={shown ? "Your test receipt" : "Test shop"} className="h-full">
            {shown ? (
              <PurchasePaper purchase={shown} confirmations={buyer.confirmations} />
            ) : (
              <IntroPaper state={buyer.shopState} />
            )}
          </div>
        </BandPrinter>
      }
      list={
        <ListFrame live={status === "live"} paused={status === "paused"}>
          {payments.slice(0, LIST_SIZE).map((payment) => (
            <Stub
              key={payment.id}
              payment={payment}
              look={lookOf(payment.id)}
              yours={!!payment.orderId && buyer.mine.has(payment.orderId)}
              fresh={!initialIds.has(payment.id)}
            />
          ))}
        </ListFrame>
      }
      figures={<FiguresStrip figures={bandFigures(stats, recent, settledSince)} />}
    />
  );
};
