import type { Page, Route } from "@playwright/test";
import mondaySuccess from "../fixtures/monday-success.json";
import mondayError from "../fixtures/monday-error.json";

type MondayMode = "success" | "error" | "network-error";

export interface MondayInterception {
  callCount: () => number;
  lastRequestBody: () => unknown | undefined;
}

/**
 * Intercept Monday.com GraphQL calls so contact-form tests stay
 * deterministic and don't hit the real Leads board.
 */
export function interceptMonday(
  page: Page,
  mode: MondayMode = "success",
): MondayInterception {
  let calls = 0;
  let lastBody: unknown;

  page.route("https://api.monday.com/**", async (route: Route) => {
    calls += 1;
    try {
      lastBody = route.request().postDataJSON();
    } catch {
      lastBody = route.request().postData();
    }
    if (mode === "network-error") {
      await route.abort("failed");
      return;
    }
    if (mode === "error") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mondayError),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mondaySuccess),
    });
  });

  return {
    callCount: () => calls,
    lastRequestBody: () => lastBody,
  };
}
