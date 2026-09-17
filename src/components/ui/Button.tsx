import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

const variants = {
  primary: "bg-accent text-on-accent",
  secondary: "bg-paper text-ink shadow-paper",
} as const;

type Variant = keyof typeof variants;

const classes = (variant: Variant, className?: string) =>
  clsx(
    "inline-flex items-center justify-center rounded-[10px] px-5 py-3 text-[15px] font-bold transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0",
    variants[variant],
    className,
  );

const isExternal = (href: string) => /^https?:\/\//.test(href);

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant };

export const LinkButton = ({ variant = "primary", className, href, ...props }: LinkButtonProps) => {
  const external = typeof href === "string" && isExternal(href);
  return (
    <Link
      href={href}
      className={classes(variant, className)}
      {...(external && { target: "_blank", rel: "noreferrer" })}
      {...props}
    />
  );
};

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export const Button = ({ variant = "primary", className, type = "button", ...props }: ButtonProps) => (
  <button type={type} className={classes(variant, className)} {...props} />
);
