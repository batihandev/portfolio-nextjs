import { expect, test, type Page } from "@playwright/test";
import { LIVE_PAUSED } from "../src/lib/payments-demo/copy";
import { SNAPSHOT_REVALIDATE_SECONDS } from "../src/lib/payments-demo/snapshot";
import { band, bandList, expectCalm, shot, watchForErrors } from "./support/page";
import { proxyControl, sites, siteUrl } from "./support/servers";

const receipt = (page: Page) => band(page).getByRole("region", { name: "Your test receipt" });
const pausedNote = (page: Page) => band(page).getByText(LIVE_PAUSED);
const proxiedHome = `${siteUrl("proxied")}/`;
const proxiedApi = `${sites.proxied.demoApi}/**`;

/** Requests the page until the server has no regeneration left to run, so the next load is the cached copy. */
async function settleCache(page: Page, url: string) {
  for (let i = 0; i < 10; i++) {
    const response = await page.request.get(url);
    if (response.headers()["x-nextjs-cache"] !== "STALE") return;
    await page.waitForTimeout(1500);
  }
  throw new Error(`${url} stayed stale`);
}

test("a test card purchase from the home page settles", async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors = watchForErrors(page);
  await page.goto("/");
  await band(page).scrollIntoViewIfNeeded();
  const card = band(page).getByRole("button", { name: "Test card" });
  await expect(card, "the card rail reports itself available").toBeVisible({ timeout: 15_000 });

  const accepted = page.waitForResponse(
    (response) => response.url().endsWith("/test-purchases") && response.request().method() === "POST",
  );
  await card.click();
  const response = await accepted;
  expect(response.status()).toBe(202);
  const { orderId } = (await response.json()) as { orderId: string };
  info.annotations.push({ type: "order id", description: orderId });
  console.log(`[${info.project.name}] test card order id: ${orderId}`);
  await shot(page, info, "card-sent", band(page));

  await expect(receipt(page).getByTestId("stage-settled")).toHaveAttribute("data-reached", "true", {
    timeout: 60_000,
  });
  await shot(page, info, "card-settled", band(page));
  const notified = receipt(page).getByTestId("stage-notified");
  await expect(notified).toHaveAttribute("data-reached", "true", { timeout: 60_000 });
  await expect(notified).toContainText("Shop notified");
  await expect(receipt(page)).toContainText("Paid with test money.");
  await shot(page, info, "card-notified", band(page));
  await expectCalm(page, errors);
});

test("the band stays calm with the API stopped", async ({ page }, info) => {
  // The proxy lease may first wait for another worker's proxy test.
  test.setTimeout(180_000);

  await test.step("a build that never reached the API rests", async () => {
    const errors = watchForErrors(page);
    await page.goto(`${siteUrl("refused")}/`);
    await band(page).scrollIntoViewIfNeeded();
    await expect(band(page).getByText("Resting", { exact: true })).toBeVisible();
    await expect(band(page).getByText(/The demo is resting right now/)).toBeVisible();
    await expect(band(page).getByText("Recent test purchases show here while the demo runs.")).toBeVisible();
    await shot(page, info, "stopped-resting-build", band(page));
    await expectCalm(page, errors);
  });

  await proxyControl.exclusive(async () => {
    const snapshot = await test.step("the cache fills while the API answers", async () => {
      await settleCache(page, proxiedHome);
      // Keep the browser off the API here, so the list shows only the cached snapshot.
      await page.route(proxiedApi, (route) => route.abort());
      await page.goto(proxiedHome);
      await expect(bandList(page).getByRole("listitem").first()).toBeVisible();
      const text = await bandList(page).innerText();
      await page.unroute(proxiedApi);
      return text;
    });

    await proxyControl.set({ mode: "refuse" });
    // Past the snapshot's revalidate time, so the next load asks the stopped API again.
    await page.waitForTimeout((SNAPSHOT_REVALIDATE_SECONDS + 5) * 1000);

    for (const load of ["stale", "after the failed regeneration"]) {
      await test.step(`the band keeps the last snapshot (${load})`, async () => {
        const errors = watchForErrors(page);
        const response = await page.goto(proxiedHome);
        if (load === "stale") expect(response?.headers()["x-nextjs-cache"]).toBe("STALE");
        await band(page).scrollIntoViewIfNeeded();
        await expect.poll(() => bandList(page).innerText()).toBe(snapshot);
        await expect(pausedNote(page)).toBeVisible();
        await shot(page, info, `stopped-${load === "stale" ? "stale" : "kept"}`, band(page));
        await expectCalm(page, errors);
      });
    }
  });
});

test("the band stays calm with a slow API", async ({ page }, info) => {
  // The proxy lease may first wait for another worker's proxy test.
  test.setTimeout(150_000);
  await proxyControl.exclusive(async () => {
    await settleCache(page, proxiedHome);
    await proxyControl.set({ delayMs: 10_000 });
    const errors = watchForErrors(page);

    const started = Date.now();
    await page.goto(proxiedHome, { waitUntil: "commit" });
    const firstHtmlMs = Date.now() - started;
    expect(firstHtmlMs, "first HTML while every API answer takes 10 s").toBeLessThan(2000);

    await band(page).scrollIntoViewIfNeeded();
    await expect(bandList(page).getByRole("listitem").first()).toBeVisible({ timeout: 3000 });
    await shot(page, info, "slow-waiting", band(page));

    // The stream opens once its delayed answer arrives; the band never says anything is wrong.
    await page.waitForTimeout(12_000);
    await expect(bandList(page).getByRole("listitem").first()).toBeVisible();
    await expect(pausedNote(page)).toHaveCount(0);
    await shot(page, info, "slow-answered", band(page));
    await expectCalm(page, errors);
  });
});

test("a cut stream shows the paused note and recovers", async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors = watchForErrors(page);
  let catchUps = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/payments" && url.search === "?limit=20") catchUps++;
  });

  await page.route("**/events", (route) => route.abort());
  await page.goto("/");
  await band(page).scrollIntoViewIfNeeded();
  await expect(pausedNote(page)).toBeVisible();
  await shot(page, info, "stream-paused", band(page));
  expect(catchUps, "no catch-up read while the stream is down").toBe(0);

  await page.unroute("**/events");
  await expect(pausedNote(page)).toHaveCount(0, { timeout: 45_000 });
  await expect.poll(() => catchUps).toBe(1);
  // One read per reopen, not a loop.
  await page.waitForTimeout(2000);
  expect(catchUps).toBe(1);
  await shot(page, info, "stream-recovered", band(page));
  await expectCalm(page, errors);
});
