import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlogIndex } from "./BlogIndex";
import { sampleBlogIndexPage } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Pages/BlogIndex",
  component: BlogIndex,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The `blog-index` auto-listing (`/blog`). **Async server component** — awaits `getBlogPosts()` and renders a grid of `BlogCard`s under an optional `PageHero`. Posts come from the mocked `@/lib/content` (RSC rendering is enabled in `.storybook/main.ts`).",
      },
    },
  },
  args: { page: sampleBlogIndexPage },
} satisfies Meta<typeof BlogIndex>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHeader: Story = {};

export const NoHeader: Story = {
  args: { page: { ...sampleBlogIndexPage, header: undefined } },
};
