import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LandingPage } from "./LandingPage";
import { sampleLandingPage } from "@/lib/styleguide/samplePages";

const meta = {
  title: "Pages/LandingPage",
  component: LandingPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The `landing`-layout page renderer (Digital, Experiences): a left-aligned header on a soft tint with decorative letterforms behind it, followed by the page's blocks. The frontmatter `title` is the mono eyebrow; `header.title` is the display headline.",
      },
    },
  },
  args: { page: sampleLandingPage },
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
