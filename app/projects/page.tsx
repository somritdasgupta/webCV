import React from "react";
import ProjectsPage from "./projectsPage";

export const metadata = {
  title: "Projects",
  description:
    "Checkout the projects I've worked on related to development of software, leveraging AI, and more.",
};

export default function Projects() {
  return (
    <div>
      <ProjectsPage />
    </div>
  );
}
