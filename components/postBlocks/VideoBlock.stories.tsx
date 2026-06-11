import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VideoBlock } from "./VideoBlock";
import {
  sampleVideoLoom,
  sampleVideoYoutube,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/VideoBlock",
  component: VideoBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Embeds a `VideoBlock` page section. Loom/YouTube URLs are auto-detected and embedded; direct file URLs use a native player. Rendered in **lab-project** articles only. (Embeds require network access in the preview.)",
      },
    },
  },
} satisfies Meta<typeof VideoBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loom: Story = {
  args: { block: sampleVideoLoom },
};

export const YouTube: Story = {
  args: { block: sampleVideoYoutube },
};
