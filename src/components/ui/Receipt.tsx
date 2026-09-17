import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type ReceiptProps = ComponentProps<"div"> & { torn?: "bottom" | "both" };

export const Receipt = ({ torn = "bottom", className, children, ...props }: ReceiptProps) => (
  <div className="drop-shadow-paper" {...props}>
    <div
      className={clsx(
        "relative bg-paper px-6 pb-9 font-mono text-sm leading-7 text-ink",
        torn === "both" ? "paper-torn-both pt-9" : "paper-torn pt-6",
        className,
      )}
    >
      {children}
    </div>
  </div>
);

export const ReceiptTitle = ({ children }: { children: ReactNode }) => (
  <div className="text-center text-base font-bold tracking-[0.08em]">{children}</div>
);

export const ReceiptRule = () => <hr className="my-3 border-t-[1.5px] border-dashed border-line" />;

export const ReceiptRow = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="flex gap-1.5">
    <span>{label}</span>
    <span aria-hidden="true" className="min-w-3 flex-1 -translate-y-1.5 border-b-[1.5px] border-dotted border-muted" />
    <span className="text-right">{value}</span>
  </div>
);
