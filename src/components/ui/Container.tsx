import clsx from "clsx";
import type { ComponentProps } from "react";

export const Container = ({ className, ...props }: ComponentProps<"div">) => (
  <div className={clsx("mx-auto w-full max-w-[1080px] px-4 sm:px-8", className)} {...props} />
);
