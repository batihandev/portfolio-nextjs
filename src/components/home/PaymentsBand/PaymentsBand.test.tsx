import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoClient, PURCHASE_DEADLINE_MS } from "@/lib/payments-demo/client";
import { DEMO_COPY } from "@/lib/payments-demo/copy";
import { demoPayment } from "@/lib/payments-demo/test-data";
import { FakeStream } from "@/lib/payments-demo/test-stream";
import type { DemoSnapshot } from "@/lib/payments-demo/types";
import { BandBoundary } from "./BandBoundary";
import { PaymentsBand } from "./PaymentsBand";

const API = "http://demo.test";
const ORDER = "6f1c4a52-3a43-4c38-9a71-0c2b8f1d2e3a";
const ORDER_2 = "7a2d5b63-4b54-4d49-8b82-1d3c9a2e3f4b";
const ORDER_LIFETIME_MS = 30 * 60_000;
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const snapshot = (): DemoSnapshot => ({
  payments: [
    demoPayment({
      id: id(1),
      order: { id: id(11), item: "Lucky paperclip", price: "500000" },
    }),
    demoPayment({
      id: id(2),
      provider: "chain",
      order: { id: id(12), item: "Tiny victory trumpet", price: "650000" },
    }),
  ],
  stats: {
    settledCount: 12,
    averageTimeToSettleMs: 4200,
    duplicatesSkipped: 0,
    failuresRecovered: 0,
  },
  daily: [],
  confirmations: 10,
  fetchedAt: new Date().toISOString(),
});

type Route = (init?: RequestInit) => Promise<Response>;

function demo(routes: { health?: Route; purchase?: Route[]; payments?: Route; stats?: Route } = {}) {
  FakeStream.opened = [];
  const purchases = [...(routes.purchase ?? [])];
  const fetch = vi.fn((input: string, init?: RequestInit) => {
    const path = input.slice(API.length);
    if (path === "/health")
      return (routes.health ?? (async () => json({ cardAvailable: true, confirmations: 10 })))(init);
    if (path === "/payments?limit=20" && routes.payments) return routes.payments(init);
    if (path === "/stats" && routes.stats) return routes.stats(init);
    if (path === "/test-purchases" && init?.method === "POST") {
      const next = purchases.shift();
      return next ? next(init) : Promise.resolve(json({ error: "internal" }, 500));
    }
    return Promise.resolve(json({ error: "not_found" }, 404));
  });
  return new DemoClient(API, fetch, FakeStream.create);
}

const accepted =
  (overrides: Record<string, unknown> = {}) =>
  async () =>
    json(
      {
        orderId: ORDER,
        item: "Coffee",
        price: "500000",
        expiresAt: new Date(Date.now() + ORDER_LIFETIME_MS).toISOString(),
        ...overrides,
      },
      202,
    );

const stream = () => {
  const current = FakeStream.opened.at(-1);
  if (!current) throw new Error("no stream opened");
  return current;
};

const receipt = () => screen.getByRole("region", { name: "Your test receipt" });

const notice = () => screen.getByRole("status", { name: "Printer notice" });
const button = (name: string) => screen.getByRole("button", { name });
const locked = (name: string) => button(name).getAttribute("aria-disabled") === "true";
const fakeTime = () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  return userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
};
const CAPTION = "Median and split: last 20 payments. Today and duplicates: the UTC day.";
const figure = (label: string) => screen.getByText(label).nextSibling;
const stats = (settledCount: number, duplicatesSkipped: number) =>
  json({ settledCount, averageTimeToSettleMs: 4000, duplicatesSkipped, failuresRecovered: 0 });
const lookOf = (item: HTMLElement) => /bg-ticket-\d/.exec(item.innerHTML)?.[0];

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PaymentsBand", () => {
  it("prints a receipt after a test purchase", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());

    await user.click(await screen.findByRole("button", { name: "Test card" }));

    expect(await within(receipt()).findByText("Coffee")).toBeInTheDocument();
    expect(within(receipt()).getByText("$0.50")).toBeInTheDocument();
    expect(within(receipt()).getByText(/^Test card/)).toBeInTheDocument();

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "processing",
          settledAt: null,
          processingAt: "2026-10-24T10:00:02.000Z",
          version: 2,
        }),
      ),
    );
    expect(within(receipt()).getByTestId("stage-processing")).toHaveAttribute("data-reached", "true");
    expect(within(receipt()).getByTestId("stage-settled")).toHaveAttribute("data-reached", "false");

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "settled",
          version: 3,
        }),
      ),
    );
    expect(within(receipt()).getByTestId("stage-settled")).toHaveAttribute("data-reached", "true");
    expect(within(receipt()).queryByRole("link", { name: /View details/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View details/ })).toHaveAttribute("href", "/payments-demo");
  });

  it("says a purchase did not go through when its order closes", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");

    act(() => stream().send({ type: "order", id: ORDER, closed: true }, "order"));

    expect(within(receipt()).getByText(DEMO_COPY.not_completed)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test network" })).toBeEnabled();
  });

  it("shows a calm closed line when the shop is paused", async () => {
    const user = userEvent.setup();
    const client = demo({
      purchase: [accepted(), async () => json({ error: "paused" }, 503)],
    });
    render(<PaymentsBand snapshot={snapshot()} client={client} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(receipt()).findByText("Coffee");
    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "settled",
          version: 3,
        }),
      ),
    );

    await user.click(screen.getByRole("button", { name: "Test card" }));

    expect(await screen.findByRole("status", { name: "Printer notice" })).toHaveTextContent(DEMO_COPY.paused);
    expect(within(receipt()).getByText("Coffee")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("changes the idle receipt when the shop is closed", async () => {
    const user = userEvent.setup();
    const client = demo({
      purchase: [async () => json({ error: "paused" }, 503)],
    });
    render(<PaymentsBand snapshot={snapshot()} client={client} />);
    act(() => stream().open());
    const idle = screen.getByRole("region", { name: "Test shop" });
    expect(idle).toHaveTextContent("Press a button above");

    await user.click(screen.getByRole("button", { name: "Test network" }));

    expect(
      await within(idle).findByText("The test shop is closed for now. The list shows the latest test purchases."),
    ).toBeInTheDocument();
    expect(idle).not.toHaveTextContent("Press a button above");
  });

  it("keeps the list and shows a paused note when the stream drops", async () => {
    render(<PaymentsBand snapshot={snapshot()} client={demo()} />);
    const list = screen.getByRole("list", { name: "Recent test purchases" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    act(() => stream().open());
    expect(screen.queryByText("Live updates paused")).not.toBeInTheDocument();

    act(() => stream().drop());

    expect(screen.getByText("Live updates paused")).toBeInTheDocument();
    expect(within(list).getByText("Lucky paperclip")).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);

    act(() => stream().open());
    expect(screen.queryByText("Live updates paused")).not.toBeInTheDocument();
  });

  it("renders the resting state without a snapshot", () => {
    render(<PaymentsBand snapshot={null} client={demo()} />);
    expect(screen.getByText(/The demo is resting/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View details/ })).toHaveAttribute("href", "/payments-demo");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Figures show here while the demo runs.")).toBeInTheDocument();
    expect(FakeStream.opened).toHaveLength(0);
  });

  it("falls back to resting when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Broken = () => {
      throw new Error("render bug");
    };
    render(
      <BandBoundary>
        <Broken />
      </BandBoundary>,
    );
    expect(screen.getByText(/The demo is resting/)).toBeInTheDocument();
  });

  it("hides the card button when the card rail is unavailable", async () => {
    let answer: (response: Response) => void = () => {};
    const health = () => new Promise<Response>((resolve) => (answer = resolve));
    render(<PaymentsBand snapshot={snapshot()} client={demo({ health })} />);
    expect(screen.queryByRole("button", { name: "Test card" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test network" })).toBeInTheDocument();

    await act(async () => answer(json({ cardAvailable: false, confirmations: 10 })));

    expect(screen.queryByRole("button", { name: "Test card" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Test network" })).toBeEnabled();
  });

  it("links the printed receipt to the Stripe receipt", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(receipt()).findByText("Coffee");

    act(() =>
      stream().send(
        demoPayment({ id: id(9), orderId: ORDER, receiptUrl: "https://pay.stripe.com/receipts/r1", version: 2 }),
      ),
    );

    expect(within(receipt()).getByRole("link", { name: /Stripe receipt/ })).toHaveAttribute(
      "href",
      "https://pay.stripe.com/receipts/r1",
    );
  });

  it("links the printed receipt to the block explorer once the transfer is sent", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");
    expect(within(receipt()).queryByRole("link", { name: /explorer/ })).not.toBeInTheDocument();

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          provider: "chain",
          stage: "sent",
          settledAt: null,
          transactionHash: "0xabc",
          explorerUrl: "https://sepolia.basescan.org/tx/0xabc",
        }),
      ),
    );

    expect(within(receipt()).getByRole("link", { name: /explorer/ })).toHaveAttribute(
      "href",
      "https://sepolia.basescan.org/tx/0xabc",
    );
  });

  it("gives each ticket in the live list a link to its payment", () => {
    const data = snapshot();
    data.payments = [
      demoPayment({ id: id(1), receiptUrl: "https://pay.stripe.com/receipts/r1" }),
      demoPayment({ id: id(2), provider: "chain", explorerUrl: "https://sepolia.basescan.org/tx/0xabc" }),
      demoPayment({ id: id(3), receiptUrl: "javascript:alert(1)" }),
    ];
    render(<PaymentsBand snapshot={data} client={demo()} />);

    const [card, network, unsafe] = within(screen.getByRole("list", { name: "Recent test purchases" })).getAllByRole(
      "listitem",
    );
    expect(within(card!).getByRole("link", { name: "Stripe receipt" })).toHaveAttribute(
      "href",
      "https://pay.stripe.com/receipts/r1",
    );
    expect(within(network!).getByRole("link", { name: "View on block explorer" })).toHaveAttribute(
      "href",
      "https://sepolia.basescan.org/tx/0xabc",
    );
    expect(within(unsafe!).queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the confirming row as pending until the transfer is in a block", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");
    const sent = { id: id(9), orderId: ORDER, provider: "chain" as const, settledAt: null, transactionHash: "0xabc" };

    act(() => stream().send(demoPayment({ ...sent, stage: "sent", version: 1 })));
    const confirming = () => within(receipt()).getByTestId("stage-confirming");
    expect(confirming()).toHaveTextContent(/Confirming.*…$/);
    expect(confirming()).toHaveAttribute("data-current", "true");

    act(() =>
      stream().send(demoPayment({ ...sent, stage: "received", receivedAt: "2026-10-24T10:00:01.000Z", version: 2 })),
    );
    expect(confirming()).toHaveTextContent(/0\/10$/);

    act(() => stream().send(demoPayment({ ...sent, stage: "confirming", confirmations: 6, version: 3 })));
    expect(confirming()).toHaveTextContent(/6\/10$/);
    expect(confirming()).toHaveAttribute("data-current", "true");
    expect(within(receipt()).getByTestId("stage-settled")).toHaveAttribute("data-current", "false");
  });

  it("counts confirmations against the demo's target", async () => {
    const user = userEvent.setup();
    const data = { ...snapshot(), confirmations: 50 };
    const health = async () => json({ cardAvailable: true, confirmations: 50 });
    render(<PaymentsBand snapshot={data} client={demo({ health, purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          provider: "chain",
          stage: "received",
          settledAt: null,
          confirmations: 0,
        }),
      ),
    );
    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          provider: "chain",
          stage: "received",
          settledAt: null,
          confirmations: 23,
          version: 2,
        }),
      ),
    );

    expect(within(receipt()).getByTestId("stage-confirming")).toHaveTextContent(/23\/50$/);
  });

  it("prints stages that arrive together one after another", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(receipt()).findByText("Coffee");

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          sentAt: "2026-10-24T10:00:00.100Z",
          processingAt: "2026-10-24T10:00:00.300Z",
          settledAt: "2026-10-24T10:00:00.400Z",
          notifiedAt: "2026-10-24T10:00:05.000Z",
        }),
      ),
    );

    const step = (stage: string) => within(receipt()).getByTestId(`stage-${stage}`).dataset.printStep;
    expect([step("sent"), step("processing"), step("settled"), step("notified")]).toEqual(["0", "1", "2", "0"]);
  });

  it("shows a live mark only while the stream is open", () => {
    render(<PaymentsBand snapshot={snapshot()} client={demo()} />);
    const header = () => screen.getByText("Recent purchases").parentElement!;
    expect(within(header()).queryByText("Live")).not.toBeInTheDocument();

    act(() => stream().open());
    expect(within(header()).getByText("Live")).toBeInTheDocument();

    act(() => stream().drop());
    expect(within(header()).queryByText("Live")).not.toBeInTheDocument();
    expect(within(header()).getByText("Live updates paused")).toBeInTheDocument();
  });

  it("invites a first purchase until one is sent", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    const card = await screen.findByRole("button", { name: "Test card" });
    expect(card).toHaveAttribute("data-inviting", "true");
    expect(button("Test network")).toHaveAttribute("data-inviting", "true");

    await user.click(card);
    await within(receipt()).findByText("Coffee");

    expect(button("Test card")).toHaveAttribute("data-inviting", "false");
    expect(button("Test network")).toHaveAttribute("data-inviting", "false");
  });

  it("marks your own purchase in the live list", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(receipt()).findByText("Coffee");

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "sent",
          settledAt: null,
          sentAt: "2026-10-24T11:00:00.000Z",
        }),
      ),
    );

    const list = screen.getByRole("list", { name: "Recent test purchases" });
    const [first, ...rest] = within(list).getAllByRole("listitem");
    expect(first).toHaveTextContent("Coffee");
    expect(within(first!).getByText("Yours")).toBeInTheDocument();
    for (const other of rest) expect(within(other).queryByText("Yours")).not.toBeInTheDocument();
  });

  it("keeps focus on the button while a purchase runs", async () => {
    const user = userEvent.setup();
    let answer: (response: Response) => void = () => {};
    const slow = () => new Promise<Response>((resolve) => (answer = resolve));
    const client = demo({ purchase: [slow, accepted()] });
    const post = vi.spyOn(client, "purchase");
    render(<PaymentsBand snapshot={snapshot()} client={client} />);
    act(() => stream().open());

    await user.click(button("Test network"));

    expect(button("Test network")).toHaveFocus();
    expect(button("Test network")).not.toBeDisabled();
    expect(locked("Test network")).toBe(true);
    await user.click(button("Test network"));
    expect(post).toHaveBeenCalledTimes(1);
    await act(async () => answer(json({ error: "paused" }, 503)));
    expect(button("Test network")).toHaveFocus();
  });

  it("reopens the buttons when an order expires", async () => {
    const user = fakeTime();
    render(
      <PaymentsBand
        snapshot={snapshot()}
        client={demo({
          purchase: [accepted(), accepted({ orderId: ORDER_2 })],
        })}
      />,
    );
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");
    expect(locked("Test network")).toBe(true);
    act(() => stream().send({ type: "order", id: ORDER, closed: true }, "order"));

    act(() => vi.advanceTimersByTime(20 * 60_000));
    await user.click(button("Test network"));
    await act(async () => {});
    expect(locked("Test network")).toBe(true);

    // The first order's expiry passes; the second order is still open.
    act(() => vi.advanceTimersByTime(10 * 60_000));
    expect(locked("Test network")).toBe(true);

    act(() => vi.advanceTimersByTime(20 * 60_000));
    expect(locked("Test network")).toBe(false);
  });

  it("catches up a purchase that settled while the stream was down", async () => {
    const user = userEvent.setup();
    const settled = demoPayment({
      id: id(9),
      orderId: ORDER,
      stage: "settled",
      sentAt: "2026-10-24T11:00:00.000Z",
      version: 3,
    });
    const other = demoPayment({
      id: id(10),
      provider: "chain",
      sentAt: "2026-10-24T11:00:01.000Z",
      order: { id: id(20), item: "Pocket thunderstorm", price: "700000" },
    });
    const payments = vi.fn(async () => json([other, settled]));
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()], payments })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(receipt()).findByText("Coffee");
    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "sent",
          settledAt: null,
          sentAt: settled.sentAt,
          version: 1,
        }),
      ),
    );

    expect(payments).toHaveBeenCalledTimes(1);
    act(() => stream().drop());
    await act(async () => stream().open());

    expect(payments).toHaveBeenCalledTimes(2);
    expect(within(receipt()).getByTestId("stage-settled")).toHaveAttribute("data-reached", "true");
    expect(locked("Test card")).toBe(false);
    const list = screen.getByRole("list", { name: "Recent test purchases" });
    expect(within(list).getByText("Pocket thunderstorm")).toBeInTheDocument();
    expect(within(list).getByText("Yours")).toBeInTheDocument();
  });

  it("shows the closed line without changing the band height", async () => {
    const user = fakeTime();
    render(
      <PaymentsBand
        snapshot={snapshot()}
        client={demo({
          purchase: [async () => json({ error: "paused" }, 503)],
        })}
      />,
    );
    act(() => stream().open());
    const slot = button("Test network").closest(".bg-ink")!;
    expect(notice()).toHaveClass("sr-only");
    expect(notice().parentElement).toBe(slot);

    await user.click(button("Test network"));

    expect(notice()).toHaveTextContent(DEMO_COPY.paused);
    // Laid over the top of the paper, out of the flow, so neither the slot nor the paper moves.
    expect(notice()).toHaveClass("absolute", "top-full", "inset-x-0");
    expect(notice()).not.toHaveClass("sr-only");
    expect(notice().parentElement).toBe(slot);

    act(() => vi.advanceTimersByTime(10_000));
    expect(locked("Test network")).toBe(false);
    expect(notice()).toHaveClass("sr-only");
    expect(notice()).toBeEmptyDOMElement();
  });

  it("waits out a busy answer and then reopens the buttons", async () => {
    const user = fakeTime();
    const busy = async () =>
      new Response(JSON.stringify({ error: "busy" }), {
        status: 429,
        headers: { "retry-after": "2" },
      });
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [busy] })} />);
    act(() => stream().open());

    await user.click(button("Test network"));

    expect(notice()).toHaveTextContent("Lots of test purchases right now. Try again in a moment.");
    expect(locked("Test network")).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    expect(locked("Test network")).toBe(false);
  });

  it("tells a visitor at the daily limit to come back tomorrow", async () => {
    const user = fakeTime();
    const limited = async () =>
      new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { "retry-after": "40000" },
      });
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [limited] })} />);
    act(() => stream().open());

    await user.click(button("Test network"));

    expect(notice()).toHaveTextContent("You have sent today's test purchases. Come back tomorrow.");
    act(() => vi.advanceTimersByTime(10 * 60_000));
    expect(notice()).toHaveTextContent("You have sent today's test purchases. Come back tomorrow.");
    expect(screen.queryByRole("button", { name: "Test network" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Test shop" })).toHaveTextContent(
      "You have sent today's test purchases. The list shows the latest ones.",
    );
  });

  it("says a purchase did not go through when its payment fails", async () => {
    const user = userEvent.setup();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          provider: "chain",
          orderId: ORDER,
          stage: "failed",
          settledAt: null,
          version: 2,
        }),
      ),
    );

    expect(within(receipt()).getByText(DEMO_COPY.not_completed)).toBeInTheDocument();
    expect(locked("Test network")).toBe(false);
  });

  it("shows the median settle per rail", () => {
    const at = (s: number) => new Date(Date.parse("2026-10-24T10:00:00.000Z") + s).toISOString();
    const data = snapshot();
    data.payments = [
      demoPayment({ id: id(1), sentAt: at(0), settledAt: at(400) }),
      demoPayment({ id: id(2), sentAt: at(0), settledAt: at(600) }),
      demoPayment({
        id: id(3),
        provider: "chain",
        sentAt: at(0),
        settledAt: at(9000),
      }),
    ];
    data.stats.duplicatesSkipped = 3;
    render(<PaymentsBand snapshot={data} client={demo()} />);

    expect(screen.getByText("Median settle").nextSibling).toHaveTextContent("under 1 s / 9 s");
    expect(screen.getByText("Card/network").nextSibling).toHaveTextContent("2 / 1");
    expect(screen.getByText("Duplicates").nextSibling).toHaveTextContent("3");
    expect(screen.getByText(CAPTION)).toBeInTheDocument();
  });

  it("says not yet for a rail with no settled payment among the recent ones", () => {
    const data = snapshot();
    data.payments = [
      demoPayment({ id: id(1), sentAt: "2026-10-24T10:00:00.000Z", settledAt: "2026-10-24T10:00:00.300Z" }),
      demoPayment({ id: id(2), provider: "chain", sentAt: "2026-10-24T10:00:00.000Z", settledAt: null }),
    ];
    render(<PaymentsBand snapshot={data} client={demo()} />);

    expect(screen.getByText("Median settle").nextSibling).toHaveTextContent("under 1 s / not yet");
  });

  it("never gives neighbouring stubs the same colour", () => {
    const data = snapshot();
    data.payments = [1, 2, 3, 4, 5, 6].map((n) =>
      demoPayment({ id: id(n), sentAt: `2026-10-24T10:00:0${9 - n}.000Z` }),
    );
    render(<PaymentsBand snapshot={data} client={demo()} />);
    act(() => stream().open());
    const colours = () =>
      within(screen.getByRole("list", { name: "Recent test purchases" }))
        .getAllByRole("listitem")
        .map(lookOf);
    const check = () => {
      const list = colours();
      list.forEach((colour, p) => {
        expect(colour).toBeDefined();
        if (p + 1 < list.length) expect(colour).not.toBe(list[p + 1]);
        if (p + 2 < list.length) expect(colour).not.toBe(list[p + 2]);
      });
    };
    check();
    for (let n = 7; n < 19; n++) {
      act(() =>
        stream().send(
          demoPayment({
            id: id(n),
            sentAt: `2026-10-24T10:${String(n).padStart(2, "0")}:00.000Z`,
          }),
        ),
      );
      check();
    }
  });

  it("keeps the receipt readable after the daily limit", async () => {
    const user = userEvent.setup();
    const limited = async () => json({ error: "daily_limit" }, 503);
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted(), limited] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");
    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          stage: "settled",
          version: 3,
        }),
      ),
    );

    await user.click(button("Test network"));

    expect(notice()).toHaveTextContent(DEMO_COPY.daily_limit);
    // A calm line in the slot bar, in the flow: it never covers the receipt.
    expect(notice()).not.toHaveClass("absolute");
    expect(notice().parentElement).toHaveClass("bg-ink");
    expect(within(receipt()).getByText("Coffee")).toBeVisible();
  });

  it("catches up the list when the stream first opens", async () => {
    const fresh = demoPayment({
      id: id(10),
      sentAt: "2026-10-24T11:00:00.000Z",
      order: { id: id(20), item: "Pocket thunderstorm", price: "700000" },
    });
    const payments = vi.fn(async () => json([fresh]));
    render(<PaymentsBand snapshot={snapshot()} client={demo({ payments })} />);
    expect(payments).not.toHaveBeenCalled();

    await act(async () => stream().open());

    expect(payments).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Pocket thunderstorm")).toBeInTheDocument();
    act(() => stream().drop());
    await act(async () => stream().open());
    expect(payments).toHaveBeenCalledTimes(2);
  });

  it("counts a stream payment as settled today only once and only within the UTC day", async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      now: new Date("2026-10-24T12:00:00.000Z"),
    });
    render(<PaymentsBand snapshot={snapshot()} client={demo()} />);
    act(() => stream().open());
    const settledToday = () => screen.getByText("Settled today").nextSibling;
    expect(settledToday()).toHaveTextContent("12");

    // Settled before this UTC day began: the day's stats never counted it.
    act(() =>
      stream().send(
        demoPayment({
          id: id(5),
          sentAt: "2026-10-23T23:59:50.000Z",
          settledAt: "2026-10-23T23:59:59.000Z",
        }),
      ),
    );
    expect(settledToday()).toHaveTextContent("12");

    // Not settled yet, then settled and notified: one count.
    act(() => stream().send(demoPayment({ id: id(6), stage: "sent", settledAt: null, version: 1 })));
    expect(settledToday()).toHaveTextContent("12");
    act(() => stream().send(demoPayment({ id: id(6), stage: "settled", version: 2 })));
    expect(settledToday()).toHaveTextContent("13");
    act(() => stream().send(demoPayment({ id: id(6), stage: "notified", version: 3 })));
    expect(settledToday()).toHaveTextContent("13");
  });

  it("refreshes the figures when the stream opens", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T12:00:00.000Z") });
    // Settled today and already in the fresh figures, so it must not count again.
    const listed = demoPayment({
      id: id(10),
      sentAt: "2026-10-24T11:59:00.000Z",
      settledAt: "2026-10-24T11:59:05.000Z",
    });
    const payments = vi.fn(async () => json([listed]));
    const fresh = vi.fn(async () => stats(30, 4));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: "2026-10-24T08:00:00.000Z" }}
        client={demo({ payments, stats: fresh })}
      />,
    );
    expect(figure("Settled today")).toHaveTextContent("12");
    expect(figure("Duplicates")).toHaveTextContent("0");

    await act(async () => stream().open());

    expect(fresh).toHaveBeenCalledTimes(1);
    expect(payments).toHaveBeenCalledTimes(1);
    expect(figure("Settled today")).toHaveTextContent("30");
    expect(figure("Duplicates")).toHaveTextContent("4");
    act(() => stream().send(listed));
    expect(figure("Settled today")).toHaveTextContent("30");
    act(() => stream().send(demoPayment({ id: id(11), settledAt: "2026-10-24T12:00:01.000Z" })));
    expect(figure("Settled today")).toHaveTextContent("31");

    // One more read each per reopen, which starts the count again from the fresh figures.
    fresh.mockImplementation(async () => stats(40, 5));
    act(() => stream().drop());
    await act(async () => stream().open());
    expect(fresh).toHaveBeenCalledTimes(2);
    expect(payments).toHaveBeenCalledTimes(2);
    expect(figure("Settled today")).toHaveTextContent("40");
    expect(figure("Duplicates")).toHaveTextContent("5");
  });

  it("tells the visitor a timed-out purchase may still show up", async () => {
    const user = fakeTime();
    const stalls: Route = (init) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      });
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [stalls] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await act(async () => vi.advanceTimersByTimeAsync(PURCHASE_DEADLINE_MS));

    expect(notice()).toHaveTextContent(DEMO_COPY.purchase_pending);
    expect(locked("Test network")).toBe(false);
    expect(screen.queryByText(DEMO_COPY.unreachable)).not.toBeInTheDocument();
  });

  it("reads the figures on load when the snapshot is from yesterday and the stream never opens", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-25T09:00:00.000Z") });
    const fresh = vi.fn(async () => stats(3, 1));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: "2026-10-24T23:59:00.000Z" }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => vi.advanceTimersByTimeAsync(10));

    expect(fresh).toHaveBeenCalledTimes(1);
    expect(figure("Settled today")).toHaveTextContent("3");
  });

  it("hides yesterday's figures until fresh ones arrive", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-25T09:00:00.000Z") });
    let answer: (response: Response) => void = () => {};
    const fresh = vi.fn(() => new Promise<Response>((resolve) => (answer = resolve)));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: "2026-10-24T23:59:00.000Z" }}
        client={demo({ stats: fresh })}
      />,
    );
    expect(figure("Settled today")).toHaveTextContent(/^…$/);
    expect(figure("Duplicates")).toHaveTextContent(/^…$/);
    expect(figure("Card/network")).toHaveTextContent("1 / 1");
    expect(screen.getByText(CAPTION)).toBeInTheDocument();

    await act(async () => stream().open());
    expect(figure("Settled today")).toHaveTextContent(/^…$/);
    await act(async () => answer(stats(3, 1)));

    expect(figure("Settled today")).toHaveTextContent("3");
    expect(figure("Duplicates")).toHaveTextContent("1");
  });

  it("refreshes the figures after UTC midnight", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T23:59:00.000Z") });
    const fresh = vi.fn(async () => stats(30, 4));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    expect(fresh).toHaveBeenCalledTimes(1);
    expect(figure("Settled today")).toHaveTextContent("30");

    let answer: (response: Response) => void = () => {};
    fresh.mockImplementation(() => new Promise<Response>((resolve) => (answer = resolve)));
    await act(async () => vi.advanceTimersByTimeAsync(70_000));

    expect(fresh).toHaveBeenCalledTimes(2);
    expect(figure("Settled today")).toHaveTextContent(/^…$/);
    expect(figure("Duplicates")).toHaveTextContent(/^…$/);
    await act(async () => answer(stats(2, 0)));
    expect(figure("Settled today")).toHaveTextContent("2");
    expect(figure("Duplicates")).toHaveTextContent("0");

    // The next read is set for the following midnight.
    fresh.mockImplementation(async () => stats(5, 1));
    await act(async () => vi.advanceTimersByTimeAsync(24 * 3_600_000));
    expect(fresh).toHaveBeenCalledTimes(3);
    expect(figure("Settled today")).toHaveTextContent("5");
  });

  it("discards a read sent before the day turned", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T23:59:00.000Z") });
    const answers: ((response: Response) => void)[] = [];
    const fresh = vi.fn(() => new Promise<Response>((resolve) => answers.push(resolve)));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    // The catch-up read is sent before midnight and is still out when the day turns.
    await act(async () => stream().open());
    await act(async () => vi.advanceTimersByTimeAsync(70_000));
    expect(fresh).toHaveBeenCalledTimes(1);

    await act(async () => answers[0]?.(stats(30, 4)));
    expect(figure("Settled today")).toHaveTextContent(/^…$/);
    expect(fresh).toHaveBeenCalledTimes(2);
    await act(async () => answers[1]?.(stats(2, 0)));

    expect(figure("Settled today")).toHaveTextContent("2");
    expect(figure("Duplicates")).toHaveTextContent("0");
  });

  it("runs one stats read at a time and follows up once", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T12:00:00.000Z") });
    const answers: ((response: Response) => void)[] = [];
    const fresh = vi.fn(() => new Promise<Response>((resolve) => answers.push(resolve)));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    for (let reopen = 0; reopen < 2; reopen += 1) {
      act(() => stream().drop());
      await act(async () => stream().open());
    }
    expect(fresh).toHaveBeenCalledTimes(1);

    await act(async () => answers[0]?.(stats(30, 4)));
    expect(figure("Settled today")).toHaveTextContent("30");
    expect(fresh).toHaveBeenCalledTimes(2);
    await act(async () => answers[1]?.(stats(40, 5)));
    expect(figure("Settled today")).toHaveTextContent("40");

    await act(async () => vi.advanceTimersByTimeAsync(600_000));
    expect(fresh).toHaveBeenCalledTimes(2);
  });

  it("retries the figures until a read succeeds, whatever triggered it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T23:59:00.000Z") });
    const answers: ((response: Response) => void)[] = [];
    const fresh = vi.fn(() => new Promise<Response>((resolve) => answers.push(resolve)));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    await act(async () => answers[0]?.(stats(30, 4)));
    await act(async () => vi.advanceTimersByTimeAsync(65_000));
    expect(fresh).toHaveBeenCalledTimes(2);

    // The stream reopens while the midnight read is out; both reads fail.
    act(() => stream().drop());
    await act(async () => stream().open());
    await act(async () => answers[1]?.(json({ error: "internal" }, 500)));
    await act(async () => answers.at(-1)?.(json({ error: "internal" }, 500)));
    expect(figure("Settled today")).toHaveTextContent(/^…$/);

    fresh.mockImplementation(async () => stats(2, 0));
    await act(async () => vi.advanceTimersByTimeAsync(31_000));
    expect(figure("Settled today")).toHaveTextContent("2");
    expect(figure("Duplicates")).toHaveTextContent("0");
  });

  it("keeps a payment that settled while the stats read was in flight", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T12:00:00.000Z") });
    const fresh = vi.fn(async () => stats(30, 4));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: "2026-10-24T08:00:00.000Z" }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    expect(figure("Settled today")).toHaveTextContent("30");
    // Settled before the next read is sent, so that read's figures include it.
    act(() => stream().send(demoPayment({ id: id(20), settledAt: new Date().toISOString() })));
    expect(figure("Settled today")).toHaveTextContent("31");

    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    let answer: (response: Response) => void = () => {};
    fresh.mockImplementation(() => new Promise<Response>((resolve) => (answer = resolve)));
    act(() => stream().drop());
    await act(async () => stream().open());
    await act(async () => vi.advanceTimersByTimeAsync(1_000));
    act(() => stream().send(demoPayment({ id: id(21), settledAt: new Date().toISOString() })));
    expect(figure("Settled today")).toHaveTextContent("32");

    await act(async () => answer(stats(40, 5)));
    expect(figure("Settled today")).toHaveTextContent("41");
  });

  it("retries the midnight figures after a failure", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T23:59:00.000Z") });
    const fresh = vi.fn(async () => stats(30, 4));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    expect(fresh).toHaveBeenCalledTimes(1);

    fresh.mockImplementation(async () => json({ error: "internal" }, 500));
    await act(async () => vi.advanceTimersByTimeAsync(65_000));
    expect(fresh).toHaveBeenCalledTimes(2);
    expect(figure("Settled today")).toHaveTextContent(/^…$/);

    // The first retry comes after 30 s and fails; the second after 60 s.
    await act(async () => vi.advanceTimersByTimeAsync(30_000));
    expect(fresh).toHaveBeenCalledTimes(3);
    fresh.mockImplementation(async () => stats(2, 0));
    await act(async () => vi.advanceTimersByTimeAsync(59_000));
    expect(fresh).toHaveBeenCalledTimes(3);
    await act(async () => vi.advanceTimersByTimeAsync(2_000));
    expect(fresh).toHaveBeenCalledTimes(4);
    expect(figure("Settled today")).toHaveTextContent("2");

    // No further retries once it succeeds.
    await act(async () => vi.advanceTimersByTimeAsync(600_000));
    expect(fresh).toHaveBeenCalledTimes(4);
  });

  it("treats a stats read that never answers as a failure and retries", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T12:00:00.000Z") });
    const fresh = vi.fn(
      (init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    expect(fresh).toHaveBeenCalledTimes(1);

    // The read times out at 10 s, then the first retry comes 30 s later.
    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    expect(fresh).toHaveBeenCalledTimes(1);
    await act(async () => vi.advanceTimersByTimeAsync(30_000));
    expect(fresh).toHaveBeenCalledTimes(2);

    fresh.mockImplementation(async () => stats(31, 4));
    await act(async () => vi.advanceTimersByTimeAsync(10_000 + 60_000));
    expect(fresh).toHaveBeenCalledTimes(3);
    expect(figure("Settled today")).toHaveTextContent("31");
  });

  it("does not loop when the clock is set back after midnight", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date("2026-10-24T23:59:00.000Z") });
    const answers: ((response: Response) => void)[] = [];
    const fresh = vi.fn(() => new Promise<Response>((resolve) => answers.push(resolve)));
    render(
      <PaymentsBand
        snapshot={{ ...snapshot(), fetchedAt: new Date().toISOString() }}
        client={demo({ stats: fresh })}
      />,
    );
    await act(async () => stream().open());
    await act(async () => vi.advanceTimersByTimeAsync(70_000));
    expect(fresh).toHaveBeenCalledTimes(1);

    // The day has turned while the read was out, then the system clock goes back before the turn.
    vi.setSystemTime(new Date("2026-10-24T23:00:00.000Z"));
    await act(async () => answers[0]?.(stats(30, 4)));
    expect(fresh).toHaveBeenCalledTimes(2);
    await act(async () => answers[1]?.(stats(2, 0)));
    expect(fresh).toHaveBeenCalledTimes(2);
    expect(figure("Settled today")).toHaveTextContent("2");
  });

  it("shows an expired purchase as not going through", async () => {
    const user = fakeTime();
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [accepted()] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Waiting to send.");

    act(() => vi.advanceTimersByTime(ORDER_LIFETIME_MS));

    expect(within(receipt()).getByText(DEMO_COPY.not_completed)).toBeInTheDocument();
    expect(within(receipt()).queryByText("Waiting to send.")).not.toBeInTheDocument();
  });

  it("follows the order from a pending reply", async () => {
    const user = userEvent.setup();
    const pending = async () =>
      json(
        {
          error: "purchase_pending",
          orderId: ORDER,
          item: "Coffee",
          price: "500000",
          expiresAt: new Date(Date.now() + ORDER_LIFETIME_MS).toISOString(),
        },
        503,
      );
    render(<PaymentsBand snapshot={snapshot()} client={demo({ purchase: [pending] })} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test network" }));
    await within(receipt()).findByText("Coffee");
    expect(locked("Test network")).toBe(true);

    act(() =>
      stream().send(
        demoPayment({
          id: id(9),
          orderId: ORDER,
          provider: "chain",
          stage: "sent",
          settledAt: null,
          sentAt: "2026-10-24T11:00:00.000Z",
        }),
      ),
    );

    expect(within(receipt()).getByText("On its way.")).toBeInTheDocument();
    const [first] = within(screen.getByRole("list", { name: "Recent test purchases" })).getAllByRole("listitem");
    expect(first).toHaveTextContent("Coffee");
    expect(within(first!).getByText("Yours")).toBeInTheDocument();
  });
});
