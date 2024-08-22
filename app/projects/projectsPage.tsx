"use client";

import React, { useEffect, useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";

const Resume = () => (
  <div className="flex ml-4 mt-2 text-xs">
    <a
      href="/Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-violet-400 hover:text-red-500 transition-all duration-300 ease"
    >
      <RiArrowRightUpLine className="animate-pulse" />
      <span className="hover:font-medium">RESUME</span>
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
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setRepos(data);
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
      <div className="flex items-center mb-4">
        <h1 className="bg-color font-semibold text-3xl tracking-tight">
          my background
        </h1>
        <Resume />
      </div>
      <section className="mb-8 border-b border-[var(--callout-border)]">
        <div className="space-y-4 mb-4">
          <p className="!text-[var(--text-p)]/80">
            I completed my schooling at St. Stephens School, where I developed
            an{" "}
            <u>
              <b>interest</b>
            </u>{" "}
            in computers and programming.
          </p>
          <p className="!text-[var(--text-p)]/80">
            Afterwards, I earned a{" "}
            <u>
              <b>B.Tech</b>
            </u>{" "}
            in Computer Science and Engineering from Maulana Abul Kalam Azad
            University of Technology, where I learned low-level programming
            using java. Since then, I've worked on some personal projects, and
            I'd{" "}
            <u>
              <b>love</b>
            </u>{" "}
            for you to check them out.
          </p>
        </div>
      </section>
      <section className="mb-4">
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-8">
          {repos.length > 0 ? (
            repos.map((repo: any) => (
              <div key={repo.id} className="flex items-start lg:items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold flex items-center">
                    {repo.name}
                    <a
                      href={repo.html_url}
                      className="ml-2 text-xs !font-medium text-violet-400 hover:text-red-500 flex items-center mt-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <RiArrowRightUpLine className="text-xs animate-pulse" />
                      <span>GITHUB</span>
                    </a>
                  </h3>
                  {repo.description && (
                    <p className="!text-[var(--text-p)]/80 mb-2">{repo.description}</p>
                  )}
                  {repo.topics && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {repo.topics.map((topic: string, index: number) => (
                        <span key={index} className="custom-topic-pill">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="mt-2 mb-2">Doing the heavy lifting 🚀</p>
          )}
        </div>
      </section>
    </div>
  );
}
