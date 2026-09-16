import type { Metadata } from "next";
import WhichWayPrivacyPolicy from "@/componenets/WhichWayPrivacyPolicy";

export const metadata: Metadata = {
  title: "WhichWay Privacy Policy",
  description: "Privacy policy for the WhichWay game.",
  alternates: { canonical: "/games/whichway/privacy" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function LegacyWhichWayPrivacyPage() {
  return <WhichWayPrivacyPolicy />;
}
