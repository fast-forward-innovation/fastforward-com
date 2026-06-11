import type { StorybookConfig } from "@storybook/nextjs-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../components/**/*.mdx",
    "../components/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  // Render async server components (e.g. BlogIndex) in stories.
  features: {
    experimentalRSC: true,
  },
  // Serve /public so next/image, icons, and sample images resolve.
  staticDirs: ["../public"],
  viteFinal: async (viteConfig) => {
    // Swap the filesystem-backed content layer for in-memory fixtures so
    // data-fetching components (FeaturedProjects, ProjectCard…) render in the
    // browser. This exact-match alias must win over the general "@" alias, so
    // we prepend it as array-form entries.
    const contentMock = path.resolve(dirname, "../lib/content.mock.ts");
    const existing = viteConfig.resolve?.alias;
    const asArray = Array.isArray(existing)
      ? existing
      : Object.entries(existing ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }));
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: [
        { find: /^@\/lib\/content$/, replacement: contentMock },
        ...asArray,
      ],
    };
    return viteConfig;
  },
};

export default config;
