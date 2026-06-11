import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FeaturedWorkBlock } from "./FeaturedWorkBlock";

const meta = {
  title: "Blocks/FeaturedWork",
  component: FeaturedWorkBlock,
  parameters: {
    docs: {
      description: {
        component:
          "A curated 'recent work' carousel (`FeaturedWork`) — a hand-picked, ordered set of `ProjectCard`s that scrolls horizontally. Normally embedded in a `MainSection`'s `blocks`; the `embedded` story shows that bare form. Resolves slugs via `getProjectBySlug` — **served here from the mocked `@/lib/content`**, so the stories use slugs that exist in the mock.",
      },
    },
  },
} satisfies Meta<typeof FeaturedWorkBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const block = {
  type: "FeaturedWork" as const,
  slugs: [
    "demonstrating-innovation-with-a-gamified-microsite",
    "real-time-advice-for-expectant-parents",
  ],
};

export const CuratedProjects: Story = {
  args: { block },
};

export const Embedded: Story = {
  args: { block, embedded: true },
};
