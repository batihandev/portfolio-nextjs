import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import type { Metadata } from "next";
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";

const APP_DIR = join(process.cwd(), "src/app");

/** Every page file under src/app, as its route path. Route groups such as "(site)" add no segment. */
function pageRoutes(dir = APP_DIR): { route: string; file: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pageRoutes(path);
    if (entry.name !== "page.tsx") return [];
    const segments = relative(APP_DIR, dir)
      .split(sep)
      .filter((segment) => segment && !/^\(.*\)$/.test(segment));
    return [{ route: `/${segments.join("/")}`, file: path }];
  });
}

const indexable = (metadata: Metadata | undefined) => {
  const rules = metadata?.robots;
  return !(typeof rules === "object" && rules !== null && rules.index === false);
};

describe("sitemap", () => {
  it("lists every indexable route", async () => {
    const listed = sitemap().map((entry) => new URL(entry.url).pathname);
    const routes = pageRoutes();
    expect(routes.length).toBeGreaterThan(3);
    for (const { route, file } of routes) {
      const page = (await import(/* @vite-ignore */ file)) as { metadata?: Metadata };
      if (indexable(page.metadata)) expect(listed, `${route} is indexable`).toContain(route);
      else expect(listed, `${route} is noindex`).not.toContain(route);
    }
  });
});
