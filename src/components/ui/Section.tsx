import clsx from "clsx";
import type { ComponentProps } from "react";

type Props = ComponentProps<"section"> & { title: string; intro?: string };

export const Section = ({ title, intro, className, children, ...props }: Props) => (
  <section className={clsx("scroll-mt-20 py-11", className)} {...props}>
    <h2 className="font-display text-[32px] font-extrabold tracking-tight">{title}</h2>
    {intro && <p className="mt-1 text-muted">{intro}</p>}
    <div className="mt-6">{children}</div>
  </section>
);
