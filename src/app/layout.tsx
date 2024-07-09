import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Person, WithContext } from "schema-dts";
import Head from "next/head";
export const metadata: Metadata = {
  title: "Batıhan Özdemir",
  description: "Batıhan Özdemir's Portfolio @batihandev",
  keywords:
    "Batıhan Özdemir, Web Developer, Web Designer, Portfolio, @batihandev, Next.js, React, TailwindCSS, Nuxt.js, Vue, Node.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Batıhan Özdemir",
    url: "https://www.batihan.dev",
    description: "Batıhan Özdemir's Portfolio @batihandev",
    sameAs: [
      "https://www.x.com/batihandev",
      "https://www.github.com/batihandev",
      "https://www.linkedin.com/in/batihandev",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <body>{children}</body>
    </html>
  );
}
