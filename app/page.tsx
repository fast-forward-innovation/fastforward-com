import { HomepageBanner } from "@/components/HomepageBanner";
import { TextBlock } from "@/components/page_blocks/TextBlock";
import { ServiceBlock } from "@/components/page_blocks/ServiceBlock";
import { FeaturedProjects } from "@/components/page_blocks/FeaturedProjects";

export default function Home() {
  return (
    <>
      <HomepageBanner />
      <TextBlock fontSize="text-xl md:text-3xl" />
      <ServiceBlock />
      <section>
        <FeaturedProjects />
      </section>
    </>
  );
}
