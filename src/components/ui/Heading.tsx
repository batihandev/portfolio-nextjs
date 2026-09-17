import clsx from "clsx";
import type { ComponentProps } from "react";

export const PageTitle = ({ className, ...props }: ComponentProps<"h1">) => (
  <h1
    className={clsx("font-display text-[clamp(36px,5vw,54px)] leading-[1.02] font-extrabold tracking-tighter", className)}
    {...props}
  />
);

export const SectionTitle = ({ className, ...props }: ComponentProps<"h2">) => (
  <h2 className={clsx("font-display text-[32px] font-extrabold tracking-tight", className)} {...props} />
);
