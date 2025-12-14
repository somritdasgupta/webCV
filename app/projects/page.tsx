import React from "react";
import ProjectsPage from "./projectsPage";

export const revalidate = 7200;

export const metadata = {
  title: "Projects - Somrit Dasgupta",
  description:
    "Explore my portfolio of software development projects including web applications, AI/ML implementations, and open-source contributions.",
  openGraph: {
    title: "Projects - Somrit Dasgupta",
    description: "Explore my portfolio of software development projects including web applications, AI/ML implementations, and open-source contributions.",
    type: "website",
  },
};

export default function Projects() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Projects by Somrit Dasgupta",
            description: "Portfolio of software development projects",
            author: {
              "@type": "Person",
              name: "Somrit Dasgupta",
            },
          }),
        }}
      />
      <ProjectsPage />
    </>
  );
}
