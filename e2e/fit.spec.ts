import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { shot, type Theme } from "./support/page";

const paths = ["/", "/payments-demo"];
const themes: Theme[] = ["light", "dark"];
const MIN_BUTTON_PX = 44;
const MIN_TEXT_PX = 11;

/**
 * Buttons known to be shorter than 44 px, which still need fixing. A listed button that grows to
 * 44 px fails the check, so its entry gets removed once it is fixed.
 */
const shortButtonsAllowed: RegExp[] = [];

type Measure = {
  theme: string | undefined;
  scrollWidth: number;
  buttons: { name: string; height: number }[];
  smallText: { text: string; size: number }[];
};

/** What a visitor sees: rendered, not hidden or see-through, and bigger than a screen-reader-only box. */
const measure = (page: Page) =>
  page.evaluate((): Measure => {
    const shown = (element: Element) => {
      if (!element.checkVisibility({ visibilityProperty: true, opacityProperty: true })) return false;
      const box = element.getBoundingClientRect();
      return box.width > 1 && box.height > 1;
    };
    const ownText = (element: Element) =>
      [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? "")
        .join("")
        .trim();
    return {
      theme: document.documentElement.dataset.theme,
      scrollWidth: document.documentElement.scrollWidth,
      buttons: [...document.querySelectorAll('button, [role="button"]')].filter(shown).map((button) => ({
        name: (button.getAttribute("aria-label") ?? button.textContent ?? "").trim(),
        height: button.getBoundingClientRect().height,
      })),
      smallText: [...document.querySelectorAll("body *")]
        .filter((element) => ownText(element) && shown(element))
        .map((element) => ({
          text: ownText(element).slice(0, 40),
          size: parseFloat(getComputedStyle(element).fontSize),
        }))
        .filter((text) => text.size < 11),
    };
  });

async function checkFit(page: Page, info: TestInfo, width: number) {
  await page.setViewportSize({ width, height: 800 });
  for (const path of paths)
    for (const theme of themes)
      await test.step(`${path} in ${theme}`, async () => {
        await page.goto(path);
        await page.evaluate((value) => localStorage.setItem("theme", value), theme);
        await page.reload();
        // Let the live parts open their stream and the hero finish printing.
        await page.waitForTimeout(1500);
        const found = await measure(page);
        expect(found.theme).toBe(theme);
        expect(found.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(width);

        const allowed = (name: string) => shortButtonsAllowed.some((pattern) => pattern.test(name));
        const short = found.buttons.filter((button) => button.height < MIN_BUTTON_PX);
        expect(
          short.filter((button) => !allowed(button.name)),
          "buttons under 44 px",
        ).toEqual([]);
        const fixed = found.buttons.filter((button) => allowed(button.name) && button.height >= MIN_BUTTON_PX);
        expect(fixed, "listed as short but now 44 px; remove from shortButtonsAllowed").toEqual([]);

        expect(found.smallText, `text under ${MIN_TEXT_PX} px`).toEqual([]);
        await shot(page, info, `fit-${width}-${path === "/" ? "home" : "details"}-${theme}`, page.locator("body"));
      });
}

test("fits at 360 px", async ({ page }, info) => {
  test.setTimeout(90_000);
  await checkFit(page, info, 360);
});

test("fits at 1280 px", async ({ page }, info) => {
  test.setTimeout(90_000);
  await checkFit(page, info, 1280);
});
