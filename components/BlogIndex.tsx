import Image from "next/image";
import Link from "next/link";
import type { Page } from "@/lib/types";
import { getBlogPosts } from "@/lib/content";
import { PlaceholderImage } from "./postBlocks/PlaceholderImage";
import { PageHero } from "./PageHero";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogCard({ post }: { post: Page }) {
  const { slug, title, date, author, featuredImage } = post;
  const tags = post.additionalPostFields?.tags ?? [];
  const formattedDate = date ? formatDate(date) : "";

  return (
    <Link
      href={`/${slug}`}
      className="group block w-full text-left opacity-90 hover:opacity-100 transition-all duration-300"
    >
      {featuredImage && (
        <div className="relative w-full aspect-[16/9] overflow-hidden mb-5">
          {featuredImage.placeholder ? (
            <PlaceholderImage
              alt={featuredImage.alt || title}
              notes={featuredImage.notes}
              fill
            />
          ) : (
            <Image
              src={featuredImage.src}
              alt={featuredImage.alt || title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      )}
      <div className="flex items-center gap-3 pb-2">
        {post.pinned && (
          <span className="font-mono text-xs uppercase tracking-wider text-ff_black border border-ff_slateGray px-2 py-0.5">
            Pinned
          </span>
        )}
        {post.layout === "blog-case-study" && (
          <span className="font-mono text-xs uppercase tracking-wider text-ff_teal border border-ff_teal px-2 py-0.5">
            Case Study
          </span>
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
      <h3 className="text-2xl md:text-[1.65rem] leading-8 pb-3 group-hover:underline">
        {title}
      </h3>
      {tags.length > 0 && (
        <ul className="pb-2 leading-4">
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
      {author?.name && (
        <p className="text-sm text-ff_gray">By {author.name}</p>
      )}
    </Link>
  );
}

export async function BlogIndex({ page }: { page: Page }) {
  const posts = await getBlogPosts();
  const header = page.header;

  return (
    <>
      {header?.background && <PageHero header={header} title={page.title} />}
      <article className="section main-section wp-page">
        <div className="mx-auto">
          {header?.background ? (
            page.contentHtml ? (
              <div
                className="lg:w-4/5 pb-10"
                dangerouslySetInnerHTML={{ __html: page.contentHtml }}
              />
            ) : null
          ) : (
            <div className="lg:w-4/5 pb-10">
              <h1>{page.title}</h1>
              {page.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
              ) : null}
            </div>
          )}

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p>No posts yet — check back soon.</p>
          )}
        </div>
      </article>
    </>
  );
}
