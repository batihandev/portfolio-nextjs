import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { Person, WebSite, WithContext } from "schema-dts";
import { pageInfo, socials } from "@/data";
import ToasterClient from "@/componenets/ToasterClient";

const SITE_URL = "https://batihanozdemir.com";
const TITLE = `${pageInfo.name} — ${pageInfo.role} | TypeScript, Node.js, NestJS`;
const DESCRIPTION = `${pageInfo.name} is a backend engineer (3+ years professional, 5+ years overall) building production systems with TypeScript, Node.js, NestJS, PostgreSQL, Redis, and AWS. Portfolio, experience, and contact.`;
const PROFILE_IMAGE = `${SITE_URL}${pageInfo.profileImage}`;
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#242424",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${pageInfo.name}`,
  },
  description: DESCRIPTION,
  applicationName: pageInfo.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  authors: [{ name: pageInfo.name, url: SITE_URL }],
  creator: pageInfo.name,
  publisher: pageInfo.name,
  category: "technology",
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: pageInfo.name,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    firstName: pageInfo.name.split(" ")[0],
    lastName: pageInfo.name.split(" ").slice(1).join(" "),
    username: "batihandev",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${pageInfo.name} — ${pageInfo.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@batihandev",
    creator: "@batihandev",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  verification: {
    // Add Google Search Console verification token here when registered
    // google: "your-verification-token",
  },
};

const personJsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}#person`,
  name: pageInfo.name,
  givenName: "Batıhan",
  familyName: "Özdemir",
  alternateName: ["Batihan Ozdemir", "batihandev"],
  url: SITE_URL,
  image: PROFILE_IMAGE,
  jobTitle: pageInfo.role,
  description: DESCRIPTION,
  email: `mailto:${pageInfo.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tekirdağ",
    addressCountry: "TR",
  },
  nationality: { "@type": "Country", name: "Turkey" },
  knowsAbout: [
    "Backend Engineering",
    "TypeScript",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "Redis",
    "AWS",
    "REST APIs",
    "Distributed Systems",
    "React",
    "Next.js",
  ],
  knowsLanguage: ["English", "Turkish"],
  sameAs: socials.map((s) => s.url),
};

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: pageInfo.name,
  description: DESCRIPTION,
  inLanguage: "en",
  author: { "@id": `${SITE_URL}#person` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href={pageInfo.heroImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {children}
        <ToasterClient />
      </body>
    </html>
  );
}
