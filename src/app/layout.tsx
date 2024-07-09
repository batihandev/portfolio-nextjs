import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Batıhan Özdemir",
  description: "Batıhan Özdemir's Portfolio @batihandev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>{children}</body>
    </html>
  );
}
