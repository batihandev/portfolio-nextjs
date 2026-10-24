import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import type { DemoClient, OrderUpdate, StreamStatus } from "@/lib/payments-demo/client";
import { SNAPSHOT_PAYMENTS } from "@/lib/payments-demo/snapshot";
import type { DemoPayment, DemoSnapshot, DemoStats } from "@/lib/payments-demo/types";
import { isPaid } from "./format";

const DAY_MS = 86_400_000;
const utcDay = (ms: number) => Math.floor(ms / DAY_MS);
/** The read waits a few seconds past midnight so the API's day has turned. */
const MIDNIGHT_GRACE_MS = 5_000;
/** Waits before each retry of a failed stats read; the last one repeats. */
const RETRY_DELAYS_MS = [30_000, 60_000, 120_000, 300_000];
/** setTimeout fires at once for a delay of 2^31 ms or more. */
const MAX_TIMER_MS = 2 ** 30;

/**
 * The UTC day a payment settled on, if it adds to "settled today" as the API's settledCount counts.
 * The stream and list already leave out donations below the minimum.
 */
const settledDay = (payment: DemoPayment): number | null => {
  if (!isPaid(payment) || !payment.settledAt) return null;
  const at = Date.parse(payment.settledAt);
  return Number.isFinite(at) ? utcDay(at) : null;
};

/** A stats read: when it was sent, and the payments already counted by then. */
type StatsRead = { sentAt: number; countedBefore: Set<string> };

export type LiveHandlers = {
  /** Payments from the stream or a catch-up read, oldest first. */
  onPayments: (batch: DemoPayment[]) => void;
  /** The stream opened again after a pause. */
  onReopen?: () => void;
  onOrder?: (update: OrderUpdate) => void;
  onQueue?: (waiting: string[]) => void;
  openOrderId?: () => string | null | undefined;
};

const noSubscription = () => () => {};

/**
 * Whether the snapshot was read on an earlier UTC day than the visitor's today, as on a page
 * cached from yesterday. The server rendered the page on the snapshot's own day, so it says no.
 */
const useSnapshotFromEarlierDay = (fetchedAt: string) =>
  useSyncExternalStore(
    noSubscription,
    () => {
      const at = Date.parse(fetchedAt);
      return Number.isFinite(at) && utcDay(at) < utcDay(Date.now());
    },
    () => false,
  );

/**
 * Follows the demo's live stream on top of a snapshot. Each time the stream opens it reads the
 * newest payments and today's figures once, since the stream has no replay and the page may be a
 * cached copy from hours before.
 *
 * Returns the stream's status, the day's figures to build on, and how many payments settled today
 * that those figures did not count. The figures are null while the only ones held are from an
 * earlier UTC day.
 */
export function useLivePayments(client: DemoClient | null, snapshot: DemoSnapshot, handlers: LiveHandlers) {
  const [status, setStatus] = useState<StreamStatus | null>(null);
  const [settledSince, setSettledSince] = useState(0);
  // Payments counted since the last base figures, by the time they settled.
  const since = useRef(new Map<string, number>());
  // When the applied figures were read; a payment that settled before then is in them.
  const appliedAt = useRef(0);
  const [fresh, setFresh] = useState<DemoStats | null>(null);
  // Set once UTC midnight passes with the page open, so the figures held are from the day before.
  const [midnightPassed, setMidnightPassed] = useState(false);
  const snapshotFromEarlierDay = useSnapshotFromEarlierDay(snapshot.fetchedAt);
  // Payments already counted, by the UTC day they settled; days before today are dropped.
  const [counted] = useState(
    () => new Map(snapshot.payments.filter(isPaid).map((payment) => [payment.id, settledDay(payment) ?? -1] as const)),
  );

  /** Adds the payments that settled today and that neither the count nor the applied figures hold. */
  const count = useEffectEvent((batch: DemoPayment[]) => {
    const today = utcDay(Date.now());
    for (const [id, day] of counted) if (day < today) counted.delete(id);
    let settled = 0;
    for (const payment of batch) {
      if (settledDay(payment) === today && !counted.has(payment.id)) {
        counted.set(payment.id, today);
        const settledAt = Date.parse(payment.settledAt ?? "");
        if (settledAt < appliedAt.current) continue;
        since.current.set(payment.id, settledAt);
        settled += 1;
      }
    }
    if (settled) setSettledSince(since.current.size);
  });
  const show = useEffectEvent((batch: DemoPayment[]) => {
    if (batch.length) handlers.onPayments(batch);
  });
  /**
   * Fresh figures count the payments settled before the read was sent. The server cannot list
   * ids, so a payment that settled at or after the send time stays in the live count.
   */
  const applyStats = useEffectEvent((stats: DemoStats, read: StatsRead) => {
    for (const [id, settledAt] of since.current) {
      if (read.countedBefore.has(id) || settledAt < read.sentAt) since.current.delete(id);
    }
    appliedAt.current = read.sentAt;
    setFresh(stats);
    setSettledSince(since.current.size);
  });
  /** UTC midnight passed: the counted set and the base figures belong to the day before. */
  const dayTurned = useEffectEvent(() => {
    counted.clear();
    since.current.clear();
    setMidnightPassed(true);
    setFresh(null);
    setSettledSince(0);
  });
  const reopened = useEffectEvent(() => handlers.onReopen?.());
  const orderChanged = useEffectEvent((update: OrderUpdate) => handlers.onOrder?.(update));
  const queueChanged = useEffectEvent((waiting: string[]) => handlers.onQueue?.(waiting));
  const openOrderId = useEffectEvent(() => handlers.openOrderId?.());
  const snapshotFetchedAt = useEffectEvent(() => snapshot.fetchedAt);

  useEffect(() => {
    if (!client) return;
    let active = true;
    let last: StreamStatus | null = null;
    let reading = false;
    let dirty = false;
    // Counts the midnights seen; a read is stale if one passed while it was out. The wall clock
    // cannot say so, since it may be set back.
    let dayTurns = 0;
    let failures = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let midnight: ReturnType<typeof setTimeout> | undefined;

    /**
     * Reads the figures, one read at a time: a request during a read gets one more read after it.
     * A read still out when the day turned is dropped for a fresh one. A failure starts the retry
     * chain if none is waiting, and a success ends it.
     */
    const requestStats = () => {
      if (reading) {
        dirty = true;
        return;
      }
      reading = true;
      dirty = false;
      const read: StatsRead = { sentAt: Date.now(), countedBefore: new Set(since.current.keys()) };
      const turnsAtSend = dayTurns;
      void client
        .stats()
        .catch(() => null)
        .then((stats) => {
          if (!active) return;
          reading = false;
          if (turnsAtSend !== dayTurns) dirty = true;
          else if (stats) {
            clearTimeout(retry);
            retry = undefined;
            failures = 0;
            applyStats(stats, read);
          } else if (!retry) {
            const delay = RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)];
            failures += 1;
            retry = setTimeout(() => {
              retry = undefined;
              requestStats();
            }, delay);
          }
          if (dirty) requestStats();
        });
    };
    // Each open reads the newest payments once, since the stream has no replay. A page from a
    // stale copy has an old list, so the first open reads too.
    const catchUp = () => {
      void client.payments(SNAPSHOT_PAYMENTS).then((list) => {
        if (!active || !list) return;
        const oldestFirst = [...list].reverse();
        show(oldestFirst);
        count(oldestFirst);
      });
      requestStats();
    };
    const stop = client.subscribe({
      onStatus: (next) => {
        if (next === "live" && last !== "live") {
          if (last === "paused") reopened();
          catchUp();
        }
        last = next;
        setStatus(next);
      },
      onPayment: (payment) => {
        count([payment]);
        show([payment]);
      },
      onOrder: (update) => orderChanged(update),
      onQueue: (waiting) => queueChanged(waiting),
      openOrderId: () => openOrderId(),
    });
    const scheduleMidnight = () => {
      const now = Date.now();
      const delay = (utcDay(now) + 1) * DAY_MS - now + MIDNIGHT_GRACE_MS;
      midnight = setTimeout(
        () => {
          dayTurns += 1;
          dayTurned();
          scheduleMidnight();
          requestStats();
        },
        Math.min(delay, MAX_TIMER_MS),
      );
    };
    scheduleMidnight();
    // A snapshot from an earlier UTC day shows "…" until fresh figures arrive. If the stream
    // never opens, nothing else asks, so the first read is made here.
    const fetchedAt = Date.parse(snapshotFetchedAt());
    if (Number.isFinite(fetchedAt) && utcDay(fetchedAt) < utcDay(Date.now())) requestStats();
    return () => {
      active = false;
      stop();
      clearTimeout(midnight);
      clearTimeout(retry);
    };
  }, [client]);

  const stats = fresh ?? (snapshotFromEarlierDay || midnightPassed ? null : snapshot.stats);
  return { status, stats, settledSince };
}
