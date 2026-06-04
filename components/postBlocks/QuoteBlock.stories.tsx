import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QuoteBlock } from "./QuoteBlock";
import {
  sampleClientQuote,
  sampleClientQuoteNoTagline,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/QuoteBlock",
  component: QuoteBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Renders a `ClientQuote` page section — a pull quote with an eyebrow tagline and attribution. Used in **case-study**, **blog-case-study**, and **lab-project** articles.",
      },
    },
  },
} satisfies Meta<typeof QuoteBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTagline: Story = {
  args: { section: sampleClientQuote },
};

export const NoTagline: Story = {
  args: { section: sampleClientQuoteNoTagline },
};
