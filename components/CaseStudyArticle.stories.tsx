import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CaseStudyArticle } from "./CaseStudyArticle";
import { sampleProject } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Articles/CaseStudyArticle",
  component: CaseStudyArticle,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Renders a project / case-study page body: gradient hero, title, services, featured image, then the `pageSections` (MainSection / ImageBlock / ClientQuote only — via the shared `renderPageSection` allow-list). Used by `Post`, `CaseStudyPage`, and `BlogCaseStudy`. Service names come from the mocked `@/lib/content`.",
      },
    },
  },
  args: {
    title: sampleProject.title,
    featuredImage: sampleProject.featuredImage,
    additionalPostFields: sampleProject.additionalPostFields,
    services: sampleProject.services,
    pageSections: sampleProject.pageSections,
  },
} satisfies Meta<typeof CaseStudyArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoLabelOrServices: Story = {
  args: { additionalPostFields: undefined, services: [] },
};
