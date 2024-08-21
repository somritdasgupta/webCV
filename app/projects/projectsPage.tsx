"use client";

import React, { useEffect, useState } from "react";
import { TbBrandGithub } from "react-icons/tb";

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
      <h1 className="text-3xl font-semibold mb-4 tracking-tight">
        my projects
      </h1>
      <section className="mb-8 border-b border-[var(--callout-border)]">
        <div className="space-y-4 mb-4">
          <p className="!text-[var(--text-p)]/80">
            I completed my schooling from St. Stephens School, where I developed
            an{" "}
            <u>
              <b>interest</b>
            </u>{" "}
            for computers and programming.
          </p>
          <p className="!text-[var(--text-p)]/80">
            Then, I earned a{" "}
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
        <a
          href="/Resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="block px-2 py-2 text-sm font-medium text-[var(text-p)] bg-[var(--bronzer)]/25 rounded-lg mb-6 flex items-center justify-center max-w-[110px] w-full sm:w-auto"
        >
          GET RESUME
        </a>
      </section>
      <section className="mb-4">
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-8">
          {repos.length > 0 ? (
            repos.map((repo: any) => (
              <div key={repo.id} className="flex items-start lg:items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{repo.name}</h3>
                  {repo.description && (
                    <p className="text-gray-400 mb-2">{repo.description}</p>
                  )}
                  <a
                    href={repo.html_url}
                    className="font-semibold !text-violet-500 hover:!text-red-500 inline-flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <TbBrandGithub className="w-4 h-4 mr-1" />
                    GitHub
                  </a>
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
