import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";

type ReceiptProps = ComponentProps<"div"> & { torn?: "bottom" | "both" };

export const Receipt = ({ torn = "bottom", className, children, ...props }: ReceiptProps) => (
  <div className="drop-shadow-paper" {...props}>
    <div
      className={clsx(
        "bg-paper text-ink relative px-6 pb-9 font-mono text-sm leading-7",
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

export const ReceiptRule = () => <hr className="border-line my-3 border-t-[1.5px] border-dashed" />;

export const ReceiptRow = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="flex gap-1.5">
    <span>{label}</span>
    <span aria-hidden="true" className="border-muted min-w-3 flex-1 -translate-y-1.5 border-b-[1.5px] border-dotted" />
    <span className="text-right">{value}</span>
  </div>
);
