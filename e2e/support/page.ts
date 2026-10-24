import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

export type Theme = "light" | "dark";

/** Sets the site's stored theme before any page script runs. */
export async function useTheme(page: Page, theme: Theme) {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem("theme", value);
    } catch {}
  }, theme);
}

/** The home page's payment demo band. */
export const band = (page: Page) =>
  page.locator("section", { has: page.getByRole("heading", { name: "Try a test payment" }) });

/** The band's list of recent purchases. */
export const bandList = (page: Page) => band(page).getByRole("list", { name: "Recent test purchases" });

/**
 * Saves a screenshot to `E2E_SCREENSHOTS` when it is set, else beside the test's other output.
 * The file name carries the project, so the desktop and phone runs never overwrite each other.
 */
export async function shot(page: Page, info: TestInfo, name: string, target = page.locator("body")) {
  const dir = process.env.E2E_SCREENSHOTS ?? info.outputPath();
  mkdirSync(dir, { recursive: true });
  await target.screenshot({ path: join(dir, `${info.project.name}-${name}.png`), animations: "disabled" });
}

/** A failed request is the browser's own report, not something the page says or throws. */
const networkFailure = /^Failed to load resource: /;

/** Collects what would mean the page broke: uncaught errors and console errors other than failed requests. */
export function watchForErrors(page: Page) {
  const uncaught: string[] = [];
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on("pageerror", (error) => uncaught.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    (networkFailure.test(text) ? networkErrors : consoleErrors).push(text);
  });
  return { uncaught, consoleErrors, networkErrors };
}

const errorWording = /error|failed to fetch|something went wrong/i;

/** Nothing on the page reads as an error, and nothing broke behind it. */
export async function expectCalm(page: Page, errors: ReturnType<typeof watchForErrors>) {
  const text = await page.locator("body").innerText();
  expect(text, "page text").not.toMatch(errorWording);
  expect(errors.uncaught, "uncaught errors").toEqual([]);
  expect(errors.consoleErrors, "console errors").toEqual([]);
}
