import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DemoClient } from "@/lib/payments-demo/client";
import { demoPayment } from "@/lib/payments-demo/test-data";
import { FakeStream } from "@/lib/payments-demo/test-stream";
import type { DemoDay, DemoPayment, DemoSnapshot } from "@/lib/payments-demo/types";
import { DemoDetails } from "./DemoDetails";
import { RESTING_LINE } from "@/components/home/PaymentsBand/Papers";
import { SettleChart } from "./SettleChart";

const API = "http://demo.test";
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
/** Payment n was sent n minutes before 12:00 UTC, so a higher n is older. */
const sentAt = (n: number) => new Date(Date.UTC(2026, 9, 24, 12, 0) - n * 60_000).toISOString();
const payment = (n: number): DemoPayment =>
  demoPayment({
    id: id(n),
    sentAt: sentAt(n),
    // Received after sent: the cursor must take the sent time, as the feed sorts by it.
    receivedAt: new Date(Date.parse(sentAt(n)) + 1000).toISOString(),
    settledAt: new Date(Date.parse(sentAt(n)) + 3000).toISOString(),
    order: { id: id(1000 + n), item: `Item ${n}`, price: "500000" },
  });
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => payment(from + i));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/** The cursor the demo API reads: URL-safe base64 of `{at, id}`, built here independently of the page. */
const cursorFor = (p: DemoPayment) =>
  Buffer.from(JSON.stringify({ at: p.sentAt ?? p.receivedAt, id: p.id })).toString("base64url");

const days = (values: [string, number | null][]): DemoDay[] =>
  values.map(([day, ms]) => ({
    day,
    settled: ms === null ? 0 : 3,
    scheduled: 0,
    visitor: ms === null ? 0 : 3,
    averageTimeToSettleMs: ms,
  }));

const snapshot = (): DemoSnapshot => ({
  payments: range(1, 20),
  stats: {
    settledCount: 42,
    averageTimeToSettleMs: 3000,
    duplicatesSkipped: 2,
    failuresRecovered: 0,
  },
  daily: days([
    ["2026-10-23", 4000],
    ["2026-10-24", 3000],
  ]),
  confirmations: 10,
  fetchedAt: new Date().toISOString(),
});

function demo(pages: Record<string, () => Promise<Response>> = {}) {
  FakeStream.opened = [];
  const fetch = vi.fn((input: string) => {
    const path = input.slice(API.length);
    const route = pages[path];
    if (route) return route();
    if (path === "/payments?limit=20") return Promise.resolve(json(range(1, 20)));
    return Promise.resolve(json({ error: "not_found" }, 404));
  });
  return { client: new DemoClient(API, fetch, FakeStream.create), fetch };
}

const stream = () => {
  const current = FakeStream.opened.at(-1);
  if (!current) throw new Error("no stream opened");
  return current;
};
const receipts = () => within(screen.getByRole("list", { name: "Recent receipts" })).getAllByRole("listitem");

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("DemoDetails", () => {
  it("runs a test purchase in place and shows each step with its time", async () => {
    const user = userEvent.setup();
    const order = "6f1c4a52-3a43-4c38-9a71-0c2b8f1d2e3a";
    const { client } = demo({
      "/health": async () => json({ cardAvailable: true, confirmations: 10 }),
      "/test-purchases": async () =>
        json(
          {
            orderId: order,
            item: "Coffee",
            price: "500000",
            expiresAt: new Date(Date.now() + 1_800_000).toISOString(),
          },
          202,
        ),
    });
    render(<DemoDetails snapshot={snapshot()} client={client} />);
    act(() => stream().open());

    await user.click(await screen.findByRole("button", { name: "Test network" }));
    const panel = screen.getByRole("region", { name: "Your test payment" });
    expect(await within(panel).findByText("Coffee")).toBeInTheDocument();

    act(() =>
      stream().send(
        demoPayment({
          id: id(99),
          orderId: order,
          provider: "chain",
          stage: "received",
          blockNumber: "49554051",
          sentAt: "2026-10-24T12:00:00.000Z",
          receivedAt: "2026-10-24T12:00:02.300Z",
          settledAt: null,
          transactionHash: "0xabc",
          explorerUrl: "https://sepolia.basescan.org/tx/0xabc",
        }),
      ),
    );

    expect(within(panel).getByText("block 49,554,051")).toBeInTheDocument();
    expect(within(panel).getByText("+2.3 s")).toBeInTheDocument();
    expect(within(panel).getByRole("link", { name: /block explorer/ })).toHaveAttribute(
      "href",
      "https://sepolia.basescan.org/tx/0xabc",
    );
  });

  it("marks your own purchase in the recent receipts", async () => {
    const user = userEvent.setup();
    const order = "6f1c4a52-3a43-4c38-9a71-0c2b8f1d2e3a";
    const { client } = demo({
      "/health": async () => json({ cardAvailable: true, confirmations: 10 }),
      "/test-purchases": async () =>
        json(
          {
            orderId: order,
            item: "Coffee",
            price: "500000",
            expiresAt: new Date(Date.now() + 1_800_000).toISOString(),
          },
          202,
        ),
    });
    render(<DemoDetails snapshot={snapshot()} client={client} />);
    act(() => stream().open());
    await user.click(await screen.findByRole("button", { name: "Test card" }));
    await within(screen.getByRole("region", { name: "Your test payment" })).findByText("Coffee");

    act(() => stream().send(demoPayment({ id: id(99), orderId: order, sentAt: "2026-10-24T12:00:30.000Z" })));

    const [mine, ...rest] = receipts();
    expect(mine).toHaveTextContent("Coffee");
    expect(within(mine!).getByText("Yours")).toBeInTheDocument();
    for (const other of rest) expect(within(other).queryByText("Yours")).not.toBeInTheDocument();
  });

  it("shows a resting purchase panel without a snapshot", () => {
    render(<DemoDetails snapshot={null} />);
    expect(screen.getAllByText(RESTING_LINE).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Test network" })).not.toBeInTheDocument();
  });

  it("pages older receipts with Show more", async () => {
    const user = userEvent.setup();
    const firstBefore = `/payments?limit=20&before=${cursorFor(payment(20))}`;
    const secondBefore = `/payments?limit=20&before=${cursorFor(payment(40))}`;
    const { client, fetch } = demo({
      [firstBefore]: async () => json(range(21, 40)),
      [secondBefore]: async () => json(range(41, 45)),
    });
    render(<DemoDetails snapshot={snapshot()} client={client} />);
    expect(receipts()).toHaveLength(20);

    await user.click(screen.getByRole("button", { name: "Show more" }));

    expect(fetch.mock.calls.map(([url]) => url)).toContain(`${API}${firstBefore}`);
    expect(await screen.findByText("Item 40")).toBeInTheDocument();
    expect(receipts()).toHaveLength(40);

    await user.click(screen.getByRole("button", { name: "Show more" }));

    expect(fetch.mock.calls.map(([url]) => url)).toContain(`${API}${secondBefore}`);
    expect(await screen.findByText("Item 45")).toBeInTheDocument();
    expect(receipts()).toHaveLength(45);
    expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    expect(screen.getByText("That is every receipt the demo still keeps.")).toBeInTheDocument();
  });

  it("shows a calm line when older receipts fail to load", async () => {
    const user = userEvent.setup();
    const { client } = demo({
      [`/payments?limit=20&before=${cursorFor(payment(20))}`]: async () => json({ error: "internal" }, 500),
    });
    render(<DemoDetails snapshot={snapshot()} client={client} />);

    await user.click(screen.getByRole("button", { name: "Show more" }));

    expect(await screen.findByText("Older receipts did not load. Try again in a moment.")).toBeInTheDocument();
    expect(receipts()).toHaveLength(20);
    expect(screen.getByRole("button", { name: "Show more" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders from the snapshot with the stream unavailable", () => {
    const { client } = demo();
    render(<DemoDetails snapshot={snapshot()} client={client} />);

    act(() => stream().fail());

    expect(screen.getByText("Live updates paused")).toBeInTheDocument();
    expect(receipts()).toHaveLength(20);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Settled today").parentElement).toHaveTextContent("42");
    expect(screen.getAllByTestId("settle-dot")).toHaveLength(2);
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it("joins chart dots only across consecutive days", () => {
    render(
      <SettleChart
        days={days([
          ["2026-10-10", 1000],
          ["2026-10-11", 2000],
          ["2026-10-12", null],
          ["2026-10-13", 3000],
          ["2026-10-14", 4000],
          // 2026-10-15 is missing from the list, so 10-14 and 10-16 are not consecutive.
          ["2026-10-16", 5000],
        ])}
      />,
    );

    expect(screen.getAllByTestId("settle-dot")).toHaveLength(5);
    const lines = screen.getAllByTestId("settle-line").map((line) => line.getAttribute("data-days"));
    expect(lines).toEqual(["2026-10-10 2026-10-11", "2026-10-13 2026-10-14"]);
  });
});
