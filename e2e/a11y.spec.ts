import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { shot, useTheme, type Theme } from "./support/page";

const paths = ["/", "/experience", "/contact", "/payments-demo"];
const themes: Theme[] = ["light", "dark"];
const failingImpacts = new Set(["serious", "critical"]);

for (const theme of themes)
  test(`no serious accessibility violations in ${theme}`, async ({ page }, info) => {
    test.setTimeout(90_000);
    await useTheme(page, theme);
    for (const path of paths)
      await test.step(path, async () => {
        await page.goto(path);
        // Let the live parts open their stream and the hero finish printing.
        await page.waitForTimeout(2500);
        expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);
        // The reCAPTCHA frame is Google's own markup, which the site cannot change.
        const results = await new AxeBuilder({ page }).exclude('iframe[src*="recaptcha"]').analyze();
        const found = results.violations
          .filter((violation) => failingImpacts.has(violation.impact ?? ""))
          .map((violation) => ({
            rule: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.map((node) => `${node.target.join(" ")}: ${node.failureSummary ?? ""}`),
          }));
        if (found.length) await shot(page, info, `a11y-${path === "/" ? "home" : path.slice(1)}-${theme}`);
        expect(found, `${path} in ${theme}`).toEqual([]);
      });
  });
