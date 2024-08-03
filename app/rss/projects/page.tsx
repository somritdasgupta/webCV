// app/projects/page.tsx

import React from "react";
import ProjectsPage from "./projectsPage";

// Server-side metadata wrapper
export const metadata = {
  title: 'Projects',
  description: "Projects | by Somrit Dasgupta",
};

export default function Projects() {
  return (
    <div>
      <ProjectsPage />
    </div>
  );
}
