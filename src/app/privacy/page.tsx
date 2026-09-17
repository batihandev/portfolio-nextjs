import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { ContactEmail, PolicyLayout, PolicySection } from "@/components/policy/Policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.url} handles contact messages and what the site does not collect.`,
  alternates: { canonical: "/privacy" },
};

const gamePolicies = [
  { name: "INEVITABLE", href: "/games/inevitable/privacy" },
  { name: "WhichWay", href: "/games/whichway/privacy" },
];

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" lastUpdated="September 17, 2026">
      <p>
        This policy covers the website {site.url}, run by {site.name}. It is a personal portfolio. The games have
        their own policies, linked at the end.
      </p>
      <PolicySection title="What the site collects">
        <p>
          The site has no accounts or analytics and sets no cookies of its own. I do not use browsing data for
          tracking or advertising.
        </p>
      </PolicySection>
      <PolicySection title="The contact form">
        <p>
          If you use the contact form, the name, email address, subject and message you enter are sent to me by
          email through Google (Gmail) so I can reply. They are kept as email for as long as the conversation needs
          and are not shared with anyone else or used for advertising.
        </p>
        <p>
          The form is protected by Google reCAPTCHA, which checks that a request comes from a person. reCAPTCHA
          may collect device and browser information and set cookies; the Google{" "}
          <a href="https://policies.google.com/privacy">Privacy Policy</a> and{" "}
          <a href="https://policies.google.com/terms">Terms of Service</a> apply to it.
        </p>
      </PolicySection>
      <PolicySection title="Hosting">
        <p>
          The site is hosted on Vercel, which processes standard request data such as IP addresses to serve pages
          and keep the service secure, under the{" "}
          <a href="https://vercel.com/legal/privacy-policy">Vercel privacy policy</a>.
        </p>
      </PolicySection>
      <PolicySection title="External links">
        <p>
          Links to YouTube, Google Play, GitHub, LinkedIn and X take you to those services, which have their own
          privacy policies.
        </p>
      </PolicySection>
      <PolicySection title="Game privacy policies">
        <ul>
          {gamePolicies.map((game) => (
            <li key={game.href}>
              <Link href={game.href}>{game.name}</Link>
            </li>
          ))}
        </ul>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          Questions about this policy, or a request to delete a message you sent, can go to <ContactEmail />.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}
