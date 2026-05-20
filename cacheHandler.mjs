// Pantheon's Next.js cache handler — replaces Next's default in-memory ISR
// cache with a GCS-backed shared cache that all containers see, AND triggers
// edge-cache purges on Pantheon's CDN whenever a tag/path is revalidated.
//
// Why this exists: Pantheon's edge cache holds onto the previous deploy's
// HTML, which still references old /_next/static/<hash>.css filenames. On
// new builds the route cache is automatically invalidated by this handler,
// so the next request rebuilds with fresh asset hashes — no more "click
// Clear caches in the dashboard before CSS shows up" ritual on multidev.
//
// `type: 'auto'` picks the right backend based on env: GCS when CACHE_BUCKET
// is set (every Pantheon environment), file-based otherwise (local dev).
//
// See README.md "Caching on Pantheon" for the broader story.
import { createCacheHandler } from "@pantheon-systems/nextjs-cache-handler";

const CacheHandler = createCacheHandler({ type: "auto" });

export default CacheHandler;
