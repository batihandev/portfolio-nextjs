import Link from "next/link";
import { routes, site } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

export const Nav = () => (
  <header className="border-b border-dashed border-line">
    <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4.5">
      <Link href={routes.home} className="font-display text-xl font-extrabold tracking-tight">
        {site.name}
        <span className="text-accent">.</span>
      </Link>
      <div className="order-3 basis-full md:order-2 md:ml-auto md:basis-auto">
        <NavLinks />
      </div>
      <div className="order-2 md:order-3">
        <ThemeToggle />
      </div>
    </Container>
  </header>
);
