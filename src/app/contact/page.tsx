import type { Metadata } from "next";
import { site } from "@/data/site";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";

export const metadata: Metadata = {
  title: "Contact",
  description: `Send a message to ${site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <Container className="max-w-3xl py-14">
        <PageTitle>Say hello</PageTitle>
        <p className="mt-4 text-lg text-muted">
          Want to chat about something? Send me a message here, or email{" "}
          <a href={`mailto:${site.email}`} className="font-mono text-ink underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
        <div className="mt-8 bg-paper p-6 shadow-paper sm:p-8">
          <ContactForm />
        </div>
      </Container>
    </main>
  );
}
