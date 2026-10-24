import { expect, test, type Page } from "@playwright/test";
import { LIVE_PAUSED } from "../src/lib/payments-demo/copy";
import { expectCalm, shot, watchForErrors } from "./support/page";
import { proxyControl, siteUrl } from "./support/servers";

const receipts = (page: Page) => page.getByRole("list", { name: "Recent receipts" }).getByRole("listitem");

test("details page renders from the snapshot with the API stopped", async ({ page }, info) => {
  // The proxy lease may first wait for another worker's proxy test.
  test.setTimeout(150_000);
  await proxyControl.exclusive(async () => {
    await proxyControl.set({ mode: "refuse" });
    const errors = watchForErrors(page);
    await page.goto(`${siteUrl("proxied")}/payments-demo`);
    await expect(receipts(page).first()).toBeVisible();
    expect(await receipts(page).count()).toBeGreaterThan(0);
    await expect(page.getByText("Settled today")).toBeVisible();
    await expect(page.getByTestId("settle-dot").first()).toBeAttached();
    await expect(page.getByText(LIVE_PAUSED)).toBeVisible();
    await expect(page.getByRole("button", { name: "Show more" })).toBeVisible();
    await shot(page, info, "details-stopped", page.locator("body"));
    await expectCalm(page, errors);
  });
});

test("Show more loads older receipts on the details page", async ({ page }, info) => {
  const errors = watchForErrors(page);
  await page.goto("/payments-demo");
  await expect(receipts(page).nth(19)).toBeVisible();
  const before = await receipts(page).count();

  const older = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/payments" && url.searchParams.has("before");
  });
  await page.getByRole("button", { name: "Show more" }).click();
  const response = await older;
  expect(response.status()).toBe(200);
  const page2 = (await response.json()) as unknown[];
  expect(page2).toHaveLength(20);
  // The stream may add a new receipt at the top meanwhile, so the list holds at least the two pages.
  await expect.poll(() => receipts(page).count()).toBeGreaterThanOrEqual(before + 20);
  await receipts(page).last().scrollIntoViewIfNeeded();
  await shot(page, info, "details-more", page.locator("body"));
  await expectCalm(page, errors);
});
