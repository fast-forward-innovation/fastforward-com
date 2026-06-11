import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CardGrid } from "./CardGrid";
import {
  sampleCardGridWithImages,
  sampleCardGridTextOnly,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/CardGrid",
  component: CardGrid,
  parameters: {
    docs: {
      description: {
        component:
          "A responsive grid of titled cards (`CardGrid`). Use for format/audience sets or text-only feature cards on **case-study** capability pages. Cards are 1-up on mobile, 2-up on tablet, and `columns`-up (default 3) at desktop. Images are optional and support `placeholder` + `notes`. Place it directly after the MainSection it belongs to and give both the same `background`.",
      },
    },
  },
} satisfies Meta<typeof CardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImages: Story = {
  args: { block: sampleCardGridWithImages },
};

export const TextOnly: Story = {
  args: { block: sampleCardGridTextOnly },
};
