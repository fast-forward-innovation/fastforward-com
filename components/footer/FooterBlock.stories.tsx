import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FooterBlock } from "./FooterBlock";

const meta = {
  title: "Footer/FooterBlock",
  component: FooterBlock,
  parameters: {
    docs: {
      description: {
        component:
          "The full page footer region: `ContactBlock` CTA + `Footer`, on the dark gradient background. Rendered globally in `app/layout.tsx` on every page.",
      },
    },
  },
} satisfies Meta<typeof FooterBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
