import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DraftStatusToast } from "./DraftStatusToast";
import {
  editorialDraft,
  editorialReviewWithPr,
  editorialApproved,
} from "@/lib/styleguide/samplePages";

const meta = {
  title: "Layout/DraftStatusToast",
  component: DraftStatusToast,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A fixed bottom-right toast shown on **draft** project case studies and lab projects (rendered by `Post` / `LabProjectArticle` when `draft` is set). The left-border accent and PR link reflect the `editorial.status`. Dismissal persists per-slug in `sessionStorage`.",
      },
    },
  },
  args: { slug: "a-draft-project" },
} satisfies Meta<typeof DraftStatusToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: { slug: "draft-example", editorial: editorialDraft },
};

export const InReviewWithPr: Story = {
  args: { slug: "review-example", editorial: editorialReviewWithPr },
};

export const Approved: Story = {
  args: { slug: "approved-example", editorial: editorialApproved },
};
