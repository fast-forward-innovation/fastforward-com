import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// E2e tests run against a single production build with PANTHEON_ENVIRONMENT=live.
// Vitest covers the env-conditional branches (live vs non-live) by stubbing the
// env var at the lib/ layer — splitting it this way avoids two full next-build
// runs and keeps CI under the 5-minute budget set in the test plan.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      PANTHEON_ENVIRONMENT: "live",
      NEXT_PUBLIC_SITE_URL: "https://fastforward.sh",
      // Fake values — Playwright tests intercept the actual network calls.
      MONDAY_API_TOKEN: "test-monday-token",
      PCC_WEBHOOK_SECRET: "test-pcc-webhook-secret",
      // PCC_SITE_ID / PCC_TOKEN intentionally unset so fetchLabProjectPages()
      // returns [] gracefully without hitting the real PCC API.
    },
  },
});
