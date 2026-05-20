import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Next 16 requires explicit allowlist for next/image `quality` values
  // (default was [75]). HomepageBanner + other heroes use 90.
  images: {
    qualities: [75, 90],
  },

  // Pantheon's Next.js platform doesn't honor pantheon.yml / Quicksilver,
  // so we use their official cache handler instead. It detects new build
  // IDs and invalidates the Full Route Cache automatically, plus purges
  // the edge CDN on revalidateTag/revalidatePath calls — fixes the
  // "stale CSS on multidev until I click Clear caches" issue.
  // See README "Caching on Pantheon" and ./cacheHandler.mjs.
  cacheHandler: path.resolve(process.cwd(), "./cacheHandler.mjs"),
  cacheMaxMemorySize: 0,

  async redirects() {
    return [
      // Legacy Gatsby pagination URLs (`/page/1`, `/page/2`, …) never
      // had meaningful content — the old template just re-rendered the
      // homepage. Redirect any indexed variants to the real home.
      {
        source: "/page/:num",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
