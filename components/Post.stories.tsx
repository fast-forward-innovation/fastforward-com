import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Post } from "./Post";
import { sampleProject, sampleDraftProject } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Pages/Post",
  component: Post,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Top-level project case-study page: a `CaseStudyArticle` followed by `FeaturedProjects`, plus a `DraftStatusToast` when the project is a draft. Rendered for `/our-work/[slug]`. Content comes from the mocked `@/lib/content`.",
      },
    },
  },
  args: { project: sampleProject },
} satisfies Meta<typeof Post>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Draft: Story = {
  args: { project: sampleDraftProject },
};
