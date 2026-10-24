import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { WhichWayPrivacyPolicy } from "@/components/WhichWayPrivacyPolicy";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "WhichWay Privacy Policy",
    description: "Privacy policy for the WhichWay game.",
    path: "/games/whichway/privacy",
  }),
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function WhichWayPrivacyPage() {
  return <WhichWayPrivacyPolicy />;
}
