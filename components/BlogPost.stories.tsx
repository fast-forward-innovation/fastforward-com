import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BlogPost } from "./BlogPost";
import { sampleBlogPage } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Pages/BlogPost",
  component: BlogPost,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The `blog`-layout post renderer: featured image, back-link, tags, title, author byline + date, and `contentHtml` body. Used by the `[...slug]` route for blog posts.",
      },
    },
  },
  args: { page: sampleBlogPage },
} satisfies Meta<typeof BlogPost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoFeaturedImage: Story = {
  args: { page: { ...sampleBlogPage, featuredImage: undefined } },
};
