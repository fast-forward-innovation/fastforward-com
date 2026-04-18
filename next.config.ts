import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 requires explicit allowlist for next/image `quality` values
  // (default was [75]). HomepageBanner + other heroes use 90.
  images: {
    qualities: [75, 90],
  },

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
