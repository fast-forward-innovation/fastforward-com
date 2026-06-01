import type { Page } from "@/lib/types";

/**
 * Dark hero header used by `default`-layout pages and the blog index when a
 * `header` block is set in frontmatter. Renders a full-bleed background image
 * with the title (and optional intro) over a dark overlay, matching the
 * `/our-work` header.
 */
export function PageHero({ header, title }: { header: NonNullable<Page["header"]>; title: string }) {
  return (
    <div className="dark-background">
      <div
        className="relative min-h-[60vh] md:min-h-[72vh] bg-cover bg-center"
        style={{ backgroundImage: `url('${header.background}')` }}
      >
        {/* Darken the image so the title/intro stay legible over busy art. */}
        <div className="absolute inset-0 bg-black/30 md:bg-gradient-to-r md:from-black/60 md:via-black/25 md:to-transparent" />
        <div className="section relative md:top-[15vh]">
          <div className="mx-auto py-4">
            <div className="md:w-4/5">
              <h1 className="h1 pb-6">{title}</h1>
              {header.intro ? (
                <p className="text-white leading-9 text-base sm:text-2xl md:text-3xl">
                  {header.intro}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
