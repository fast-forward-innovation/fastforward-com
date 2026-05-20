/**
 * Pantheon's Next.js platform exposes the current environment name via
 * the `PANTHEON_ENVIRONMENT` env var: `live`, `test`, `dev`, or the name
 * of a multidev (e.g. `feat-foo`). The var is unset locally.
 *
 * Anything that's not literally "live" is treated as a preview surface
 * where in-progress content (drafts, editorial toasts) is visible.
 */
export function isLiveEnvironment(): boolean {
  return process.env.PANTHEON_ENVIRONMENT === "live";
}
