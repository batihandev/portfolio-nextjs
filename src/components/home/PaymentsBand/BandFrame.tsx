import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { routes } from "@/data/site";
import { LIVE_PAUSED } from "@/lib/payments-demo/copy";
import type { DemoPayment } from "@/lib/payments-demo/types";
import { PrinterFeed, PrinterSlot, type FeedProps } from "@/components/ui/Printer";
import { duration, money, paymentLink, railOf, stubStage, type BandFigures } from "./format";
import { RestingPaper, SizerPaper } from "./Papers";

/** How many recent purchases the list shows. */
export const LIST_SIZE = 6;

const colors = ["bg-ticket-1", "bg-ticket-2", "bg-ticket-3", "bg-ticket-4", "bg-ticket-5"] as const;
/** How many stub colours there are; a look is taken modulo this. */
export const COLOR_COUNT = colors.length;
const tilts = [
  "-rotate-[1.5deg]",
  "rotate-1",
  "-rotate-[0.5deg]",
  "rotate-[1.5deg]",
  "-rotate-1",
  "rotate-[0.5deg]",
] as const;

type LayoutProps = { printer: ReactNode; list: ReactNode; figures: ReactNode };

/** Printer on the left, the list and figures on the right; stacked in that order on a phone. */
export const BandLayout = ({ printer, list, figures }: LayoutProps) => (
  <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:items-start md:gap-8">
    <div className="w-full max-w-[380px] justify-self-center md:max-w-none">{printer}</div>
    <div className="flex min-w-0 flex-col gap-4">
      {list}
      <div>
        {figures}
        <p className="text-right font-mono text-[13px]">
          <Link
            href={routes.paymentsDemo}
            className="text-accent-strong font-bold whitespace-nowrap underline underline-offset-4"
          >
            View details →
          </Link>
        </p>
      </div>
    </div>
  </div>
);

/** The slot bar keeps the height of its 44 px buttons even when it has none. */
export const BandSlot = ({ printing, children }: { printing?: boolean; children: ReactNode }) => (
  <PrinterSlot printing={printing} padding="min-h-12 py-0.5" className="gap-x-3">
    {children}
  </PrinterSlot>
);

export const SlotLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-mono text-[11px] tracking-[0.14em] uppercase">{children}</span>
);

/** `live`: the event stream is open, so new purchases show as they happen. */
type ListProps = { live?: boolean; paused?: boolean; note?: string; children?: ReactNode };

/** The recent purchases: a fixed grid of stubs, so the list keeps its size however many there are. */
export const ListFrame = ({ live = false, paused = false, note, children }: ListProps) => (
  <div className="relative">
    <div className="text-muted flex h-6 items-baseline justify-between gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
      <span>Recent purchases</span>
      {paused ? (
        <span className="tracking-normal normal-case">{LIVE_PAUSED}</span>
      ) : (
        live && (
          <span className="text-live flex items-center gap-2 text-[12px] font-bold">
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="bg-live absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping" />
              <span className="bg-live relative size-2.5 rounded-full" />
            </span>
            Live
          </span>
        )
      )}
    </div>
    <ul
      aria-label="Recent test purchases"
      className="mt-2 grid grid-cols-2 grid-rows-[repeat(3,5.25rem)] gap-3 sm:grid-cols-3 sm:grid-rows-[repeat(2,4.5rem)] md:grid-cols-2 md:grid-rows-[repeat(3,5.25rem)] lg:grid-cols-3 lg:grid-rows-[repeat(2,4.5rem)]"
    >
      {children}
    </ul>
    {note && (
      <p className="border-line text-muted absolute inset-x-0 top-8 bottom-0 grid place-items-center border-[1.5px] border-dashed px-4 text-center font-mono text-[13px]">
        {note}
      </p>
    )}
  </div>
);

/** `look` picks the stub's colour and tilt; it stays with the payment as the list moves. */
type StubProps = {
  payment: DemoPayment;
  look: number;
  yours: boolean;
  fresh: boolean;
};

/** One recent purchase as a small ticket stub. */
export const Stub = ({ payment, look, yours, fresh }: StubProps) => {
  const index = look;
  const link = paymentLink(payment);
  return (
    <li className={clsx("drop-shadow-paper min-w-0", tilts[index % tilts.length], fresh && "stub-in")}>
      <div
        className={clsx(
          "stub text-ink flex h-full flex-col justify-between px-3.5 py-2 font-mono",
          colors[index % colors.length],
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-between gap-2 text-[11px] tracking-[0.1em] uppercase opacity-80",
            // The dark yellow stub needs more contrast for its small top row.
            index % colors.length === 1 && "[:root[data-theme=dark]_&]:opacity-90",
          )}
        >
          <span>{railOf(payment) === "card" ? "Card" : "Network"}</span>
          <span className="flex items-center gap-1.5">
            {yours && <span className="bg-ink text-paper rounded-sm px-1 font-bold tracking-[0.08em]">Yours</span>}
            {link && (
              // The padding gives the small icon a 24 px target; the negative margin keeps the row's height.
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                className="-m-1.5 p-1.5"
              >
                <FaArrowUpRightFromSquare aria-hidden="true" className="size-3" />
              </a>
            )}
          </span>
        </div>
        <div className="line-clamp-2 text-[13px] leading-tight font-bold sm:truncate md:line-clamp-2 md:whitespace-normal lg:truncate">
          {payment.order?.item ?? "Test purchase"}
        </div>
        <div className="flex justify-between gap-2 text-[11px]">
          <span>{money(payment.order?.price ?? payment.amount)}</span>
          <span>{stubStage(payment)}</span>
        </div>
      </div>
    </li>
  );
};

/** Says where each figure comes from. It may wrap to two lines, which the reserved height holds. */
const FIGURES_CAPTION = "Median and split: last 20 payments. Today and duplicates: the UTC day.";

/** Holds a day's count's place while only an earlier day's figure is known. */
const dayCount = (value: number | null) => (value === null ? "…" : String(value));

/** A rail with no settled payment among the recent ones has no median yet. */
const settle = (ms: number | null) => (ms === null ? "not yet" : duration(ms));

/** Two figures that may wrap only between each other, never inside one. */
const Pair = ({ first, second }: { first: string; second: string }) => (
  <>
    <span className="whitespace-nowrap">{first} /</span> <span className="whitespace-nowrap">{second}</span>
  </>
);

/** The figures strip is one row of four cells, the median's widest, or two rows of two where the column is narrow. */
const stripHeight = "h-30 sm:h-15 md:h-30 lg:h-15";

/** A small mono strip of figures. Without figures it keeps its size and says when they show. */
export const FiguresStrip = ({ figures }: { figures?: BandFigures }) => {
  if (!figures)
    return (
      <div>
        <p
          className={clsx(
            "bg-paper text-muted shadow-paper grid place-items-center px-4 text-center font-mono text-[13px]",
            stripHeight,
          )}
        >
          Figures show here while the demo runs.
        </p>
        <div className="mt-1.5 h-8" />
      </div>
    );
  const cells: [string, ReactNode][] = [
    ["Settled today", dayCount(figures.settledToday)],
    [
      "Median settle",
      <Pair key="median" first={settle(figures.medianSettleMs.card)} second={settle(figures.medianSettleMs.chain)} />,
    ],
    ["Card/network", `${figures.card} / ${figures.network}`],
    ["Duplicates", dayCount(figures.duplicatesSkipped)],
  ];
  return (
    <div>
      <dl
        className={clsx(
          "bg-paper shadow-paper grid grid-cols-2 font-mono sm:grid-cols-[1fr_1.5fr_1fr_1fr] md:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_1fr]",
          stripHeight,
        )}
      >
        {cells.map(([label, value], i) => (
          <div
            key={label}
            className={clsx(
              "flex flex-col justify-center px-3",
              i % 2 === 1 && "border-line border-l-[1.5px] border-dashed",
              i >= 2 && "border-line border-t-[1.5px] border-dashed sm:border-t-0 md:border-t-[1.5px] lg:border-t-0",
              i === 2 && "sm:border-l-[1.5px] md:border-l-0 lg:border-l-[1.5px]",
            )}
          >
            <dt className="text-muted text-[11px] tracking-[0.08em] uppercase">{label}</dt>
            <dd className="text-[15px] leading-tight font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-muted mt-1.5 h-8 font-mono text-[11px] leading-4">{FIGURES_CAPTION}</p>
    </div>
  );
};

/** The printer with its tallest paper laid under the active one, so it never changes height. The band's by default. */
export const BandPrinter = ({
  slot,
  children,
  sizer = <SizerPaper />,
  ...feed
}: Omit<FeedProps, "fill" | "children"> & {
  slot: ReactNode;
  children: ReactNode;
}) => (
  <>
    {slot}
    <PrinterFeed {...feed} sizer={sizer} fill>
      {children}
    </PrinterFeed>
  </>
);

/** No demo to show: same size as the live band, with a short line and the details link. */
export const RestingBand = () => (
  <BandLayout
    printer={
      <BandPrinter
        phase="idle"
        paperKey="resting"
        slot={
          <BandSlot>
            <SlotLabel>Resting</SlotLabel>
          </BandSlot>
        }
      >
        <RestingPaper />
      </BandPrinter>
    }
    list={<ListFrame note="Recent test purchases show here while the demo runs." />}
    figures={<FiguresStrip />}
  />
);

/** Shown while the server reads the demo, at the band's size. */
export const BandPlaceholder = () => (
  <div aria-hidden="true" className="invisible">
    <RestingBand />
  </div>
);
