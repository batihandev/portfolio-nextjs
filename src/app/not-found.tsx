import type { Metadata } from "next";
import { routes } from "@/data/site";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";
import { Receipt, ReceiptRow, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main">
      <Container className="grid max-w-3xl gap-8 py-14 sm:grid-cols-[minmax(0,1fr)_16rem] sm:items-start">
        <div>
          <PageTitle>Page not found</PageTitle>
          <p className="text-muted mt-4 text-lg">There is no page at this address. It may have moved.</p>
          <LinkButton href={routes.home} className="mt-7">
            Home page
          </LinkButton>
        </div>
        <Receipt className="text-[14px]">
          <ReceiptTitle>NO SUCH PAGE</ReceiptTitle>
          <ReceiptRule />
          <ReceiptRow label="Status" value="404" />
          <ReceiptRow label="Items" value="0" />
          <ReceiptRule />
          <div className="text-center">NOTHING TO PRINT</div>
        </Receipt>
      </Container>
    </main>
  );
}
