import Link from "next/link";
import type { ReactNode } from "react";
import { routes, site } from "@/data/site";
import { Container } from "@/components/ui/Container";

type LayoutProps = { eyebrow?: string; title: string; lastUpdated: string; children: ReactNode };

// Players land on the game policies straight from Google Play, so every policy links back to the site.
export const PolicyLayout = ({ eyebrow, title, lastUpdated, children }: LayoutProps) => (
  <main id="main">
    <Container className="max-w-3xl py-12">
      <Link href={routes.home} className="text-muted hover:text-accent-strong text-sm">
        ← {site.name}
      </Link>
      <header className="border-line mt-4 border-b border-dashed pb-6">
        {eyebrow && (
          <p className="text-accent-strong font-mono text-sm font-bold tracking-[0.14em] uppercase">{eyebrow}</p>
        )}
        <h1 className="font-display mt-1 text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-muted mt-2 text-sm">Last updated: {lastUpdated}</p>
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
