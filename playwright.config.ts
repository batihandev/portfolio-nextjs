import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { siteUrl } from "./e2e/support/servers";

const localChromium =
  process.env.PLAYWRIGHT_CHROMIUM ?? join(homedir(), ".cache/ms-playwright/chromium-1248/chrome-linux64/chrome");
const launchOptions = existsSync(localChromium) ? { executablePath: localChromium } : {};

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // Every page holds a live stream, and the demo API allows only a few per address.
  workers: 2,
  // Builds and serves the site once per demo URL, and runs the demo proxy (see e2e/global-setup.ts).
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: siteUrl("direct"),
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 }, launchOptions },
    },
    {
      name: "phone",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 },
        isMobile: true,
        hasTouch: true,
        launchOptions,
      },
    },
  ],
});
