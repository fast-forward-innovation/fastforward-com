import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PlaceholderImage } from "./PlaceholderImage";

const meta = {
  title: "Blocks/PlaceholderImage",
  component: PlaceholderImage,
  parameters: {
    docs: {
      description: {
        component:
          "A styled stand-in shown wherever a real image is still being produced (any `placeholder: true` image in `featuredImage`, `cardImage`, or an `ImageBlock`). Surfaces the alt text and optional designer `notes`.",
      },
    },
  },
  args: { alt: "Hero shot of the finished installation in the gallery space" },
} satisfies Meta<typeof PlaceholderImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sized: Story = {
  args: { width: 1600, height: 900 },
};

export const WithDesignerNotes: Story = {
  args: {
    width: 1600,
    height: 900,
    notes: "Wide shot, warm lighting, people interacting with the screen.",
  },
};

export const Fill: Story = {
  args: { fill: true },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 368 }}>
        <Story />
      </div>
    ),
  ],
};
