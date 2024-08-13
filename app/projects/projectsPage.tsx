"use client";

import React, { useEffect, useState } from "react";
import { CommandLineIcon } from "@heroicons/react/24/outline";

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
      <section className="mb-6">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Education</h1>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium">
              Maulana Abul Kalam Azad University Of Technology
            </h3>
            <p className="text-yellow-500">2020 — 2024</p>
            <p>
              Pursued Bachelor of Technology in the field of Computer Science
              and Engineering
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium">St. Stephens School</h3>
            <p className="text-yellow-500">2018 — 2020</p>
            <p>
              Undertaken the Indian School Certificate (ISC) examination in
              Standard-12 held by CISCE, in the field of Computer Science and
              Mathematics
            </p>
          </div>
        </div>
      </section>

      <a
        href="/Resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="block px-2 py-2 text-sm font-medium text-white bg-[#ec66524f] rounded-lg mb-6 flex items-center justify-center max-w-[110px] w-full sm:w-auto tracking-tight"
      >
        GET RESUME
      </a>

      <section className="mb-6">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Projects</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-8">
          {repos.length > 0 ? (
            repos.map((repo: any) => (
              <div key={repo.id} className="flex items-start lg:items-center">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{repo.name}</h3>
                  {repo.description && (
                    <p className="text-gray-400 mb-2">{repo.description}</p>
                  )}
                  <a
                    href={repo.html_url}
                    className="inline-flex items-center text-yellow-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CommandLineIcon className="w-4 h-4 mr-1" />
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

      {/* Skills Section */}
      <section>
        <h2 className="text-3xl font-bold mb-4">Skills</h2>
        <div className="flex flex-wrap gap-4">
          <span className="custom-skill-pill">react</span>
          <span className="custom-skill-pill">node.js</span>
          <span className="custom-skill-pill">docker</span>
          <span className="custom-skill-pill">rest-api</span>
          <span className="custom-skill-pill">sql</span>
          <span className="custom-skill-pill">cloud technologies</span>
          <span className="custom-skill-pill">Next.js</span>
          <span className="custom-skill-pill">javaScript</span>
          <span className="custom-skill-pill">typeScript</span>
        </div>
      </section>
    </div>
  );
}
