"use client";

import React, { useEffect, useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";
import { FiExternalLink } from "react-icons/fi";
import { MdRocketLaunch } from "react-icons/md";

const Resume = () => (
  <div className="flex ml-4 mt-2 text-xs">
    <a
      href="/Resume.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center text-violet-400 font-medium hover:scale-105 transition-all duration-300 ease"
    >
      <RiArrowRightUpLine className="animate-pulse" />
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
      <div className="flex items-center mb-4">
        <h1 className="bg-color font-extrabold text-3xl tracking-tight">
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
                  <h3 className="text-2xl font-semibold flex items-center flex-wrap gap-2">
                    {repo.name}
                    <div className="flex items-center gap-2">
                      <a
                        href={repo.html_url}
                        className="text-xs !font-medium text-violet-400 hover:scale-105 flex items-center transition-all duration-300 ease"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <RiArrowRightUpLine className="text-xs animate-pulse" />
                        <span>GITHUB</span>
                      </a>
                      {repo.homepage && (
                        <a
                          href={repo.homepage}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full
                            bg-emerald-400/10 text-emerald-400 border border-emerald-400/20
                            hover:bg-emerald-400/20 transition-all duration-300 ease-in-out transform hover:scale-105"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-1">
                            <MdRocketLaunch size={12} />
                          </span>
                        </a>
                      )}
                    </div>
                  </h3>
                  {repo.description && (
                    <p className="!text-[var(--text-p)]/80 mb-2">
                      {repo.description}
                    </p>
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
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
