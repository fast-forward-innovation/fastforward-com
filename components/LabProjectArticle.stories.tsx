import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LabProjectArticle } from "./LabProjectArticle";
import { sampleLabProject } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Articles/LabProjectArticle",
  component: LabProjectArticle,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Renders a lab-project page body: eyebrow label, title, tagline, stack/tags chips, repo/live links, then **all** `pageSections` block types (including CodeBlock, VideoBlock, TeamProfile). Used by `LabProjectPage`.",
      },
    },
  },
  args: {
    title: sampleLabProject.title,
    tagline: "A bilingual companion that answers in real time.",
    featuredImage: sampleLabProject.featuredImage,
    additionalPostFields: sampleLabProject.additionalPostFields,
    pageSections: sampleLabProject.pageSections,
  },
} satisfies Meta<typeof LabProjectArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DraftWithToast: Story = {
  args: { draft: true, slug: "real-time-advice-engine" },
};
