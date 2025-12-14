"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BoxLoader from "../components/BoxLoader";
import SectionHeader from "../components/SectionHeader";
import { HiOutlineCodeBracket } from "react-icons/hi2";

interface Commit {
  id: string;
  repo: string;
  branch: string;
  timestamp: string;
  url: string;
}

export default function ActivityPage() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="min-h-screen w-full">
      <div className="space-y-4 lg:space-y-8">
        <SectionHeader
          title="commit activity"
          icon={
            <HiOutlineCodeBracket className="inline w-8 h-8 ml-2 text-[var(--bronzer)]" />
          }
        />

        <p className="!text-[var(--text-p)]/80 mb-6">
          Real-time commit activity from my GitHub repositories
        </p>

        <div className="nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <BoxLoader />
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text-p)]/60">No commits found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {commits.map((commit) => (
                <Link
                  key={commit.id}
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border-l-4 border-[var(--callout-border)] pl-4 py-3 hover:border-[var(--bronzer)] transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors truncate">
                          {commit.repo.split("/")[1]}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] flex-shrink-0">
                          {commit.branch}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-p)]/70">
                        {commit.repo.split("/")[0]}
                      </p>
                    </div>
                    <span className="text-xs text-[var(--text-p)]/60 flex-shrink-0">
                      {formatTime(commit.timestamp)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
