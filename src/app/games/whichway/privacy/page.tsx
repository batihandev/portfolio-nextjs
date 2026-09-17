import type { Metadata } from "next";
import { WhichWayPrivacyPolicy } from "@/components/WhichWayPrivacyPolicy";

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

export default function WhichWayPrivacyPage() {
  return <WhichWayPrivacyPolicy />;
}
