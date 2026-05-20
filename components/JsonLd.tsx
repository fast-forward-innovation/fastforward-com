/**
 * Renders a `<script type="application/ld+json">` tag with the given
 * schema.org object. SEO crawlers (Ahrefs/SEMrush, Google) parse these
 * for entity recognition — emitting Organization/WebSite/CreativeWork
 * schemas raises the "semantic markup" score that some auditors weight
 * alongside the text-to-HTML ratio.
 *
 * The data object is serialized to JSON at render time; values are
 * escaped as part of normal JSON encoding. Don't pass user-controlled
 * strings here without sanitizing first.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
