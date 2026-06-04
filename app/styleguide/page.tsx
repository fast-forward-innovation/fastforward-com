import type { Metadata } from "next";
import { notFound } from "next/navigation";
import yaml from "js-yaml";
import { isLiveEnvironment } from "@/lib/env";
import { blockGallery, type BlockDoc } from "@/lib/styleguide/sampleSections";
import {
  renderPageSection,
  type RenderSectionContext,
} from "@/components/postBlocks/renderPageSection";
import "./styleguide.css";

/**
 * Author-facing block gallery. Renders every `pageSections` block through the
 * real production renderer, beside the exact frontmatter an author writes.
 * It is the live companion to `CONTENT.md`.
 *
 * Kept off the public site: noindex/nofollow, excluded from the sitemap, and
 * 404s on the Pantheon Live environment.
 */
export const metadata: Metadata = {
  title: "Block Gallery (Styleguide)",
  robots: { index: false, follow: false },
};

/** Render a single block in isolation with a fresh numbering context. */
function LivePreview({ doc }: { doc: BlockDoc }) {
  return (
    <>
      {doc.variants.map((variant, i) => {
        const ctx: RenderSectionContext = { mainCount: 0 };
        return (
          <div key={variant.label} className="sg-variant">
            <div className="sg-variant__label">{variant.label}</div>
            <div className="sg-preview">
              {renderPageSection(variant.section, i, ctx)}
            </div>
            <details className="sg-source">
              <summary>Frontmatter</summary>
              <pre className="sg-code">
                <code>
                  {yaml
                    .dump(
                      { pageSections: [variant.section] },
                      { lineWidth: 80, noRefs: true },
                    )
                    .trimEnd()}
                </code>
              </pre>
            </details>
          </div>
        );
      })}
    </>
  );
}

function FieldTable({ doc }: { doc: BlockDoc }) {
  return (
    <table className="sg-fields">
      <thead>
        <tr>
          <th>Field</th>
          <th>Type</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {doc.fields.map((f) => (
          <tr key={f.name}>
            <td>
              <code>{f.name}</code>
              {f.required ? <span className="sg-req"> *</span> : null}
            </td>
            <td>
              <code>{f.type}</code>
            </td>
            <td>{f.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function StyleguidePage() {
  // Never expose the internal documentation surface on production.
  if (isLiveEnvironment()) notFound();

  return (
    <div className="sg">
      <header className="sg-header">
        <h1 className="h1">Block Gallery</h1>
        <p className="sg-lede">
          Every block you can place in a page&apos;s{" "}
          <code>pageSections</code> list, rendered exactly as it appears on the
          site, beside the frontmatter you write. The narrative guidance —
          editorial arc, voice, and which template to choose — lives in{" "}
          <code>CONTENT.md</code>. <span className="sg-req">*</span> marks
          required fields.
        </p>
        <nav className="sg-toc" aria-label="Blocks">
          {blockGallery.map((doc) => (
            <a key={doc.type} href={`#${doc.type}`} className="sg-toc__link">
              {doc.label}
            </a>
          ))}
        </nav>
      </header>

      {blockGallery.map((doc) => (
        <section key={doc.type} id={doc.type} className="sg-block">
          <div className="sg-block__head">
            <h2 className="sg-block__title">{doc.label}</h2>
            <span className="sg-block__where">Allowed in: {doc.allowedIn}</span>
          </div>
          <p className="sg-block__desc">{doc.description}</p>
          <FieldTable doc={doc} />
          <LivePreview doc={doc} />
        </section>
      ))}

      <section className="sg-block" id="page-envelope">
        <div className="sg-block__head">
          <h2 className="sg-block__title">Page frontmatter</h2>
        </div>
        <p className="sg-block__desc">
          The fields that wrap the blocks. Set these at the top of a page or
          project file alongside <code>pageSections</code>. See{" "}
          <code>lib/types.ts</code> for the full schema.
        </p>
        <table className="sg-fields">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>layout</code>
              </td>
              <td>
                <code>default | landing | case-study | lab-project | blog | …</code>
              </td>
              <td>Chooses the page renderer. Projects always use the case-study arc.</td>
            </tr>
            <tr>
              <td>
                <code>featuredImage</code>
              </td>
              <td>
                <code>FrontmatterImage</code>
              </td>
              <td>Hero image below the title. Supports <code>placeholder</code> + <code>notes</code>.</td>
            </tr>
            <tr>
              <td>
                <code>additionalPostFields.stack</code>
              </td>
              <td>
                <code>string[]</code>
              </td>
              <td>Lab projects: filled chips under the title.</td>
            </tr>
            <tr>
              <td>
                <code>additionalPostFields.tags</code>
              </td>
              <td>
                <code>string[]</code>
              </td>
              <td>Lab projects: outlined chips under the title.</td>
            </tr>
            <tr>
              <td>
                <code>header</code>
              </td>
              <td>
                <code>{"{ background, intro? }"}</code>
              </td>
              <td>Default-layout pages: dark full-bleed hero (see <code>PageHero</code>).</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
