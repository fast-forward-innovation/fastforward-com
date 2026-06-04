import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomepageBanner } from "./HomepageBanner";

const meta = {
  title: "Layout/HomepageBanner",
  component: HomepageBanner,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The full-bleed hero on the home page (`app/page.tsx`). Client component that cross-fades three rotating background images and cycles the Design / Develop / Experience headline on an interval (paused for reduced-motion).",
      },
    },
  },
} satisfies Meta<typeof HomepageBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
