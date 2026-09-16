import type { Metadata } from "next";
import { pageInfo } from "@/data";
import ContactEmail from "@/componenets/ContactEmail";
import { GamePrivacyLayout, PolicySection } from "@/componenets/GamePrivacy";

export const metadata: Metadata = {
  title: "INEVITABLE Privacy Policy",
  description: "How INEVITABLE handles game saves, device features and support requests.",
  alternates: { canonical: "/games/inevitable/privacy" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function InevitablePrivacyPage() {
  return (
    <GamePrivacyLayout game="INEVITABLE" lastUpdated="September 16, 2026">
      <p>
        INEVITABLE is developed by {pageInfo.name} (BatihanDev). This policy
        covers the Android game and explains how game data and privacy inquiries
        are handled.
      </p>
      <PolicySection title="Playing the game">
        <p>
          You do not need an account to play. The game does not include
          advertising, in-app purchases, social features or a developer-operated
          online leaderboard. We do not collect or share personal data through
          gameplay, and do not use advertising identifiers or player analytics.
          Unity engine diagnostics collection is disabled in this release.
        </p>
      </PolicySection>
      <PolicySection title="Saves and device features">
        <p>
          Progress, unlocks, scores and settings are stored locally on your
          device. The game may keep local backup copies to recover a damaged
          save. These files are not uploaded to our servers. Haptic feedback
          uses the device vibration feature and can be controlled in the game
          settings; it does not collect personal data.
        </p>
        <p>
          Local data stays until it is replaced or deleted. You can remove it
          by clearing the app storage in Android settings or uninstalling the
          game. Your device or platform backup settings may retain or restore
          app data separately; manage those copies through your device or
          Google account settings.
        </p>
      </PolicySection>
      <PolicySection title="Contacting us">
        <p>
          If you email us, we receive your email address and whatever you
          choose to send, such as a description of a problem or an attached
          screenshot. We use that information to respond and provide support.
          Please do not send passwords or other sensitive information.
        </p>
        <p>
          Support correspondence is processed by our email provider and kept
          only as needed to resolve your request and meet any applicable legal
          obligations. We restrict access to support correspondence and do not
          sell it or use it for advertising. You may request deletion using
          the contact address below.
        </p>
      </PolicySection>
      <PolicySection title="External services and links">
        <p>
          Google Play and Android may process information under their own
          privacy policies when you download, update or back up apps. Opening
          a website from the game takes you outside the game. Website hosting
          and any information you submit there are governed by that
          website&apos;s privacy policy, separately from local gameplay.
        </p>
      </PolicySection>
      <PolicySection title="Children's privacy">
        <p>
          We do not knowingly collect personal information from children
          through the game. If a child sends personal information through a
          support request, a parent or guardian may contact us to request its
          deletion.
        </p>
      </PolicySection>
      <PolicySection title="Changes and contact">
        <p>
          We will update this page and its date if the game&apos;s data
          practices change. For privacy questions or requests, contact
          {" "}{pageInfo.name} at{" "}
          <ContactEmail />.
        </p>
      </PolicySection>
    </GamePrivacyLayout>
  );
}
