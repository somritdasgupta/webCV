import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Somrit Dasgupta - Software Engineer",
    short_name: "Somrit Dasgupta",
    description: "Personal website and blog of Somrit Dasgupta - Software Engineer, Developer & Tech Enthusiast",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbfb",
    theme_color: "#2e6754",
    icons: [
      {
        src: "/favicon.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
  };
}
