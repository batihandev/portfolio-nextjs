import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import type { Person, WebSite, WithContext } from "schema-dts";
import { site, socials } from "@/data/site";
import { jsonLd } from "@/lib/json-ld";
import { themeInitScript } from "@/lib/theme-init";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";

const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono" });

const TITLE = `${site.name}, ${site.role}`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: TITLE, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  openGraph: {
    type: "profile",
    siteName: site.name,
    title: TITLE,
    description: site.description,
    locale: "en_US",
    firstName: site.firstName,
    lastName: site.familyName,
    username: site.handle,
  },
  twitter: { card: "summary_large_image", site: `@${site.handle}`, creator: `@${site.handle}` },
};

const personJsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.url}#person`,
  name: site.name,
  givenName: site.firstName,
  familyName: site.familyName,
  alternateName: ["Batihan Ozdemir", site.handle],
  url: site.url,
  image: `${site.url}/opengraph-image`,
  jobTitle: site.role,
  description: site.description,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: site.location.city, addressCountry: site.location.countryCode },
  knowsLanguage: [...site.languages],
  knowsAbout: [
    "Backend engineering",
    "TypeScript",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "Redis",
    "Payment systems",
    "AWS",
  ],
  sameAs: socials.map((s) => s.url),
};

const websiteJsonLd: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}#website`,
  url: site.url,
  name: site.name,
  description: site.description,
  inLanguage: "en",
  author: { "@id": `${site.url}#person` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${jakarta.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <a
          href="#main"
          className="bg-paper text-ink shadow-paper sr-only rounded-[10px] px-4 py-3 font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }} />
      </body>
    </html>
  );
}
