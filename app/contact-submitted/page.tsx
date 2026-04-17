import type { Metadata } from "next";
import { FeaturedProjects } from "@/components/page_blocks/FeaturedProjects";

export const metadata: Metadata = {
  title: "Thanks",
  robots: { index: false, follow: false },
};

export default async function ContactSubmittedPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const ok = success === "true";

  return (
    <>
      <div className="article">
        <div className="section text-base text-center">
          {ok ? (
            <p className="max-w-[60ch] mx-auto">
              Thanks for getting in touch! You&apos;ll be hearing from us soon.
            </p>
          ) : (
            <div className="max-w-[60ch] mx-auto">
              <p className="mb-8">
                Sorry, it looks like something went wrong while submitting your
                form.
              </p>
              <p>
                Please email us at{" "}
                <a href="mailto:newbiz@fastforward.sh">newbiz@fastforward.sh</a>{" "}
                instead.
              </p>
            </div>
          )}
        </div>
      </div>
      <FeaturedProjects />
    </>
  );
}
