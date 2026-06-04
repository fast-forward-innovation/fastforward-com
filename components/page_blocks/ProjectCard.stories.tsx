import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ProjectCard } from "./ProjectCard";
import { getPublishedProjects } from "@/lib/content";

const [project] = getPublishedProjects();

const meta = {
  title: "Page Blocks/ProjectCard",
  component: ProjectCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A linked project thumbnail (image, title, service tags) used in the `/our-work` grid and `FeaturedProjects`. Looks up service names via `getServiceById()` — **served here from the mocked `@/lib/content`**.",
      },
    },
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { project },
};

export const PlaceholderCardImage: Story = {
  args: {
    project: {
      ...project,
      cardImage: {
        src: "",
        alt: "Card art in progress",
        width: 1000,
        height: 1150,
        placeholder: true,
        notes: "Bold, high-contrast hero crop.",
      },
    },
  },
};
