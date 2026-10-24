import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

/** The custom properties declared directly in one rule block, such as `:root { ... }`. */
function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`${selector} not found in globals.css`);
  const block = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
}

const light = tokens(":root");
const themes = { light, dark: { ...light, ...tokens(':root[data-theme="dark"]') } };

/** One theme's colour, failing the test when globals.css does not declare it. */
const color = (theme: Record<string, string>, name: string) => {
  const value = theme[name];
  if (!value) throw new Error(`--${name} is not declared`);
  return value;
};

const luminance = (hex: string) => {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
};

/** WCAG 2 contrast ratio between two colours. */
const contrast = (a: string, b: string) => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

describe.each(Object.entries(themes))("%s theme", (_, theme) => {
  const t = (name: string) => color(theme, name);
  it("gives form fields a border of at least 3:1 against the paper and the canvas", () => {
    expect(contrast(t("field"), t("paper"))).toBeGreaterThanOrEqual(3);
    expect(contrast(t("field"), t("canvas"))).toBeGreaterThanOrEqual(3);
  });

  it("makes the strong accent readable as small text on the paper and the canvas", () => {
    expect(contrast(t("accent-strong"), t("paper"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t("accent-strong"), t("canvas"))).toBeGreaterThanOrEqual(4.5);
  });

  it("makes button text readable on the strong accent", () => {
    expect(contrast(t("on-accent"), t("accent-strong"))).toBeGreaterThanOrEqual(4.5);
  });

  it("makes accent text readable on the printer's slot bar", () => {
    expect(contrast(t("accent-on-slot"), t("ink"))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the focus ring at least 3:1 against the paper and the canvas", () => {
    expect(contrast(t("accent"), t("paper"))).toBeGreaterThanOrEqual(3);
    expect(contrast(t("accent"), t("canvas"))).toBeGreaterThanOrEqual(3);
  });
});
