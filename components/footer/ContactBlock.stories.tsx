import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContactBlock } from "./ContactBlock";

const meta = {
  title: "Footer/ContactBlock",
  component: ContactBlock,
  parameters: {
    docs: {
      description: {
        component:
          "The “Let’s Work Together” call-to-action that sits above the footer. Rendered globally via `FooterBlock` in `app/layout.tsx`. Designed for a dark background.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#1e2142] text-ff_lightGray">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
