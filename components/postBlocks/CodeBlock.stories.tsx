import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CodeBlock } from "./CodeBlock";
import { sampleCodeBlock, sampleCodeBlockBare } from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/CodeBlock",
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component:
          "A `CodeBlock` page section. Rendered in **lab-project** articles only (via the shared `renderPageSection` dispatcher). Authored as a `CodeBlock` entry in a page's `pageSections`.",
      },
    },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithFilenameAndLanguage: Story = {
  args: { block: sampleCodeBlock },
};

export const BareSnippet: Story = {
  args: { block: sampleCodeBlockBare },
};
