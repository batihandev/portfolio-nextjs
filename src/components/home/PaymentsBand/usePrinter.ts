"use client";

import { useState } from "react";
import type { PrinterPhase } from "@/components/ui/Printer";
import type { Purchase } from "./Papers";

const reducedMotion = () => typeof matchMedia !== "function" || matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The printer's sheet: a new purchase shreds the receipt before it, or feeds in when there is none. */
export function usePrinter() {
  const [leaving, setLeaving] = useState<Purchase | null>(null);
  const [phase, setPhase] = useState<PrinterPhase>("idle");
  const [paperKey, setPaperKey] = useState(0);

  /** Starts printing `next`; with reduced motion the sheet swaps without feeding or shredding. */
  const print = (_next: Purchase, previous: Purchase | null) => {
    const motion = !reducedMotion();
    if (previous && motion) {
      setLeaving(previous);
      setPhase("shredding");
    } else {
      setPaperKey((key) => key + 1);
      setPhase(motion ? "feeding" : "idle");
    }
  };

  return {
    phase,
    paperKey,
    /** True while the old receipt is cut up; a purchase waits for it. */
    locked: phase === "shredding",
    print,
    /** The receipt on the paper: the leaving one while it is shredded, then the current one. */
    shown: (purchase: Purchase | null) => (phase === "shredding" && leaving ? leaving : purchase),
    feed: {
      phase,
      paperKey,
      onFed: () => setPhase("idle"),
      onShredded: () => {
        setLeaving(null);
        setPaperKey((key) => key + 1);
        setPhase("feeding");
      },
    },
  };
}
