import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TeamProfile } from "./TeamProfile";
import {
  sampleTeamIndividual,
  sampleTeamGroup,
  sampleTeamNoAvatar,
} from "@/lib/styleguide/sampleSections";

const meta = {
  title: "Blocks/TeamProfile",
  component: TeamProfile,
  parameters: {
    docs: {
      description: {
        component:
          "Introduces the person or team behind a project (`TeamProfile` page section). Falls back to the hand-drawn `DefaultAvatar` when no `avatar` is set. Rendered in **lab-project** articles only.",
      },
    },
  },
} satisfies Meta<typeof TeamProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Individual: Story = {
  args: { block: sampleTeamIndividual },
};

export const Team: Story = {
  args: { block: sampleTeamGroup },
};

export const NoAvatar: Story = {
  args: { block: sampleTeamNoAvatar },
};
