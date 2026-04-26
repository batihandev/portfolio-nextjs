import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { Person, WithContext } from "schema-dts";
import { pageInfo, socials } from "@/data";
import ToasterClient from "@/componenets/ToasterClient";

const SITE_URL = "https://batihanozdemir.com";
const TITLE = `${pageInfo.name} | ${pageInfo.role}`;
const DESCRIPTION =
  "Backend engineer with 3+ years professional and 5+ years overall software development experience. TypeScript, Node.js, NestJS, PostgreSQL, Redis, AWS. Production APIs, integrations, and high-concurrency systems.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#242424",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  authors: [{ name: pageInfo.name, url: SITE_URL }],
  keywords: [
    "Batıhan Özdemir",
    "Backend Engineer",
    "TypeScript",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "Redis",
    "AWS",
    "MCP",
    "Portfolio",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

const jsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: pageInfo.name,
  url: SITE_URL,
  jobTitle: pageInfo.role,
  description: DESCRIPTION,
  sameAs: socials.map((s) => s.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
