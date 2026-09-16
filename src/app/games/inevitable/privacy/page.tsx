import type { Metadata } from "next";
import { pageInfo } from "@/data";
import BackToPortfolio from "@/componenets/BackToPortfolio";

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
    <main className="min-h-screen bg-surface px-5 py-12 text-gray-200 sm:px-8">
      <article className="mx-auto max-w-3xl space-y-7 text-base leading-7">
        <header className="space-y-3 border-b border-white/10 pb-7">
          <BackToPortfolio />
          <p className="text-sm font-semibold tracking-widest text-accent">INEVITABLE</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: September 15, 2026</p>
        </header>
        <p>
          INEVITABLE is developed by {pageInfo.name} (BatihanDev). This policy
          covers the Android game and explains how game data and privacy inquiries
          are handled.
        </p>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Playing the game</h2>
          <p>
            You do not need an account to play. The game does not include
            advertising, in-app purchases, social features or a developer-operated
            online leaderboard. We do not collect or share personal data through
            gameplay, and do not use advertising identifiers or player analytics.
            Unity engine diagnostics collection is disabled in this release.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Saves and device features</h2>
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
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Contacting us</h2>
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
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">External services and links</h2>
          <p>
            Google Play and Android may process information under their own
            privacy policies when you download, update or back up apps. Opening
            a website from the game takes you outside the game. Website hosting
            and any information you submit there are governed by that
            website&apos;s privacy policy, separately from local gameplay.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Children&apos;s privacy</h2>
          <p>
            We do not knowingly collect personal information from children
            through the game. If a child sends personal information through a
            support request, a parent or guardian may contact us to request its
            deletion.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Changes and contact</h2>
          <p>
            We will update this page and its date if the game&apos;s data
            practices change. For privacy questions or requests, contact
            {" "}{pageInfo.name} at{" "}
            <a className="break-all text-accent underline underline-offset-4" href={`mailto:${pageInfo.email}`}>
              {pageInfo.email}
            </a>.
          </p>
        </section>
      </article>
    </main>
  );
}
