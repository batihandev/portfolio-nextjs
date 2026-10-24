import type { Metadata } from "next";
import { routes, site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/ContactForm";
import { ToasterClient } from "@/components/ToasterClient";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";

/** The page is static; a dynamic API anywhere under it fails the build instead of making it dynamic. */
export const dynamic = "error";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Send a message to ${site.name}.`,
  path: routes.contact,
});

export default function ContactPage() {
  return (
    <main id="main">
      <Container className="max-w-3xl py-14">
        <PageTitle>Say hello</PageTitle>
        <p className="text-muted mt-4 text-lg">
          Want to chat about something? Send me a message here, or email{" "}
          <a href={`mailto:${site.email}`} className="text-ink font-mono underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
        <div className="bg-paper shadow-paper mt-8 p-6 sm:p-8">
          <ContactForm />
        </div>
      </Container>
      <ToasterClient />
    </main>
  );
}
