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
          "The `landing`-layout page renderer: gradient hero, features grid, optional `contentHtml`, and a `FeaturedProjects` footer. Projects in the footer come from the mocked `@/lib/content`.",
      },
    },
  },
  args: { page: sampleLandingPage },
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
