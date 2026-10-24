import clsx from "clsx";
import type { DemoRail } from "@/lib/payments-demo/types";
import { BandSlot, SlotLabel } from "./BandFrame";
import type { usePurchase } from "./usePurchase";

type Buyer = ReturnType<typeof usePurchase>;

/** The button is the 44 px target; the key inside it is shorter, so the bar leaves room for it to move. */
const buttonClass = "flex min-h-11 items-center aria-disabled:opacity-50";
const keyClass =
  "printer-key rounded px-2.5 py-2 font-mono text-[11px] leading-none font-bold tracking-[0.1em] uppercase";

type Props = {
  cardAvailable: boolean;
  disabled: boolean;
  inviting: boolean;
  onSend: (rail: DemoRail) => void;
};

/** The two printer keys that send a test purchase. They stay focusable while locked; a locked press does nothing. */
export const PayKeys = ({ cardAvailable, disabled, inviting, onSend }: Props) => (
  <div className="flex gap-2">
    {cardAvailable && (
      <button
        type="button"
        aria-disabled={disabled}
        onClick={() => onSend("card")}
        data-inviting={inviting}
        className={buttonClass}
      >
        <span className={clsx(keyClass, "bg-accent-strong text-on-accent [--key-face:var(--accent-strong)]")}>
          Test card
        </span>
      </button>
    )}
    <button
      type="button"
      aria-disabled={disabled}
      onClick={() => onSend("chain")}
      data-inviting={inviting}
      className={buttonClass}
    >
      <span className={clsx(keyClass, "bg-paper text-ink [--key-face:var(--paper)]")}>Test network</span>
    </button>
  </div>
);

/** The printer's top bar: the label and keys, and a brief notice laid over the top of the paper. */
export const PurchaseSlot = ({ buyer, printing }: { buyer: Buyer; printing: boolean }) => (
  <BandSlot printing={printing}>
    {!buyer.soldOut && <SlotLabel>Pay with</SlotLabel>}
    {!buyer.soldOut && (
      <PayKeys
        cardAvailable={buyer.cardAvailable}
        disabled={buyer.disabled}
        inviting={buyer.inviting}
        onSend={(rail) => void buyer.send(rail)}
      />
    )}
    {/* The notice is laid over the paper, so it never moves the printer. Sold out stays in the bar. */}
    <p
      role="status"
      aria-label="Printer notice"
      className={clsx(
        buyer.soldOut
          ? "font-mono text-[12px] leading-snug"
          : buyer.notice
            ? "bg-ink text-paper absolute inset-x-0 top-full rounded-b-md px-3 pt-1 pb-2 font-mono text-[12px] leading-snug"
            : "sr-only",
      )}
    >
      {buyer.notice}
    </p>
  </BandSlot>
);
