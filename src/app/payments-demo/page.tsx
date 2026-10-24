import type { Metadata } from "next";
import { Suspense } from "react";
import { routes, site } from "@/data/site";
import { pageMetadata } from "@/lib/metadata";
import { loadDemoSnapshot } from "@/lib/payments-demo/load";
import { DemoDetails, DetailsPlaceholder } from "@/components/payments-demo/DemoDetails";
import { StageFlow } from "@/components/payments-demo/StageFlow";
import { TRY_PAYMENT_ID } from "@/components/payments-demo/TryPayment";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageTitle } from "@/components/ui/Heading";
import { Receipt, ReceiptRow, ReceiptRule, ReceiptTitle } from "@/components/ui/Receipt";
import { Section } from "@/components/ui/Section";

/** The page is static with ISR; a dynamic API anywhere under it fails the build instead of making it dynamic. */
export const dynamic = "error";

export const metadata: Metadata = pageMetadata({
  title: "Payment demo",
  description:
    "A small payment system that takes test purchases by test card and on a test network, tracks each one to a single ledger and tells the shop when it is paid.",
  path: routes.paymentsDemo,
});

/** "50 confirmations", or a phrase without a number when the demo's target is not known. */
const confirmationsText = (needed: number | null) => (needed ? `${needed} confirmations` : "enough confirmations");

const rails = (needed: number | null) => [
  {
    title: "TEST CARD",
    rows: [
      ["Runs on", "Stripe test mode"],
      ["Pays with", "A saved test card"],
      ["Settles on", "A signed webhook"],
      ["No webhook", "A job asks Stripe"],
    ],
    note: "Nobody enters card details. Only test keys are accepted.",
  },
  {
    title: "TEST NETWORK",
    rows: [
      ["Runs on", "Base Sepolia (test)"],
      ["Pays with", "Test USDC"],
      ["Matched by", "Its unique amount"],
      ["Settles after", confirmationsText(needed)],
    ],
    note: "Test tokens only. No real money moves.",
  },
];

const stages = (needed: number | null) => [
  ["Sent", "The demo sends the payment: a transfer, or a card charge."],
  ["Received", "The tracker sees the transfer on the test network."],
  ["Confirming", `New blocks are built on top; the payment waits for ${needed ?? "enough of them"}.`],
  ["Processing", "Stripe is working on the card charge."],
  ["Settled", "One entry is written to the ledger."],
  ["Shop notified", "The shop gets a signed notice that the order is paid."],
];

const reliability = (needed: number | null) =>
  [
    [
      "Idempotent charges",
      "Each card charge carries a key made from its order, and a retried transfer resends the same signed one, so nothing is paid twice.",
    ],
    [
      "Signed webhooks, handled once",
      "Stripe webhooks are accepted only with a valid signature, and an event that arrives again changes nothing.",
    ],
    [
      "Reconciliation",
      "When a webhook never comes, a job asks Stripe for the payment and applies the answer the same way.",
    ],
    [
      "Confirmations and reorgs",
      `A network payment settles after ${confirmationsText(needed)}; if its block is replaced before then, it goes back and is tracked again.`,
    ],
    ["One ledger", "Card and network payments share one ledger, with one entry per payment."],
    [
      "Limits and a daily budget",
      "Visitor purchases have per-visitor and daily limits, and scheduled purchases stay within a daily budget, so the demo runs on free test services at no cost.",
    ],
  ] as const;

async function LiveDetails() {
  return <DemoDetails snapshot={await loadDemoSnapshot()} />;
}

export default async function PaymentsDemoPage() {
  // The same cached read as the live part, so the copy states the target the tracker uses.
  const needed = (await loadDemoSnapshot())?.confirmations ?? null;
  return (
    <main id="main">
      <Container>
        <div className="max-w-[700px] pt-14 pb-2">
          <PageTitle>Payment demo</PageTitle>
          <p className="text-muted mt-4 text-lg">
            A small payment system I built. It takes test purchases by test card and on a test network, follows each
            payment from checkout to a single ledger, and tells the shop when the order is paid. It runs on test money
            only.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            <LinkButton href={`#${TRY_PAYMENT_ID}`}>Try a test payment</LinkButton>
            <LinkButton href={site.links.paymentsDemoRepo} variant="secondary">
              Source on GitHub
            </LinkButton>
          </div>
        </div>

        <Section title="Two ways to pay" intro="Both rails end in the same ledger.">
          <div className="grid items-start gap-6 sm:grid-cols-2">
            {rails(needed).map((rail) => (
              <Receipt key={rail.title} className="px-5 pt-6 pb-9 text-[14px] leading-6 sm:px-6">
                <ReceiptTitle>{rail.title}</ReceiptTitle>
                <ReceiptRule />
                <div className="grid gap-1.5">
                  {rail.rows.map(([label, value]) => (
                    <ReceiptRow key={label} label={<span className="whitespace-nowrap">{label}</span>} value={value} />
                  ))}
                </div>
                <ReceiptRule />
                <p className="text-muted text-[13px]">{rail.note}</p>
              </Receipt>
            ))}
          </div>
        </Section>

        <Section title="How a payment moves" intro="The stages a payment goes through on each rail.">
          <div className="bg-paper shadow-paper grid gap-6 px-5 py-5 font-mono sm:px-6">
            <StageFlow needed={needed} />
            <hr className="border-line border-t-[1.5px] border-dashed" />
            <dl className="grid gap-x-6 gap-y-2 text-[13px] leading-5 sm:grid-cols-2">
              {stages(needed).map(([stage, text]) => (
                <div key={stage}>
                  <dt className="font-bold">{stage}</dt>
                  <dd className="text-muted">{text}</dd>
                </div>
              ))}
              <div>
                <dt className="text-accent-strong font-bold">Did not go through</dt>
                <dd className="text-muted">
                  A declined test card, or a transfer that can never land. Nothing is credited.
                </dd>
              </div>
            </dl>
          </div>
        </Section>

        <Section title="What makes it reliable">
          <Receipt className="px-5 pt-6 pb-9 text-[14px] leading-6 sm:px-7">
            <ol className="grid">
              {reliability(needed).map(([title, text], i) => (
                <li
                  key={title}
                  className="border-line grid gap-x-4 border-b-[1.5px] border-dashed py-3 last:border-0 sm:grid-cols-[2rem_15rem_minmax(0,1fr)]"
                >
                  <span className="text-muted hidden sm:block">{String(i + 1).padStart(2, "0")}</span>
                  <b className="font-sans text-[15px]">{title}</b>
                  <span className="text-muted font-sans text-[15px]">{text}</span>
                </li>
              ))}
            </ol>
          </Receipt>
        </Section>

        <Section
          title="The demo right now"
          intro="Real test payments from the running demo: figures for today, settle times for two weeks and the latest receipts."
        >
          <Suspense fallback={<DetailsPlaceholder />}>
            <LiveDetails />
          </Suspense>
        </Section>
      </Container>
    </main>
  );
}
