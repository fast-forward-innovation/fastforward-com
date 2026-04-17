import type { Metadata } from "next";
import { getAllProjects } from "@/lib/content";
import { ProjectCard } from "@/components/page_blocks/ProjectCard";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Explore Fast Forward's previous projects",
};

export default function OurWorkPage() {
  const projects = getAllProjects();
  return (
    <div className="dark-background">
      <div className="min-h-[60vh] md:min-h-[72vh] bg-[url('/Touchscreen-1-denoise-gigapixel.jpg')] bg-cover bg-center">
        <div className="section relative md:top-[15vh]">
          <div className="mx-auto py-4">
            <div className="md:w-4/5">
              <h1 className="h1 pb-6">Our Work</h1>
              <p className="text-white leading-9 text-base sm:text-2xl md:text-3xl">
                We love to tackle complex problems and provide simple, elegant
                solutions to help our clients exceed their goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 xl:gap-[70px] mx-auto justify-center">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
