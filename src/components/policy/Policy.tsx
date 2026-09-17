import Link from "next/link";
import type { ReactNode } from "react";
import { routes, site } from "@/data/site";
import { Container } from "@/components/ui/Container";

type LayoutProps = { eyebrow?: string; title: string; lastUpdated: string; children: ReactNode };

// Players land on the game policies straight from Google Play, so every policy links back to the site.
export const PolicyLayout = ({ eyebrow, title, lastUpdated, children }: LayoutProps) => (
  <main>
    <Container className="max-w-3xl py-12">
      <Link href={routes.home} className="text-sm text-muted hover:text-accent">
        ← {site.name}
      </Link>
      <header className="mt-4 border-b border-dashed border-line pb-6">
        {eyebrow && <p className="font-mono text-sm font-bold tracking-[0.14em] text-accent uppercase">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {lastUpdated}</p>
      </header>
      <article className="policy leading-7">{children}</article>
    </Container>
  </main>
);

export const PolicySection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

export const ContactEmail = () => (
  <a href={`mailto:${site.email}`} className="break-all">
    {site.email}
  </a>
);
