import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/data/site";
import { ContactEmail, PolicyLayout, PolicySection } from "@/components/policy/Policy";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Readrove Privacy Policy",
    description: "How Readrove handles your books, selected text, downloads and support requests.",
    path: "/readrove/privacy",
  }),
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ReadrovePrivacyPage() {
  return (
    <PolicyLayout eyebrow="READROVE" title="Privacy Policy" lastUpdated="November 11, 2026">
      <p>
        Readrove is a book reader for iPhone and iPad, developed by {site.name} (BatihanDev). This policy covers the app
        and explains what stays on your device and what leaves it.
      </p>
      <PolicySection title="Your library stays on your device">
        <p>
          You do not need an account. Readrove has no advertising and no cross-app tracking. Your books, reading
          positions, bookmarks, annotations, notes, imported fonts and dictionaries, reading statistics, downloaded
          models and settings are stored on your device and are not uploaded to our servers. Readrove does not run a
          cloud sync service.
        </p>
        <p>
          You can remove this data in the app or by deleting the app. Your device backup settings may keep or restore
          app data separately; manage those copies through your device or Apple account settings.
        </p>
      </PolicySection>
      <PolicySection title="Selected text, translation and lookup">
        <p>
          Selecting text identifies its language on your device. Selecting alone never translates anything and never
          downloads a model. Pronounce and Read Aloud use the speech voices built into your device.
        </p>
        <p>
          The default Translate action hands only the selected text to the translation sheet built into iOS. That system
          feature controls its own languages, processing and network use under Apple&apos;s privacy policy, and Readrove
          does not receive the result.
        </p>
        <p>
          The optional in-app translation, labelled Translate with Google, uses Google ML Kit language models that you
          choose to download. The text is translated on your device. If a model is missing or fails, your text is not
          sent to an online translation service.
        </p>
        <p>
          Pronunciation in IPA comes from a dictionary bundled with the app. If you turn on &quot;Allow online IPA
          lookup&quot;, a missing entry is requested from English Wiktionary, which sends the selected word and its
          language to Wikimedia. Definitions can also come from Wiktionary, depending on your setting. Web search and
          external dictionary actions open your browser and send the text you chose to the service you picked. These
          services receive your IP address and apply their own policies; see the{" "}
          <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy">Wikimedia privacy policy</a>.
        </p>
      </PolicySection>
      <PolicySection title="Downloads and PDF text">
        <p>
          Downloading a translation model or a PDF text recognition model contacts Google, Apple, GitHub or Hugging Face
          servers, as applicable. Like any download, this sends ordinary connection information such as your IP address
          and the name of the model. The pages of your PDFs are processed on your device.
        </p>
      </PolicySection>
      <PolicySection title="Camera">
        <p>Reading does not use the camera. Eye tracking is not part of this beta, and the app does not request it.</p>
      </PolicySection>
      <PolicySection title="Service providers">
        <p>
          Google ML Kit, which provides the in-app translation, declares that it collects device identifiers, configured
          language and model information, diagnostics, performance data and product interaction data for functionality
          and analytics, not for tracking. See the{" "}
          <a href="https://policies.google.com/privacy">Google Privacy Policy</a>. If you install Readrove through
          TestFlight, Apple may collect crash reports and the feedback you send, according to your settings and
          Apple&apos;s terms. We do not sell personal information.
        </p>
      </PolicySection>
      <PolicySection title="Contacting us">
        <p>
          If you email us, we receive your email address and whatever you choose to send, such as a description of a
          problem or a screenshot. We use it only to respond, keep it only as long as needed to resolve your request,
          and you may ask us to delete it. Please do not send private books, passwords or other sensitive information.
        </p>
      </PolicySection>
      <PolicySection title="Children's privacy">
        <p>
          We do not knowingly collect personal information from children through the app. If a child sends personal
          information through a support request, a parent or guardian may contact us to request its deletion.
        </p>
      </PolicySection>
      <PolicySection title="Changes and contact">
        <p>
          We will update this page and its date if the app&apos;s data practices change. For privacy questions or
          requests, contact {site.name} at <ContactEmail />.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
