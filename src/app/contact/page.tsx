import type { Metadata } from "next";
import { site } from "@/data/site";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: `Send a message to ${site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <Container className="max-w-3xl py-14">
        <h1 className="font-display text-[clamp(36px,5vw,54px)] leading-[1.02] font-extrabold tracking-tighter">Say hello</h1>
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
