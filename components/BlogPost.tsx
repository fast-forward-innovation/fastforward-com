import Image from "next/image";
import Link from "next/link";
import type { Page } from "@/lib/types";
import { splitCallouts } from "@/lib/callouts";
import { CALLOUTS } from "./callouts";
import { PlaceholderImage } from "./postBlocks/PlaceholderImage";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPost({ page }: { page: Page }) {
  const { title, date, author, featuredImage, contentHtml } = page;
  const tags = page.additionalPostFields?.tags ?? [];
  const formattedDate = date ? formatDate(date) : "";

  return (
    <article className="wp-page blog-post">
      <div className="section main-section pt-12 md:pt-[4.5rem]">
        <div className="blog-measure mx-auto">
          <div className="pb-4">
            <Link
              href="/blog"
              className="font-mono text-sm uppercase tracking-wider text-ff_black hover-linear-gradient-underline"
            >
              ← Blog
            </Link>
          </div>

          {tags.length > 0 && (
            <ul className="pb-4 mb-0! leading-4">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="font-mono text-sm uppercase tracking-wider inline list-none inline-services-style"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <h1 className="pt-0 pb-4">{title}</h1>

          <div className="flex items-center gap-3 pb-10">
            {author?.avatar &&
              (author.avatar.placeholder ? (
                <PlaceholderImage
                  alt={author.avatar.alt || author.name}
                  className="w-10 h-10 rounded-full shrink-0"
                  fill
                />
              ) : (
                <Image
                  src={author.avatar.src}
                  alt={author.avatar.alt || author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ))}
            <div className="leading-tight">
              {author?.name && (
                <div className="text-base">
                  <span className="font-medium">{author.name}</span>
                  {author.role ? (
                    <span className="text-ff_gray">, {author.role}</span>
                  ) : null}
                </div>
              )}
              {formattedDate && (
                <time
                  dateTime={date}
                  className="font-mono text-sm uppercase tracking-wider text-ff_gray"
                >
                  {formattedDate}
                </time>
              )}
            </div>
          </div>

          {featuredImage && (
            <div id="featured-image" className="relative mb-10">
              {featuredImage.placeholder ? (
                <PlaceholderImage
                  alt={featuredImage.alt || title}
                  width={featuredImage.width ?? 1500}
                  height={featuredImage.height ?? 1000}
                  notes={featuredImage.notes}
                  className="aspect-[3/2] w-full"
                />
              ) : (
                <Image
                  src={featuredImage.src}
                  alt={featuredImage.alt || title}
                  width={featuredImage.width ?? 1500}
                  height={featuredImage.height ?? 1000}
                  priority
                  sizes="(min-width: 768px) 680px, 100vw"
                  className="aspect-[3/2] object-cover w-full"
                />
              )}
            </div>
          )}

          {contentHtml ? (
            // Each HTML run between callout markers is its own `.ff-article`,
            // so the article's direct-child (`.ff-article > …`) rules still hold.
            splitCallouts(contentHtml).map((segment, i) => {
              if (segment.kind === "html") {
                return (
                  <div
                    key={i}
                    className="ff-article"
                    dangerouslySetInnerHTML={{ __html: segment.html }}
                  />
                );
              }
              const Callout = CALLOUTS[segment.name];
              return <Callout key={i} />;
            })
          ) : (
            <p>Sorry, no post content was found.</p>
          )}
        </div>
      </div>
    </article>
  );
}
