import React from "react";
import ProjectsPage from "./projectsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Checkout a summary of my projects I've worked on engineering software, leveraging AI, and more.",
};

export default function Projects() {
  return (
    <div>
      <ProjectsPage />
    </div>
  );
}
