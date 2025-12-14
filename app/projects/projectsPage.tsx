"use client";

import React, { useEffect, useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";
import { FiExternalLink } from "react-icons/fi";
import { MdRocketLaunch } from "react-icons/md";
import BoxLoader from "../components/BoxLoader";

const Resume = () => (
  <div className="flex ml-4 mt-2 text-xs">
    <a
      href="/Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-[var(--bronzer)] font-medium hover:underline transition-colors"
    >
      <RiArrowRightUpLine />
      <span>RESUME</span>
    </a>
  </div>
);

export default function ProjectsPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch("/api/github", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            includeDescription: true,
            includeTopics: true,
            includeName: true,
            includeHtmlUrl: true,
            includeHomepage: true,
            includeCreatedAt: true, // Add this to get creation date
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Sort locally as well (as backup)
          const sortedRepos = data.sort((a: any, b: any) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
          setRepos(sortedRepos);
        } else {
          setError(data.error || "Failed to fetch repositories");
        }
      } catch (err) {
        setError("Failed to fetch repositories");
      }
    };

    fetchRepos();
  }, []);

  return (
    <div className="text-white">
      <section className="mb-4">
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-6">
          {repos.length > 0 ? (
            repos.map((repo: any) => (
              <div
                key={repo.id}
                className="border-l-4 border-[var(--callout-border)] pl-4 py-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-[var(--text-color)]">
                      {repo.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.html_url}
                        className="text-xs font-medium text-[var(--bronzer)] hover:underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        GitHub
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          className="text-xs font-medium px-2 py-1 bg-[var(--text-color)] text-[var(--bg-color)] rounded hover:opacity-80 transition-opacity"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-[var(--text-p)] mb-3">
                      {repo.description}
                    </p>
                  )}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {repo.topics.map((topic: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 text-[var(--text-p)] bg-[var(--callout-bg)] border border-[var(--callout-border)] rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <BoxLoader />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
