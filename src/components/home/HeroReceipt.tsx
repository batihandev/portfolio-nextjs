"use client";

import clsx from "clsx";
import { useEffect, useState, useSyncExternalStore, type AnimationEvent, type CSSProperties } from "react";
import { workAreas } from "@/data/experience";
import { PAPER_FOR_REPRINTS, receiptCode } from "@/data/receipt";
import { site } from "@/data/site";
import { printer } from "@/lib/printer";
import { Barcode } from "@/components/ui/Barcode";
import { QrCode } from "@/components/ui/QrCode";
import { Receipt, ReceiptRow, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";

type Props = { games: number; apps: number; devlogEpisodes: number | null; qr: string[] };
type Variant = "barcode" | "qr" | "out-of-paper";

const STRIPS = 14;
const strips = Array.from({ length: STRIPS }, (_, n) => n);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const two = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${two(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${two(d.getHours())}:${two(d.getMinutes())}`;

export const HeroReceipt = ({ games, apps, devlogEpisodes, qr }: Props) => {
  const print = useSyncExternalStore(printer.subscribe, printer.getSnapshot, printer.getServerSnapshot);
  const [phase, setPhase] = useState<"feeding" | "idle" | "shredding">("feeding");
  const run = print?.run ?? 0;
  const outOfPaper = run > PAPER_FOR_REPRINTS;
  const variant: Variant = outOfPaper ? "out-of-paper" : run === 0 ? "barcode" : "qr";

  // Leaving the page resets the printer, so coming back prints a fresh first receipt instead of replaying the last state.
  useEffect(() => printer.reset, []);

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName === "feed") setPhase("idle");
    // The last strip finishes last, so it decides when the next receipt prints.
    if (event.animationName === "shred" && event.currentTarget.dataset.last) {
      printer.reprint();
      setPhase("feeding");
    }
  };

  const tail = (
    <>
      <div className="text-xs text-muted">
        {print && stamp(print.at)}
        {print?.visit && ` · Visit no. ${print.visit}`}
      </div>
      <div className="mt-2 text-center">THANK YOU FOR VISITING</div>
    </>
  );

  // The printer prints the end first, so running out of paper leaves only the tail: the roll's pink warning stripe, the
  // printer's own last line, and whatever it managed to print before that.
  const receipt = (variant: Variant) =>
    variant === "out-of-paper" ? (
      <Receipt torn="both">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-pink-400/70" />
        <div className="text-center font-bold text-accent">*** END OF ROLL ***</div>
        <ReceiptRule />
        {tail}
        <QrCode rows={qr} />
      </Receipt>
    ) : (
      <Receipt>
        <ReceiptTitle>{site.name.toUpperCase()}</ReceiptTitle>
        <div className="text-center text-muted">{site.role} · Remote</div>
        <ReceiptRule />
        {workAreas.map((area) => (
          <ReceiptRow key={area.id} label={area.title} value="✓" />
        ))}
        <ReceiptRule />
        <ReceiptRow label="Games" value={games} />
        <ReceiptRow label="Apps and tools" value={apps} />
        {devlogEpisodes && <ReceiptRow label="Devlog episodes" value={devlogEpisodes} />}
        <ReceiptRule />
        {tail}
        {variant === "barcode" ? <Barcode value={receiptCode.barcode} /> : <QrCode rows={qr} />}
      </Receipt>
    );

  return (
    <div className="w-full min-w-0 max-w-[380px] justify-self-center">
      <div
        className={clsx(
          "relative z-10 flex items-center justify-between rounded-t-md bg-ink px-3 py-1.5 text-paper",
          print && phase === "feeding" && "printer",
        )}
      >
        <span className={clsx("font-mono text-[11px] tracking-[0.14em] uppercase", outOfPaper && "text-accent")}>
          {outOfPaper ? "Out of paper" : "Receipt printer"}
        </span>
        <button
          type="button"
          onClick={() => setPhase("shredding")}
          disabled={phase !== "idle" || outOfPaper}
          className="rounded bg-accent px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.1em] text-on-accent uppercase transition-transform active:translate-y-px disabled:opacity-60"
        >
          Reprint
        </button>
      </div>
      {/* The tallest variant sits invisibly under the active one, so the printer never changes height. Printing starts only
          once the client snapshot exists, so the feed animation cannot end before React is listening for it. */}
      <div className={clsx("relative grid", phase !== "shredding" && "overflow-hidden")}>
        <div aria-hidden="true" className="invisible col-start-1 row-start-1">
          {receipt("qr")}
        </div>
        {phase === "shredding" ? (
          strips.map((n) => (
            <div
              key={n}
              aria-hidden="true"
              data-last={n === STRIPS - 1 || undefined}
              onAnimationEnd={onAnimationEnd}
              style={{ "--n": n, "--w": `${100 / STRIPS}%` } as CSSProperties}
              className="strip col-start-1 row-start-1 self-start"
            >
              {receipt(variant)}
            </div>
          ))
        ) : (
          <div
            key={run}
            onAnimationEnd={onAnimationEnd}
            className={clsx("col-start-1 row-start-1 self-start", !print && "invisible", print && phase === "feeding" && "feeding")}
          >
            {receipt(variant)}
          </div>
        )}
      </div>
    </div>
  );
};
