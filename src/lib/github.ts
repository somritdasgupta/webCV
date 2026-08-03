import { useQuery } from "@tanstack/react-query";
import { GITHUB } from "@/site.config";

export interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  default_branch?: string;
}

export interface GhEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string; url: string };
  payload: {
    commits?: Array<{ sha: string; message: string; url: string; author: { email: string; name: string } }>;
    ref?: string;
    ref_type?: string;
    action?: string;
    pull_request?: { title: string; html_url: string; number: number };
    issue?: { title: string; html_url: string; number: number };
  };
}

const GH = "https://api.github.com";

const filterRepos = (repos: GhRepo[]): GhRepo[] => {
  let result = repos.filter((r) => !r.fork && !r.archived);

  // Filter: keep repo if ID is in repoIdAllowlist OR full_name matches repoAllowlist.
  // If both lists are empty, show everything.
  const idSet = new Set(GITHUB.repoIdAllowlist);
  const nameSet = new Set(GITHUB.repoAllowlist.map((s) => s.toLowerCase()));
  if (idSet.size > 0 || nameSet.size > 0) {
    result = result.filter(
      (r) => idSet.has(r.id) || nameSet.has(r.full_name.toLowerCase()),
    );
  }

  // pinned first, then by pushed_at desc
  const pinned = new Map(GITHUB.pinned.map((p, i) => [p.toLowerCase(), i]));
  result.sort((a, b) => {
    const pa = pinned.get(a.full_name.toLowerCase());
    const pb = pinned.get(b.full_name.toLowerCase());
    if (pa !== undefined && pb !== undefined) return pa - pb;
    if (pa !== undefined) return -1;
    if (pb !== undefined) return 1;
    return +new Date(b.pushed_at) - +new Date(a.pushed_at);
  });
  return result;
};

export const useGithubRepos = () =>
  useQuery({
    queryKey: ["gh-repos", GITHUB.username],
    queryFn: async (): Promise<GhRepo[]> => {
      const res = await fetch(
        `${GH}/users/${GITHUB.username}/repos?per_page=100&sort=pushed`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!res.ok) throw new Error(`GitHub: ${res.status}`);
      const data = (await res.json()) as GhRepo[];
      return filterRepos(data);
    },
    staleTime: 1000 * 60 * 10, // 10 min
    refetchOnWindowFocus: false,
  });

export const useGithubEvents = () =>
  useQuery({
    queryKey: ["gh-events", GITHUB.username, GITHUB.repoAllowlist.join(",")],
    queryFn: async (): Promise<GhEvent[]> => {
      const res = await fetch(
        `${GH}/users/${GITHUB.username}/events/public?per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!res.ok) throw new Error(`GitHub: ${res.status}`);
      const data = (await res.json()) as GhEvent[];
      // For events, only the full_name string is available — not the ID.
      // So events are filtered by name only when repoAllowlist is non-empty.
      const allow =
        GITHUB.repoAllowlist.length > 0
          ? new Set(GITHUB.repoAllowlist.map((s) => s.toLowerCase()))
          : null;
      return data.filter((e) => !allow || allow.has(e.repo.name.toLowerCase()));
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5,
  });

/**
 * Per-repo commits feed.
 *
 * GitHub's /users/:user/events endpoint only returns ~30 most recent events
 * (max 90 days). To get a full history, we fan out across the filtered repos
 * and pull commits from each — same approach as the previous Next.js
 * /api/github-activity route, but unauthenticated and client-side.
 *
 * Rate limit note: each repo = 1 API call. With 8 allowlisted repos and a
 * 60 req/hr unauth limit, this comfortably fits. Results are cached 10 min.
 */
export interface GhCommit {
  sha: string;
  repo: string;       // "owner/name"
  branch: string;
  message: string;
  author: string;
  authorAvatar: string | null;
  date: string;
  url: string;
}

/** Max repos we fan out to. Unauthenticated GitHub allows 60 req/h per IP —
 *  fanning out to every repo blows the budget, requests start returning 403,
 *  and the feed silently degrades to whichever handful happened to succeed. */
const COMMIT_REPO_FANOUT = 12;
const FANOUT_CONCURRENCY = 4;

/** Run tasks with bounded concurrency, preserving input order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

export const useGithubCommits = (limitPerRepo = 30) =>
  useQuery({
    queryKey: ["gh-commits-all", GITHUB.username, limitPerRepo],
    queryFn: async (): Promise<GhCommit[]> => {
      // 1. Repos owned by the user, newest activity first.
      const reposRes = await fetch(
        `${GH}/users/${GITHUB.username}/repos?per_page=100&sort=pushed&direction=desc&type=owner`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (!reposRes.ok) throw new Error(`GitHub repos: ${reposRes.status}`);

      const repos = ((await reposRes.json()) as GhRepo[])
        .filter((r) => !r.fork && !r.archived && r.pushed_at)
        // Trust local ordering rather than the API's sort param.
        .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
        .slice(0, COMMIT_REPO_FANOUT);

      // 2. Pull the newest commits from each repo's default branch.
      let failures = 0;
      const all = await mapLimit(repos, FANOUT_CONCURRENCY, async (r) => {
        // No `author=` filter: commits land under several identities (web UI,
        // CI bots, a secondary email), and filtering by login silently dropped
        // the newest pushes — which is exactly why the feed looked stale.
        const url = `${GH}/repos/${r.full_name}/commits?per_page=${limitPerRepo}`;
        try {
          const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
          if (!res.ok) {
            failures++;
            return [] as GhCommit[];
          }
          const list = (await res.json()) as Array<{
            sha: string;
            html_url: string;
            commit: { message: string; author: { name: string; date: string } };
            author: { avatar_url: string } | null;
          }>;
          return list.map<GhCommit>((c) => ({
            sha: c.sha,
            repo: r.full_name,
            branch: r.default_branch || "main",
            message: c.commit.message,
            author: c.commit.author.name,
            authorAvatar: c.author?.avatar_url || null,
            date: c.commit.author.date,
            url: c.html_url,
          }));
        } catch {
          failures++;
          return [] as GhCommit[];
        }
      });

      // 3. Flatten, dedupe by sha, sort newest first.
      const seen = new Set<string>();
      const flat = all
        .flat()
        .filter((c) => (seen.has(c.sha) ? false : (seen.add(c.sha), true)))
        .sort((a, b) => +new Date(b.date) - +new Date(a.date));

      // Everything failed → surface the error instead of showing a stale subset.
      if (flat.length === 0 && failures > 0) {
        throw new Error("GitHub rate-limited the commit feed. Try again shortly.");
      }
      return flat;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });



