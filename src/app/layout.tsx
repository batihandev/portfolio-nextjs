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
        <meta property="og:url" content="https://batihan.dev" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Batıhan Özdemir" />
        <meta
          property="og:description"
          content="Batıhan Özdemir's Portfolio @batihandev"
        />
        <meta property="og:image" content="https://batihan.dev/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="batihan.dev" />
        <meta property="twitter:url" content="https://batihan.dev" />
        <meta name="twitter:title" content="Batıhan Özdemir" />
        <meta
          name="twitter:description"
          content="Batıhan Özdemir's Portfolio @batihandev"
        />
        <meta name="twitter:image" content="https://batihan.dev/og-image.jpg" />
      </head>
      <link rel="icon" href="/favicon.ico" sizes="any" />

      <body>{children}</body>
    </html>
  );
}
