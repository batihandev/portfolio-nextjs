import type { ReactNode } from "react";
import BackToPortfolio from "@/componenets/BackToPortfolio";

type LayoutProps = { game: string; lastUpdated: string; children: ReactNode };

export const GamePrivacyLayout = ({ game, lastUpdated, children }: LayoutProps) => {
  return (
    <main className="min-h-screen bg-surface px-5 py-12 text-gray-200 sm:px-8">
      <article className="mx-auto max-w-3xl space-y-7 text-base leading-7">
        <header className="space-y-3 border-b border-white/10 pb-7">
          <BackToPortfolio />
          <p className="text-sm font-semibold tracking-widest text-accent">{game}</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
        </header>
        {children}
      </article>
    </main>
  );
};

type SectionProps = { title: string; children: ReactNode };

export const PolicySection = ({ title, children }: SectionProps) => {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
};
