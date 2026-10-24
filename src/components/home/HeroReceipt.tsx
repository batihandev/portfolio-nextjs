"use client";

import clsx from "clsx";
import { useEffect, useState, useSyncExternalStore } from "react";
import { workAreas } from "@/data/experience";
import { PAPER_FOR_REPRINTS, receiptCode } from "@/data/receipt";
import { site } from "@/data/site";
import { printer } from "@/lib/printer";
import { Barcode } from "@/components/ui/Barcode";
import { PrinterFeed, PrinterSlot, type PrinterPhase } from "@/components/ui/Printer";
import { QrCode } from "@/components/ui/QrCode";
import { Receipt, ReceiptRow, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";

type Props = { games: number; apps: number; devlogEpisodes: number | null; qr: string[] };
type Variant = "barcode" | "qr" | "out-of-paper";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const two = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) =>
  `${two(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${two(d.getHours())}:${two(d.getMinutes())}`;

export const HeroReceipt = ({ games, apps, devlogEpisodes, qr }: Props) => {
  const print = useSyncExternalStore(printer.subscribe, printer.getSnapshot, printer.getServerSnapshot);
  const [phase, setPhase] = useState<PrinterPhase>("feeding");
  const run = print?.run ?? 0;
  const outOfPaper = run > PAPER_FOR_REPRINTS;
  const variant: Variant = outOfPaper ? "out-of-paper" : run === 0 ? "barcode" : "qr";

  // Leaving the page resets the printer, so coming back prints a fresh first receipt instead of replaying the last state.
  useEffect(() => printer.reset, []);

  const onShredded = () => {
    printer.reprint();
    setPhase("feeding");
  };

  const tail = (
    <>
      <div className="text-muted text-xs">
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
        <div className="text-accent-strong text-center font-bold">*** END OF ROLL ***</div>
        <ReceiptRule />
        {tail}
        <QrCode rows={qr} />
      </Receipt>
    ) : (
      <Receipt>
        <ReceiptTitle>{site.name.toUpperCase()}</ReceiptTitle>
        <div className="text-muted text-center">{site.role} · Remote</div>
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
    <div className="w-full max-w-[380px] min-w-0 justify-self-center">
      <PrinterSlot printing={!!print && phase === "feeding"}>
        <span
          className={clsx("font-mono text-[11px] tracking-[0.14em] uppercase", outOfPaper && "text-accent-on-slot")}
        >
          {outOfPaper ? "Out of paper" : "Receipt printer"}
        </span>
        {/* The button is a 44 px target around the 20.5 px label; its negative margins keep the slot bar's height. */}
        <button
          type="button"
          onClick={() => setPhase("shredding")}
          disabled={phase !== "idle" || outOfPaper}
          className="group -my-[11.75px] -mr-3 flex min-h-11 min-w-11 items-center justify-center px-3"
        >
          <span className="printer-key bg-accent-strong text-on-accent rounded px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.1em] uppercase group-disabled:opacity-60">
            Reprint
          </span>
        </button>
      </PrinterSlot>
      {/* Printing starts only once the client snapshot exists, so the feed animation cannot end before React is
          listening for it. */}
      <PrinterFeed
        phase={phase}
        paperKey={run}
        hidden={!print}
        sizer={receipt("qr")}
        onFed={() => setPhase("idle")}
        onShredded={onShredded}
      >
        {receipt(variant)}
      </PrinterFeed>
    </div>
  );
};
