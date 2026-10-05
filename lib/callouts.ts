/**
 * Blog callouts — designed graphics (React components in
 * `components/callouts/`) placed inside a blog post's `contentHtml`.
 *
 * `contentHtml` is a raw HTML string rendered with dangerouslySetInnerHTML,
 * so it can't hold React components directly. Authors drop an empty marker
 * at the top level of the HTML instead:
 *
 *   <div data-callout="five-fears"></div>
 *
 * and `BlogPost` splits the HTML around each marker and renders the matching
 * component in its place. Markers must sit between top-level blocks, never
 * inside a `<p>`, list, or figure — the split would leave that element's
 * tags unbalanced.
 */

export const CALLOUT_NAMES = [
  "five-fears",
  "five-advantages",
  "haiti-latency",
] as const;

export type CalloutName = (typeof CALLOUT_NAMES)[number];

export type ContentSegment =
  | { kind: "html"; html: string }
  | { kind: "callout"; name: CalloutName };

const MARKER = /<div\s+data-callout="([a-z0-9-]+)"\s*>\s*<\/div>/g;

export function isCalloutName(name: string): name is CalloutName {
  return (CALLOUT_NAMES as readonly string[]).includes(name);
}

/**
 * Split `contentHtml` into HTML runs and callout slots, in document order.
 * Whitespace-only HTML runs are dropped. An unknown callout name throws, so a
 * typo fails `npm run build` instead of silently rendering nothing.
 */
export function splitCallouts(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let last = 0;

  const pushHtml = (chunk: string) => {
    if (chunk.trim()) segments.push({ kind: "html", html: chunk });
  };

  for (const match of html.matchAll(MARKER)) {
    const name = match[1];
    if (!isCalloutName(name)) {
      throw new Error(
        `Unknown blog callout "${name}". Known callouts: ${CALLOUT_NAMES.join(", ")}.`,
      );
    }
    pushHtml(html.slice(last, match.index));
    segments.push({ kind: "callout", name });
    last = match.index + match[0].length;
  }
  pushHtml(html.slice(last));

  return segments;
}
