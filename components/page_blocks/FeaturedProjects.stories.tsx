import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeaturedProjects } from "./FeaturedProjects";

const meta = {
  title: "Page Blocks/FeaturedProjects",
  component: FeaturedProjects,
  parameters: {
    docs: {
      description: {
        component:
          "Three-up grid of `ProjectCard`s shown at the foot of project case studies and the home page. Reads `getPublishedProjects()` — **served here from the mocked `@/lib/content`** so it renders in isolation.",
      },
    },
  },
} satisfies Meta<typeof FeaturedProjects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExcludingCurrentProject: Story = {
  args: { excludeSlug: "developing-a-massive-touch-screen-exhibit" },
};
