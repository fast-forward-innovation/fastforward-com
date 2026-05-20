import { vi } from "vitest";

// Mock next/cache so tests that touch lib/pcc.ts (wrapped in unstable_cache)
// or the /api/revalidate route handler don't blow up with
// "Invariant: incrementalCache missing". Outside a Next runtime these are
// just passthroughs / no-ops, which is the right shape for unit tests.
vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(
    fn: T,
  ): T => fn,
  revalidateTag: () => undefined,
  revalidatePath: () => undefined,
}));
