import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageBlock } from "./ImageBlock";
import {
  sampleImageBlockSingle,
  sampleImageBlockNarrow,
  sampleImageBlockPair,
  sampleImageBlockPlaceholder,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/ImageBlock",
  component: ImageBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Renders an `ImageBlock` page section: one full-bleed/text-width image or two side-by-side. Any image can be a draft `placeholder`. Used in **case-study**, **blog-case-study**, and **lab-project** articles.",
      },
    },
  },
} satisfies Meta<typeof ImageBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleFullBleed: Story = {
  args: { block: sampleImageBlockSingle },
};

export const SingleTextWidth: Story = {
  args: { block: sampleImageBlockNarrow },
};

export const Pair: Story = {
  args: { block: sampleImageBlockPair },
};

export const Placeholder: Story = {
  args: { block: sampleImageBlockPlaceholder },
};
