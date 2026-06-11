import type { Preview } from "@storybook/nextjs-vite";
import React from "react";
import { manrope, jetbrainsMono } from "../app/fonts";
import "../app/globals.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    // Enable the App Router context so next/navigation + next/image work.
    nextjs: { appDirectory: true },
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    // Report a11y violations without failing the test run by default.
    a11y: { test: "todo" },
  },
  // Match app/layout.tsx: apply the font CSS-var classes + base body styles
  // so components render with production typography and background.
  decorators: [
    (Story) => (
      <div
        className={`${manrope.variable} ${jetbrainsMono.variable} antialiased font-sans bg-white`}
      >
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
};

export default preview;
