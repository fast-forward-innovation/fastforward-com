import type { CodeBlock as CodeBlockData } from "@/lib/types";

export function CodeBlock({ block }: { block: CodeBlockData }) {
  const label = block.filename ?? block.title;
  return (
    <div className="section main-section code-section">
      <div className="mx-auto">
        <div className="md:inline-block md:w-1/4 align-top" aria-hidden />
        <div className="md:inline-block md:w-3/4 align-top">
          <figure className="code-card">
            <figcaption className="code-card__bar">
              {label ? (
                <span className="code-card__filename">{label}</span>
              ) : (
                <span className="code-card__filename code-card__filename--muted">
                  snippet
                </span>
              )}
              {block.language ? (
                <span className="code-card__lang">{block.language}</span>
              ) : null}
            </figcaption>
            <pre className="code-card__pre">
              <code
                className={
                  block.language ? `language-${block.language}` : undefined
                }
              >
                {block.code}
              </code>
            </pre>
          </figure>
          {block.caption ? (
            <p className="code-card__caption">{block.caption}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
