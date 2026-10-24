"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoClient, PurchaseResult } from "@/lib/payments-demo/client";
import { DEMO_COPY, noticeFor, type ShopState } from "@/lib/payments-demo/copy";
import { mergePayments } from "@/lib/payments-demo/merge";
import type { DemoHealth, DemoOrder, DemoPayment, DemoRail } from "@/lib/payments-demo/types";
import { purchaseDone, type Purchase } from "./Papers";
import type { LiveHandlers } from "./useLivePayments";

/** How long the buttons rest after a refusal that gives no wait of its own. */
const CLOSED_PAUSE_MS = 10_000;
const LONGEST_PAUSE_MS = 120_000;
/** setTimeout fires at once for a delay beyond a signed 32-bit integer. */
const LONGEST_TIMER_MS = 2 ** 31 - 1;

type Timer = ReturnType<typeof setTimeout> | undefined;

type Options = {
  /** The confirmation target the snapshot gave, until a health read says otherwise. */
  confirmations: number;
  /** The latest payments the page holds, to find a payment that arrived before its purchase answer. */
  payments: () => DemoPayment[];
  /** Keeps the buttons locked for a reason of the page's own, such as a receipt being shredded. */
  locked?: boolean;
  /** Called with the accepted purchase and the one it replaces, before it is shown. */
  onAccepted?: (next: Purchase, previous: Purchase | null) => void;
};

/**
 * The visitor's test purchase: sending it, the shop's refusals and pauses, its order and queue place, and the
 * health that says whether the card rail is open. The page feeds it the stream through `handlers` and `track`.
 */
export function usePurchase(client: DemoClient | null, { payments, locked = false, onAccepted, ...initial }: Options) {
  const [cardAvailable, setCardAvailable] = useState(false);
  const [confirmations, setConfirmations] = useState(initial.confirmations);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  // Why the shop takes no purchases right now, if it does not; the idle receipt says so.
  const [shopState, setShopState] = useState<ShopState | null>(null);
  const soldOut = shopState === "sold_out" || shopState === "visitor_done";
  const [mine, setMine] = useState<ReadonlyMap<string, DemoOrder>>(() => new Map());

  // The stream handlers and `send` read these, so they always see the latest purchase and orders.
  const purchaseRef = useRef<Purchase | null>(null);
  const mineRef = useRef(mine);
  const sendingRef = useRef(false);
  const pauseTimer = useRef<Timer>(undefined);
  const expiryTimer = useRef<Timer>(undefined);

  useEffect(() => {
    purchaseRef.current = purchase;
    mineRef.current = mine;
  }, [purchase, mine]);

  useEffect(
    () => () => {
      clearTimeout(pauseTimer.current);
      clearTimeout(expiryTimer.current);
    },
    [],
  );

  /** A health read that failed leaves the card rail closed and keeps the last known target. */
  const applyHealth = (health: DemoHealth | null) => {
    setCardAvailable(health?.cardAvailable === true);
    if (health) setConfirmations(health.confirmations);
  };

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.health().then((health) => {
      if (active) applyHealth(health);
    });
    return () => {
      active = false;
    };
  }, [client]);

  const updatePurchase = (orderId: string | null, change: (held: Purchase) => Purchase) =>
    setPurchase((held) => (held && held.orderId === orderId ? change(held) : held));

  /** The payment with the visitor's own order filled in; stream events leave the order out. */
  const own = (event: DemoPayment): DemoPayment => {
    const order = event.orderId ? mineRef.current.get(event.orderId) : undefined;
    return order && !event.order ? { ...event, order } : event;
  };

  /** Moves the visitor's purchase on with a newer copy of its payment. */
  const track = (payment: DemoPayment) =>
    updatePurchase(payment.orderId, (held) => ({ ...held, payment: latest(held.payment, payment) }));

  const handlers: Omit<LiveHandlers, "onPayments"> = {
    onReopen: () => void client?.health().then(applyHealth),
    onOrder: (update) =>
      updatePurchase(update.id, (held) => ({
        ...held,
        closed: held.closed || update.closed,
        position: update.position ?? held.position,
      })),
    onQueue: (waiting) => {
      const orderId = purchaseRef.current?.orderId;
      const place = orderId ? waiting.indexOf(orderId) + 1 : 0;
      if (place > 0) updatePurchase(orderId ?? null, (held) => ({ ...held, position: place }));
    },
    openOrderId: () => {
      const held = purchaseRef.current;
      return held && !purchaseDone(held) ? held.orderId : null;
    },
  };

  /** Shows a refusal's line; `block` also rests the buttons and `state` sets the idle receipt. All end together. */
  const pause = (text: string | null, ms: number, block: boolean, state: ShopState | null = null) => {
    clearTimeout(pauseTimer.current);
    setNotice(text);
    setBlocked(block);
    setShopState(state);
    pauseTimer.current = setTimeout(
      () => {
        setBlocked(false);
        setNotice(null);
        setShopState(null);
      },
      Math.min(ms, LONGEST_PAUSE_MS),
    );
  };

  const soldOutFor = (text: string | null, state: ShopState) => {
    clearTimeout(pauseTimer.current);
    setNotice(text);
    setShopState(state);
  };

  const refused = (result: Exclude<PurchaseResult, { kind: "accepted" }>) => {
    // The order may exist, so the shop is not shown as closed and the buttons stay free.
    if (result.kind === "uncertain") return pause(noticeFor(result), CLOSED_PAUSE_MS, false);
    if (result.kind === "busy") {
      // A wait past the longest pause is the visitor's own daily limit, which ends at UTC midnight.
      if (result.retryAfterSeconds * 1000 > LONGEST_PAUSE_MS)
        return soldOutFor(DEMO_COPY.visitor_daily_limit, "visitor_done");
      return pause(noticeFor(result), result.retryAfterSeconds * 1000, true);
    }
    if (result.reason === "daily_limit") return soldOutFor(noticeFor(result), "sold_out");
    if (result.reason === "card_unavailable") {
      setCardAvailable(false);
      return pause(noticeFor(result), CLOSED_PAUSE_MS, false);
    }
    // A slow shop is still open; every other refusal means it is closed for now.
    pause(noticeFor(result), CLOSED_PAUSE_MS, true, result.reason === "purchase_pending" ? null : "closed");
  };

  const open = purchase && !purchaseDone(purchase);
  const disabled = !client || sending || blocked || soldOut || !!open || locked;
  /** The keys invite a press until the visitor's first purchase. */
  const inviting = purchase === null && !disabled;

  const send = async (rail: DemoRail) => {
    // The buttons stay focusable while locked, so a locked press lands here and stops.
    if (!client || disabled || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    const result = await client.purchase(rail);
    sendingRef.current = false;
    setSending(false);
    if (result.kind !== "accepted") return refused(result);
    clearTimeout(pauseTimer.current);
    setNotice(null);
    setShopState(null);
    setMine((held) =>
      new Map(held).set(result.orderId, { id: result.orderId, item: result.item, price: result.price }),
    );
    const next: Purchase = {
      orderId: result.orderId,
      item: result.item,
      price: result.price,
      rail,
      payment: payments().find((payment) => payment.orderId === result.orderId) ?? null,
      closed: false,
      position: result.position,
    };
    onAccepted?.(next, purchase);
    setPurchase(next);
    // An order that never reports back still frees the buttons once it expires.
    clearTimeout(expiryTimer.current);
    const { orderId } = result;
    const expiresIn = Date.parse(result.expiresAt) - Date.now();
    if (Number.isFinite(expiresIn) && expiresIn < LONGEST_TIMER_MS)
      expiryTimer.current = setTimeout(
        () => updatePurchase(orderId, (held) => ({ ...held, expired: true })),
        Math.max(0, expiresIn),
      );
  };

  return {
    purchase,
    cardAvailable,
    confirmations,
    notice,
    shopState,
    soldOut,
    disabled,
    inviting,
    mine,
    send,
    own,
    track,
    handlers,
  };
}

/** The newer of two copies of the visitor's payment. */
const latest = (held: DemoPayment | null, incoming: DemoPayment) =>
  held ? (mergePayments([held], [incoming], 1)[0] ?? incoming) : incoming;
