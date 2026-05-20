import { afterEach, describe, expect, it, vi } from "vitest";
import { isLiveEnvironment } from "@/lib/env";

describe("isLiveEnvironment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns true when PANTHEON_ENVIRONMENT is exactly 'live'", () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", "live");
    expect(isLiveEnvironment()).toBe(true);
  });

  it.each(["dev", "test", "multidev-feature-foo", "LIVE", "Live", ""])(
    "returns false for PANTHEON_ENVIRONMENT=%j",
    (value) => {
      vi.stubEnv("PANTHEON_ENVIRONMENT", value);
      expect(isLiveEnvironment()).toBe(false);
    },
  );

  it("returns false when PANTHEON_ENVIRONMENT is undefined", () => {
    vi.stubEnv("PANTHEON_ENVIRONMENT", undefined as unknown as string);
    expect(isLiveEnvironment()).toBe(false);
  });
});
