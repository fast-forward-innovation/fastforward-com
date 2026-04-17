import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fast Forward",
    short_name: "Fast Forward",
    start_url: "/",
    background_color: "#ffffff",
    display: "minimal-ui",
    icons: [
      {
        src: "/ff-favicon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
