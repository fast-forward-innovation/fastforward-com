import type { MainSection as MainSectionData } from "@/lib/types";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";
import { CardGrid } from "./CardGrid";

export function MainSection({
  section,
  mainCount,
}: {
  section: MainSectionData;
  mainCount: number;
}) {
  return (
    <div
      className={`section md:text-base main-section ${
        section.background === "gray" ? "bg-[#f5f5f5]" : ""
      }`}
    >
      <div className="mx-auto">
        <h2 className="md:inline-block md:w-1/4 align-top text-md pb-6 md:pb-0">
        {mainCount ? (
          <span className="block font-mono text-xs md:text-md tracking-wider pb-2 md:pt-2 md:pb-8">
            ({mainCount < 10 ? `0${mainCount}` : mainCount})
          </span>
        ) : null}
          <span className="text-sm md:text-md font-bold">{section.title}</span>
        </h2>
        <div className="md:inline-block md:w-3/4">
          {section.tagline ? (
            <h3 className="section-tagline">{section.tagline}</h3>
          ) : null}
          <div
            dangerouslySetInnerHTML={{ __html: section.richText ?? "" }}
          />
          {section.blocks?.map((block, i) => {
            switch (block.type) {
              case "FeaturedWork":
                return <FeaturedWorkBlock key={i} block={block} embedded />;
              case "CardGrid":
                return <CardGrid key={i} block={block} embedded />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
