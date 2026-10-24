import { expect, test } from "@playwright/test";

test("an unknown address shows the site's not-found page with a way home", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await page.getByRole("link", { name: "Home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});
