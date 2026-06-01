import Image from "next/image";
import Link from "next/link";
import type { Page } from "@/lib/types";
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
    <article className="wp-page">
      {featuredImage && (
        <div id="featured-image" className="relative mb-10 lg:px-6">
          {featuredImage.placeholder ? (
            <PlaceholderImage
              alt={featuredImage.alt || title}
              width={featuredImage.width ?? 1600}
              height={featuredImage.height ?? 900}
              notes={featuredImage.notes}
              className="max-lg:h-[50vh] w-full"
            />
          ) : (
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt || title}
              width={featuredImage.width ?? 1600}
              height={featuredImage.height ?? 900}
              priority
              sizes="100vw"
              className="max-lg:h-[50vh] object-cover w-full"
            />
          )}
        </div>
      )}

      <div className="section main-section">
        <div className="mx-auto lg:w-4/5">
          <div className="pb-8">
            <Link
              href="/blog"
              className="font-mono text-sm uppercase tracking-wider text-ff_black hover-linear-gradient-underline"
            >
              ← Blog
            </Link>
          </div>

          {tags.length > 0 && (
            <ul className="pb-4 leading-4">
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

          <h1 className="pb-6">{title}</h1>

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

          {contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <p>Sorry, no post content was found.</p>
          )}
        </div>
      </div>
    </article>
  );
}
