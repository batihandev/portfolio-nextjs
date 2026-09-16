import type { Metadata } from "next";
import WhichWayPrivacy from "../../../gameprivacy/page";
import styles from "./privacy.module.css";

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

// Keep the existing published policy as the single content source.
// This adds a dedicated URL without changing the existing /gameprivacy route.
export default function WhichWayPrivacyPage() {
  return (
    <main className={styles.policy}>
      <p className={styles.game}>WHICHWAY</p>
      <WhichWayPrivacy />
    </main>
  );
}

