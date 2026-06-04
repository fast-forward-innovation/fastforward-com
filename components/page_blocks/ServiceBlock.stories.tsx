import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ServiceBlock } from "./ServiceBlock";

const meta = {
  title: "Page Blocks/ServiceBlock",
  component: ServiceBlock,
  parameters: {
    docs: {
      description: {
        component:
          "The four-category services overview (Strategy / Design / Development / Support). Content is hard-coded in the component; composed into landing/services pages.",
      },
    },
  },
} satisfies Meta<typeof ServiceBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
