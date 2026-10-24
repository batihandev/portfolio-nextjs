"use client";

import { routes } from "@/data/site";
import { Button, LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";

type Props = { error: Error & { digest?: string }; retry: () => void };

/** Shown when a page fails while rendering. The error's own message stays in the server log. */
export default function ErrorPage({ retry }: Props) {
  return (
    <main id="main">
      <Container className="max-w-3xl py-14">
        <PageTitle>This page did not load</PageTitle>
        <p className="text-muted mt-4 text-lg">Try again, or go back to the home page.</p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Button onClick={() => retry()}>Try again</Button>
          <LinkButton href={routes.home} variant="secondary">
            Home page
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
