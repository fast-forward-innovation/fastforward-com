import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteHeader } from "./SiteHeader";

const meta = {
  title: "Layout/SiteHeader",
  component: SiteHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The fixed global navigation bar, rendered on every page via `app/layout.tsx`. Client component — reads `usePathname()` to swap the logo to a non-link on the home page and to drive the responsive hamburger menu. Set the active route with `parameters.nextjs.navigation.pathname`.",
      },
    },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteriorPage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/our-work" } } },
};

export const HomePage: Story = {
  parameters: { nextjs: { navigation: { pathname: "/" } } },
};
