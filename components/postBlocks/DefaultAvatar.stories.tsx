import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DefaultAvatar } from "./DefaultAvatar";

const meta = {
  title: "Blocks/DefaultAvatar",
  component: DefaultAvatar,
  parameters: {
    docs: {
      description: {
        component:
          "Hand-drawn SVG avatar used by `TeamProfile` when a profile has no `avatar` image. `currentColor` drives the stroke, so wrap it to recolor.",
      },
    },
  },
  args: { className: "w-40 h-32 text-ff_black" },
} satisfies Meta<typeof DefaultAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Teal: Story = {
  args: { className: "w-40 h-32 text-ff_teal" },
};
