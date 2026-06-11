import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ZigZag } from "./ZigZag";
import { sampleZigZag } from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/ZigZag",
  component: ZigZag,
  parameters: {
    docs: {
      description: {
        component:
          "A stack of linked rows (`ZigZag`) that alternate copy / media side to side automatically via `:nth-child`. Used for section navigation (the digital/ & experiences/ index pages) and 'explore these areas' sets. A row with `diagram: true` contains its art on a soft brand panel for SVG diagrams.",
      },
    },
  },
} satisfies Meta<typeof ZigZag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavRows: Story = {
  args: { block: sampleZigZag },
};
