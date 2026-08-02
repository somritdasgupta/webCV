/**
 * GitHub Contents API client for the admin MCP server (Deno runtime).
 *
 * Deliberately standalone: nothing here imports browser code from `src/lib/admin`,
 * because the edge-function bundle must not pull in React/Vite-only modules.
 * The repo coordinates are compile-time constants — never taken from tool input,
 * so a caller cannot redirect a write at another repository.
 */
import { githubToken } from "./env";

export const REPO = {
  owner: "somritdasgupta",
  name: "webCV",
  branch: "main",
  contentDir: "content/blog",
} as const;

const API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}`;

const headers = () => ({
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${githubToken()}`,
  "User-Agent": "somrit-webcv-mcp",
  "X-GitHub-Api-Version": "2022-11-28",
});

const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

const fromB64 = (s: string) => {
  const bin = atob(s.replace(/\n/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

async function ghFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...init, headers: headers() });
  return res;
}

async function fail(res: Response, action: string): Promise<never> {
  const body = await res.text();
  let message = body;
  try {
    const parsed = JSON.parse(body) as { message?: string; errors?: unknown };
    message = parsed.message ?? body;
    if (parsed.errors) message += ` — ${JSON.stringify(parsed.errors)}`;
  } catch {
    /* keep raw body */
  }
  throw new Error(`${action} failed (${res.status}): ${message}`);
}

/** Normalize an arbitrary caller-supplied slug into a safe filename stem. */
export function safeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/\.mdx$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (!slug) throw new Error("Slug is empty after normalization.");
  return slug;
}

export const pathForSlug = (slug: string) => `${REPO.contentDir}/${slug}.mdx`;

export interface RepoFile {
  name: string;
  path: string;
  sha: string;
}

export async function listPostFiles(): Promise<RepoFile[]> {
  const res = await ghFetch(
    `${API}/contents/${REPO.contentDir}?ref=${REPO.branch}`,
  );
  if (res.status === 404) return [];
  if (!res.ok) await fail(res, "List posts");
  const data = (await res.json()) as Array<RepoFile & { type: string }>;
  return data
    .filter((f) => f.type === "file" && f.name.endsWith(".mdx"))
    .map(({ name, path, sha }) => ({ name, path, sha }));
}

export async function readFile(
  path: string,
): Promise<{ content: string; sha: string } | null> {
  const res = await ghFetch(
    `${API}/contents/${encodeURI(path)}?ref=${REPO.branch}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) await fail(res, "Read file");
  const data = (await res.json()) as { content: string; sha: string };
  return { content: fromB64(data.content), sha: data.sha };
}

export interface WriteResult {
  commitSha: string;
  fileSha: string;
  htmlUrl: string;
}

export async function writeFile(opts: {
  path: string;
  content: string;
  message: string;
  /** Required when replacing an existing file; omit to create. */
  sha?: string;
}): Promise<WriteResult> {
  const res = await ghFetch(`${API}/contents/${encodeURI(opts.path)}`, {
    method: "PUT",
    body: JSON.stringify({
      message: opts.message,
      content: toB64(opts.content),
      branch: REPO.branch,
      ...(opts.sha ? { sha: opts.sha } : {}),
    }),
  });
  if (!res.ok) await fail(res, "Commit");
  const data = (await res.json()) as {
    commit: { sha: string };
    content: { sha: string; html_url: string };
  };
  return {
    commitSha: data.commit.sha,
    fileSha: data.content.sha,
    htmlUrl: data.content.html_url,
  };
}

export async function deleteFile(opts: {
  path: string;
  sha: string;
  message: string;
}): Promise<{ commitSha: string }> {
  const res = await ghFetch(`${API}/contents/${encodeURI(opts.path)}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: opts.message,
      sha: opts.sha,
      branch: REPO.branch,
    }),
  });
  if (!res.ok) await fail(res, "Delete");
  const data = (await res.json()) as { commit: { sha: string } };
  return { commitSha: data.commit.sha };
}
