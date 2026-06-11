import { defineConfig } from "vitest/config";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const alias = { "@": path.resolve(__dirname, ".") };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        // Existing Node unit tests. `npm run test:unit` targets this project.
        resolve: { alias },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
          globals: false,
          setupFiles: ["./tests/helpers/vitest-setup.ts"],
        },
      },
      {
        // Storybook stories run as browser tests via Playwright.
        plugins: [
          storybookTest({ configDir: path.join(__dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          // Preview annotations (decorators/parameters) are applied
          // automatically by @storybook/addon-vitest since Storybook 10.3.
        },
      },
    ],
  },
});
