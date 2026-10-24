import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildsDir } from "./support/servers";

// A build that cannot read the demo starts resting; it must still regenerate on the snapshot's
// 45 s schedule, and not on the devlog's day, so the band comes back soon after the demo does.
test("the refused build revalidates the demo pages every 45 s", () => {
  test.skip(test.info().project.name !== "desktop", "The build is the same for every project.");
  const manifest = JSON.parse(readFileSync(join(buildsDir, "refused/.next/prerender-manifest.json"), "utf8")) as {
    routes: Record<string, { initialRevalidateSeconds?: number | false }>;
  };
  for (const route of ["/", "/payments-demo"]) expect(manifest.routes[route]?.initialRevalidateSeconds, route).toBe(45);
});
