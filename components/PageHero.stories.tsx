import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageHero } from "./PageHero";

const meta = {
  title: "Layout/PageHero",
  component: PageHero,
  parameters: {
    docs: {
      description: {
        component:
          "Dark full-bleed hero used by **default-layout** pages (and the blog index) when a `header` block is set in frontmatter — e.g. the `/our-work` header. Renders the title and optional intro over a darkened background image.",
      },
    },
  },
} satisfies Meta<typeof PageHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIntro: Story = {
  args: {
    title: "Our Work",
    header: {
      background: "/Touchscreen-1-denoise-gigapixel.jpg",
      intro:
        "We love to tackle complex problems and provide simple, elegant solutions to help our clients exceed their goals.",
    },
  },
};

export const TitleOnly: Story = {
  args: {
    title: "About Us",
    header: { background: "/Touchscreen-1-denoise-gigapixel.jpg" },
  },
};
