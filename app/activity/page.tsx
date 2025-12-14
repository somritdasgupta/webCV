"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BoxLoader from "../components/BoxLoader";
import { motion, AnimatePresence } from "framer-motion";

type View = "projects" | "commits" | "bookmarks";

interface Commit {
  id: string;
  repo: string;
  branch: string;
  timestamp: string;
  url: string;
  message: string;
  author: string;
  additions: number;
  deletions: number;
  files: number;
}

export default function ActivityPage() {
  const [view, setView] = useState<View>("projects");

  useEffect(() => {
    const handleViewChange = (e: any) => {
      setView(e.detail === 0 ? "projects" : "commits");
    };
    window.addEventListener("activityViewChange", handleViewChange);
    return () => window.removeEventListener("activityViewChange", handleViewChange);
  }, []);
  const [repos, setRepos] = useState<any[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (view === "projects" && repos.length === 0) {
      const fetchRepos = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              includeDescription: true,
              includeTopics: true,
              includeName: true,
              includeHtmlUrl: true,
              includeHomepage: true,
              includeCreatedAt: true,
            }),
          });
          const data = await response.json();
          if (response.ok && Array.isArray(data)) {
            setRepos(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
          }
        } finally {
          setLoading(false);
        }
      };
      fetchRepos();
    } else if (view === "projects") {
      setLoading(false);
    }
  }, [view, repos.length]);

  useEffect(() => {
    if (view === "commits") {
      const fetchCommits = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/github-activity?page=${page}&per_page=20`);
          const data = await response.json();
          if (data.commits && Array.isArray(data.commits)) {
            setCommits(data.commits);
            setHasMore(data.hasMore);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchCommits();
    }
  }, [view, page]);

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    return days > 0 ? `${days}d` : hours > 0 ? `${hours}h` : "now";
  };

  const toggleView = () => {
    setView(view === "projects" ? "commits" : "projects");
  };

  return (
    <div className="w-full">

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-20"
          >
            <BoxLoader />
          </motion.div>
        ) : view === "projects" ? (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {repos.length === 0 ? (
              <div className="text-center py-20 text-[var(--text-p)]">
                GitHub personal access token is not defined
              </div>
            ) : repos.map((repo, idx) => (
              <motion.div
                key={repo.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl p-6 lg:p-8"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-semibold text-[var(--text-color)] mb-2">
                      {repo.name}
                    </h3>
                    {repo.description && (
                      <p className="text-sm lg:text-base text-[var(--text-p)] leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--nav-border)] rounded-xl font-medium hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all duration-200"
                    >
                      View on GitHub
                    </a>
                    {repo.homepage && (
                      <a
                        href={repo.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="commits"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {commits.length > 0 ? (
              <>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--bronzer)] via-[var(--bronzer)]/50 to-transparent" />
                  <div className="space-y-6">
                    {commits.map((commit, idx) => (
                      <motion.div
                        key={commit.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative pl-12"
                      >
                        <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-[var(--bronzer)] ring-4 ring-[var(--card-bg)]" />
                        <Link
                          href={commit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group bg-[var(--card-bg)] border border-[var(--callout-border)] rounded-xl p-5 hover:border-[var(--bronzer)] transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors">
                                {commit.repo?.split("/")[1]}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-[var(--bronzer)]/10 text-[var(--bronzer)] rounded-full">
                                {commit.branch}
                              </span>
                            </div>
                            <span className="text-xs text-[var(--text-p)]/60">{formatTime(commit.timestamp)}</span>
                          </div>
                          <p className="text-sm text-[var(--text-color)] mb-2">{commit.message?.split("\n")[0]}</p>
                          <div className="flex gap-4 text-xs text-[var(--text-p)]/70">
                            <span>{commit.author}</span>
                            <span className="text-green-400">+{commit.additions}</span>
                            <span className="text-red-400">-{commit.deletions}</span>
                            <span>{commit.files} files</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2.5 text-sm font-medium border border-[var(--callout-border)] rounded-xl hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-30 transition-all"
                  >
                    ←
                  </button>
                  <span className="px-6 py-2.5 text-sm font-bold bg-[var(--bronzer)]/10 text-[var(--bronzer)] rounded-xl">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasMore}
                    className="px-6 py-2.5 text-sm font-medium border border-[var(--callout-border)] rounded-xl hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-30 transition-all"
                  >
                    →
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-[var(--text-p)]">
                GitHub personal access token is not defined
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
