import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContactForm } from "./ContactForm";

const meta = {
  title: "Forms/ContactForm",
  component: ContactForm,
  parameters: {
    docs: {
      description: {
        component:
          "The `/contact-us` form. Client component with inline validation and phone auto-formatting; submits to `/api/contact` then routes to `/contact-submitted`. The Cloudflare Turnstile widget only renders when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, so it's absent here.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="section-wide max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
