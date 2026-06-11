import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MainSection } from "./MainSection";
import {
  sampleMainSection,
  sampleMainSectionGray,
  sampleMainSectionPlain,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/MainSection",
  component: MainSection,
  parameters: {
    docs: {
      description: {
        component:
          "The primary narrative block (`MainSection`). Auto-numbered `(01)`, `(02)`… in the left rail — the number comes from the `mainCount` prop, which the article renderer increments per MainSection. Used in **case-study**, **blog-case-study**, and **lab-project** articles.",
      },
    },
  },
  args: { mainCount: 1 },
} satisfies Meta<typeof MainSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTaglineAndTitle: Story = {
  args: { section: sampleMainSection },
};

export const GrayBackground: Story = {
  args: { section: sampleMainSectionGray, mainCount: 2 },
};

export const TitleOnly: Story = {
  args: { section: sampleMainSectionPlain, mainCount: 3 },
};
