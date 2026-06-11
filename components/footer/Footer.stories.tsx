import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Footer } from "./Footer";

const meta = {
  title: "Footer/Footer",
  component: Footer,
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Site footer (logo, tagline, contact address, nav links). Rendered globally via `FooterBlock` in `app/layout.tsx`. Designed for a dark background.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#1e2142]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
