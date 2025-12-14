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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 20;

  const fetchCommits = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/github-activity?page=${pageNum}&per_page=${perPage}`);
      const data = await response.json();
      
      if (data.commits && Array.isArray(data.commits)) {
        setCommits(data.commits);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching commits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits(page);
  }, [page]);

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
  
  const paginatedCommits = filteredCommits;
  
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
          commits
        </h1>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-4 py-2 text-sm rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-[var(--text-color)] hover:border-[var(--bronzer)]/50 focus:border-[var(--bronzer)] focus:outline-none transition-all duration-200 cursor-pointer min-w-[180px] shadow-lg flex items-center justify-between"
          >
            <span>{selectedRepo === 'all' ? 'All repositories' : selectedRepo?.split('/')?.[1] || 'Unknown'}</span>
            <svg className={`w-4 h-4 text-[var(--text-p)]/60 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div
                onClick={() => {
                  setSelectedRepo('all');
                  setPage(1);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-white/10 ${selectedRepo === 'all' ? 'bg-[var(--bronzer)]/20 text-[var(--bronzer)]' : 'text-[var(--text-color)]'}`}
              >
                All repositories
              </div>
              {uniqueRepos.map(repo => (
                <div
                  key={repo}
                  onClick={() => {
                    setSelectedRepo(repo);
                    setPage(1);
                    setIsDropdownOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-white/10 ${selectedRepo === repo ? 'bg-[var(--bronzer)]/20 text-[var(--bronzer)]' : 'text-[var(--text-color)]'}`}
                >
                  {repo?.split('/')?.[1] || 'Unknown'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="!text-[var(--text-p)]/80 mb-8">
        Real-time commits from my repositories
      </p>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

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
            <div className="space-y-4">
              {paginatedCommits.map((commit, index) => {
                const isLatest = latestCommitPerRepo.has(commit.id);
                const isLast = index === paginatedCommits.length - 1;
                return (
                  <div key={commit.id} className="relative">
                    {/* Timeline line segments */}
                    {index > 0 && (
                      <div className="absolute left-2 -top-2 w-0.5 h-2 bg-[var(--callout-border)]"></div>
                    )}
                    {!isLast && (
                      <div className="absolute left-2 bottom-0 w-0.5 h-2 bg-[var(--callout-border)]"></div>
                    )}
                    
                    <Link
                      href={commit.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex gap-4 pl-8 py-3"
                    >
                      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        isLatest 
                          ? 'border-[var(--bronzer)] bg-[var(--bronzer)] group-hover:scale-110 shadow-[var(--bronzer)]/30' 
                          : 'border-[var(--callout-border)] bg-[var(--bg)] group-hover:border-[var(--bronzer)] group-hover:bg-[var(--bronzer)]/20'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors truncate">
                            {commit.repo?.split("/")?.[1] || 'Unknown'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] flex-shrink-0">
                            {commit.branch}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-color)] mb-1 truncate">
                          {commit.message?.split('\n')?.[0] || 'No message'}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-p)]/70">
                          <span>{commit.author || 'Unknown'}</span>
                          <span>+{commit.additions || 0} -{commit.deletions || 0}</span>
                          <span>{commit.files || 0} files</span>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-p)]/60 flex-shrink-0">
                        {formatTime(commit.timestamp)}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--text-p)]">
              Page {page}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || loading}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--callout-bg)] border border-[var(--callout-border)] text-[var(--text-p)] hover:border-[var(--bronzer)] hover:text-[var(--bronzer)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}