"use client";

import clsx from "clsx";
import type { AnimationEvent, CSSProperties, ReactNode } from "react";

/** Feeding prints the paper out of the slot; shredding cuts it into strips that drop away. */
export type PrinterPhase = "feeding" | "idle" | "shredding";

const STRIPS = 14;
const strips = Array.from({ length: STRIPS }, (_, n) => n);

type SlotProps = {
  printing?: boolean;
  /** Height and vertical padding classes. */
  padding?: string;
  className?: string;
  children: ReactNode;
};

/** The dark bar the paper comes out of. It wobbles while printing. */
export const PrinterSlot = ({ printing = false, padding = "py-1.5", className, children }: SlotProps) => (
  <div
    className={clsx(
      "bg-ink text-paper relative z-10 flex items-center justify-between rounded-t-md px-3",
      padding,
      printing && "printer",
      className,
    )}
  >
    {children}
  </div>
);

export type FeedProps = {
  phase: PrinterPhase;
  /** A new key prints a new sheet. */
  paperKey: string | number;
  /** Keeps the paper hidden, and unprinted, until the caller is ready to listen for the feed's end. */
  hidden?: boolean;
  /** The tallest paper, laid invisibly under the active one, so the printer never changes height. */
  sizer?: ReactNode;
  /** Stretches the paper to the sizer's height instead of its own. It needs `sizer`; without one it does nothing. */
  fill?: boolean;
  onFed?: () => void;
  onShredded?: () => void;
  children: ReactNode;
};

/** The paper under the slot, clipped at the slot while it feeds. */
export const PrinterFeed = ({
  phase,
  paperKey,
  hidden = false,
  sizer,
  fill = false,
  onFed,
  onShredded,
  children,
}: FeedProps) => {
  const place = clsx("col-start-1 row-start-1", fill ? "self-stretch" : "self-start");
  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName === "feed") onFed?.();
    // The last strip finishes last, so it decides when the shred is over.
    if (event.animationName === "shred" && event.currentTarget.dataset.last) onShredded?.();
  };

  return (
    // Clipped only while feeding, to hide the paper above the slot; otherwise the paper's shadow shows in full.
    <div className={clsx("relative grid", phase === "feeding" && "overflow-hidden")}>
      {sizer && (
        <div aria-hidden="true" className="invisible col-start-1 row-start-1">
          {sizer}
        </div>
      )}
      {phase === "shredding" ? (
        strips.map((n) => (
          <div
            key={n}
            aria-hidden="true"
            inert
            data-last={n === STRIPS - 1 || undefined}
            onAnimationEnd={onAnimationEnd}
            style={{ "--n": n, "--w": `${100 / STRIPS}%` } as CSSProperties}
            className={clsx("strip", place)}
          >
            {children}
          </div>
        ))
      ) : (
        <div
          key={paperKey}
          onAnimationEnd={onAnimationEnd}
          className={clsx(place, hidden && "invisible", !hidden && phase === "feeding" && "feeding")}
        >
          {children}
        </div>
      )}
    </div>
  );
};
