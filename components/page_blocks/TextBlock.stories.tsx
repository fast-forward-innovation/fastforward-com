import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextBlock } from "./TextBlock";

const meta = {
  title: "Page Blocks/TextBlock",
  component: TextBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Centered intro/manifesto paragraph used on landing and default pages. Copy is hard-coded; only the `fontSize` (Tailwind classes) is configurable.",
      },
    },
  },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Smaller: Story = {
  args: { fontSize: "text-lg md:text-2xl" },
};
