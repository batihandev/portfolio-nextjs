import { site } from "@/data/site";
import { ContactEmail, PolicyLayout, PolicySection } from "@/components/policy/Policy";

// Served at both /gameprivacy (the URL on the existing Play listing) and /games/whichway/privacy.
export const WhichWayPrivacyPolicy = () => {
  return (
    <PolicyLayout eyebrow="WHICHWAY" title="Privacy Policy" lastUpdated="September 16, 2026">
      <p>
        WhichWay is developed by {site.name} (BatihanDev). This policy
        covers the Android game and explains what information the game and the
        services it uses handle.
      </p>
      <PolicySection title="Playing the game">
        <p>
          You do not need an account to play. Your best score, sound volume,
          remove-ads status and similar settings are stored locally on your
          device and are not uploaded to our servers. We do not run our own
          servers for the game and do not receive your gameplay data.
        </p>
      </PolicySection>
      <PolicySection title="Advertising">
        <p>
          The game shows banner, interstitial and optional rewarded ads through
          Google AdMob. To serve and measure ads, AdMob may collect your
          device&apos;s advertising ID, IP address, device and app information,
          and how you interact with ads, and may use it for personalized
          advertising where permitted. You can reset or delete your advertising
          ID and limit ad personalization in your Android settings. See{" "}
          <a href="https://policies.google.com/technologies/partner-sites">
            how Google uses information from apps that use its services
          </a>
          .
        </p>
      </PolicySection>
      <PolicySection title="Google Play Games leaderboards">
        <p>
          If you sign in with Google Play Games, the game submits your scores
          to its leaderboards. Google processes your Play Games profile and
          scores, and your profile name and score may be visible to other
          players according to your Play Games settings. You can play without
          signing in.
        </p>
      </PolicySection>
      <PolicySection title="Remove ads purchase">
        <p>
          The optional remove-ads purchase is processed by Google Play. We do
          not receive your payment details; the game only receives confirmation
          of the purchase so it can turn ads off.
        </p>
      </PolicySection>
      <PolicySection title="Service providers">
        <p>
          Google (AdMob, Play Games and Play billing) and Unity Technologies,
          whose engine and purchasing services the game is built with, process
          information under their own privacy policies:{" "}
          <a href="https://policies.google.com/privacy">
            Google Privacy Policy
          </a>{" "}
          and{" "}
          <a href="https://unity.com/legal/privacy-policy">
            Unity Privacy Policy
          </a>
          . We do not sell personal information.
        </p>
      </PolicySection>
      <PolicySection title="Contacting us">
        <p>
          If you email us, we receive your email address and whatever you
          choose to send. We use it only to respond, keep it only as long as
          needed to resolve your request, and you may ask us to delete it.
        </p>
      </PolicySection>
      <PolicySection title="Children's privacy">
        <p>
          The game is not directed at children under 13, and we do not
          knowingly collect personal information from them. If you believe a
          child has sent us personal information, contact us and we will
          delete it.
        </p>
      </PolicySection>
      <PolicySection title="Changes and contact">
        <p>
          We will update this page and its date if the game&apos;s data
          practices change. For privacy questions or requests, contact{" "}
          {site.name} at <ContactEmail />.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
};

