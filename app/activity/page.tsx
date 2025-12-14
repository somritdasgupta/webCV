"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BoxLoader from "../components/BoxLoader";

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
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState<string>('all');
  const perPage = 20;

  useEffect(() => {
    fetch("/api/github-activity")
      .then((res) => res.json())
      .then((data) => {
        setCommits(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const filteredCommits = selectedRepo === 'all' 
    ? commits 
    : commits.filter(commit => commit.repo === selectedRepo);
  
  const totalPages = Math.ceil(filteredCommits.length / perPage);
  const paginatedCommits = filteredCommits.slice((page - 1) * perPage, page * perPage);
  
  const uniqueRepos = Array.from(new Set(commits.map(commit => commit.repo)));
  const latestCommitPerRepo = new Set(
    uniqueRepos.map(repo => 
      commits.find(commit => commit.repo === repo)?.id
    ).filter(Boolean)
  );

  return (
    <section className="min-h-screen w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="bg-color font-extrabold text-3xl tracking-tight">
          commit activity
        </h1>
        <select
          value={selectedRepo}
          onChange={(e) => {
            setSelectedRepo(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-color)] hover:border-[var(--bronzer)] focus:border-[var(--bronzer)] focus:outline-none transition-colors"
        >
          <option value="all">All repositories</option>
          {uniqueRepos.map(repo => (
            <option key={repo} value={repo}>
              {repo.split('/')[1]}
            </option>
          ))}
        </select>
      </div>

      <p className="!text-[var(--text-p)]/80 mb-8">
        Real-time commit activity from my repositories
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <BoxLoader />
        </div>
      ) : filteredCommits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-p)]/60">No commits found</p>
        </div>
      ) : (
        <>
          <div className="relative mb-8">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[var(--callout-border)]"></div>
            <div className="space-y-4">
              {paginatedCommits.map((commit) => {
                const isLatest = latestCommitPerRepo.has(commit.id);
                return (
                  <Link
                    key={commit.id}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex gap-4 pl-8 py-2"
                  >
                    <div className={`absolute left-0 top-3 w-4 h-4 rounded-full border-2 transition-all duration-200 z-10 ${
                      isLatest 
                        ? 'bg-[var(--bronzer)] border-[var(--bronzer)] group-hover:scale-110' 
                        : 'bg-[var(--callout-bg)] border-[var(--callout-border)] group-hover:border-[var(--bronzer)] group-hover:bg-[var(--bronzer)]/20'
                    }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors truncate">
                        {commit.repo.split("/")[1]}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] flex-shrink-0">
                        {commit.branch}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-color)] mb-1 truncate">
                      {commit.message.split('\n')[0]}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-p)]/70">
                      <span>{commit.author}</span>
                      <span>+{commit.additions} -{commit.deletions}</span>
                      <span>{commit.files} files</span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-p)]/60 flex-shrink-0">
                    {formatTime(commit.timestamp)}
                  </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--text-p)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-lg bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
