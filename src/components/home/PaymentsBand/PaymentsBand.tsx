"use client";

import { useMemo, useRef, useState } from "react";
import { createDemoClient, type DemoClient } from "@/lib/payments-demo/client";
import { mergePayments } from "@/lib/payments-demo/merge";
import { SNAPSHOT_PAYMENTS } from "@/lib/payments-demo/snapshot";
import type { DemoPayment, DemoSnapshot } from "@/lib/payments-demo/types";
import { BandBoundary } from "./BandBoundary";
import {
  BandLayout,
  BandPrinter,
  COLOR_COUNT,
  FiguresStrip,
  LIST_SIZE,
  ListFrame,
  RestingBand,
  Stub,
} from "./BandFrame";
import { bandFigures } from "./format";
import { IntroPaper, PurchasePaper, type Purchase } from "./Papers";
import { PurchaseSlot } from "./PayKeys";
import { useLivePayments } from "./useLivePayments";
import { usePrinter } from "./usePrinter";
import { usePurchase } from "./usePurchase";

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
  // A payment takes its stub look when first seen and keeps it as the list moves.
  const [looks, setLooks] = useState<ReadonlyMap<string, number>>(
    () => new Map(snapshot.payments.map((payment, i) => [payment.id, i])),
  );

  const initialIds = useMemo(() => new Set(snapshot.payments.map((payment) => payment.id)), [snapshot]);
  // The stream handlers read these, so they always see the latest list and looks.
  const paymentsRef = useRef(payments);
  const looksRef = useRef(looks);

  const printer = usePrinter();
  const buyer = usePurchase(client, {
    confirmations: snapshot.confirmations,
    payments: () => paymentsRef.current,
    locked: printer.locked,
    onAccepted: printer.print,
  });

  /** Takes payments in arrival order, oldest first. */
  const take = (incoming: DemoPayment[]) => {
    const looks = new Map(looksRef.current);
    let list = paymentsRef.current;
    for (const event of incoming) {
      const payment = buyer.own(event);
      // Looks count up the list, so a new arrival at the top takes one step back from the first stub's.
      // Then any two stubs side by side or stacked differ.
      if (!looks.has(payment.id))
        looks.set(payment.id, list[0] ? ((looks.get(list[0].id) ?? 0) - 1 + COLOR_COUNT) % COLOR_COUNT : 0);
      list = mergePayments(list, [payment], SNAPSHOT_PAYMENTS);
      buyer.track(payment);
    }
    // Keep only what the list still holds.
    const held = new Set(list.map((payment) => payment.id));
    for (const key of looks.keys()) if (!held.has(key)) looks.delete(key);
    paymentsRef.current = list;
    looksRef.current = looks;
    setPayments(list);
    setLooks(looks);
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
              look={looks.get(payment.id) ?? 0}
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
