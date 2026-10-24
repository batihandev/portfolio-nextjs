"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/site";
import { externalLinkProps } from "@/lib/links";

export const NavLinks = () => {
  const pathname = usePathname();
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-medium">
      {navLinks.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className="text-muted hover:text-ink aria-[current]:text-ink aria-[current]:decoration-accent transition-colors aria-[current]:underline aria-[current]:decoration-wavy aria-[current]:underline-offset-6"
            {...externalLinkProps(href)}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
};
