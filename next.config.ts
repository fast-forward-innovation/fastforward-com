import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Explicit; Next's default is already true but stating it prevents
  // accidental removal on upgrades and documents intent for Ahrefs/SEMrush
  // audits that flag the "uncompressed pages" finding.
  compress: true,

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

  async headers() {
    return [
      {
        // HSTS on every response. The 2-year max-age + includeSubDomains
        // + preload value matches hstspreload.org's submission criteria
        // so the value is future-proof — we're not submitting today, but
        // the audit's "missing HSTS on fastforward.sh + www" finding
        // clears as soon as this lands.
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Next's /_next/static/* output is content-hashed and therefore
        // immutable; tell Pantheon's edge it can cache forever. Helps the
        // Ahrefs/SEMrush "compression/caching" rollup since compressed
        // copies stay warm in the CDN.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
