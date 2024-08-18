import React from "react";
import ProjectsPage from "./projectsPage";
import { baseUrl } from "app/sitemap";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - Somrit Dasgupta",
  description:
    "Explore the projects I've worked on, focusing on software, AI, and modern technologies.",
  openGraph: {
    title: "Projects - Somrit Dasgupta",
    description:
      "Explore the projects I've worked on, focusing on software, AI, and modern technologies.",
    siteName: "Somrit Dasgupta",
    url: `${baseUrl}/projects`,
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og?title=${encodeURIComponent(
          "hey, I'm Somrit / Check Out What I've Worked On"
        )}`,
        width: 2400,
        height: 1260,
        alt: "Projects - Somrit Dasgupta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects - Somrit Dasgupta",
    description:
      "Explore the projects I've worked on, focusing on software, AI, and modern technologies.",
    images: [
      `${baseUrl}/api/og?title=${encodeURIComponent(
        "hey, I'm Somrit / Check Out What I've Worked On"
      )}`,
    ],
  },
};
export default function Projects() {
  return (
    <div>
      <ProjectsPage />
    </div>
  );
}
