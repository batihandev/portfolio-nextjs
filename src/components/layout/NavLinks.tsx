"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";

export const NavLinks = () => {
  const pathname = usePathname();
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-medium">
      {navLinks.map(({ label, href }) => {
        const external = href.startsWith("http");
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="text-muted transition-colors hover:text-ink aria-[current]:text-ink aria-[current]:underline aria-[current]:decoration-accent aria-[current]:decoration-wavy aria-[current]:underline-offset-6"
              {...(external && { target: "_blank", rel: "noreferrer" })}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
