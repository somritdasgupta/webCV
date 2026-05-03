/**
 * Commit a single file (create OR update) to a GitHub repo via the Contents API.
 * Scheduling: we just write the MDX with a future `date` in frontmatter.
 * The blog reader can hide future-dated posts at render time.
 */
import { ADMIN } from "@/site.config";

export interface CommitResult {
  commitSha: string;
  fileSha: string;
  htmlUrl: string;
}

const repoBase = () =>
  `https://api.github.com/repos/${ADMIN.repo.owner}/${ADMIN.repo.name}`;

const encodeContentPath = (path: string) =>
  path.split("/").map(encodeURIComponent).join("/");

export const contentApiUrl = (path: string, branch?: string) => {
  const ref = branch || ADMIN.repo.branch;
  return `${repoBase()}/contents/${encodeContentPath(path)}?ref=${encodeURIComponent(ref)}`;
};

export const contentApiWriteUrl = (path: string) =>
  `${repoBase()}/contents/${encodeContentPath(path)}`;

/** Build headers — token is optional (public repo reads work unauthenticated). */
const headers = (token?: string | null) => {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

/** UTF-8 → base64 (GitHub Contents API requires base64). */
const toB64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
};

async function getExistingSha(
  token: string,
  path: string,
  branch: string,
): Promise<string | null> {
  const res = await fetch(
    contentApiUrl(path, branch),
    { headers: headers(token) },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
  const data = await res.json();
  return data.sha as string;
}

export async function commitFile(opts: {
  token: string;
  path: string; // e.g. "content/blog/my-post.mdx"
  content: string; // raw file contents
  message: string;
  branch?: string;
}): Promise<CommitResult> {
  const branch = opts.branch || ADMIN.repo.branch;
  const sha = await getExistingSha(opts.token, opts.path, branch);
  const res = await fetch(
    contentApiWriteUrl(opts.path),
    {
      method: "PUT",
      headers: headers(opts.token),
      body: JSON.stringify({
        message: opts.message,
        content: toB64(opts.content),
        branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Commit failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return {
    commitSha: data.commit.sha,
    fileSha: data.content.sha,
    htmlUrl: data.content.html_url,
  };
}

/**
 * List all .mdx files in the configured contentDir.
 * Token is OPTIONAL — public repo reads work unauthenticated (60 req/h per IP).
 */
export async function listPosts(
  token?: string | null,
): Promise<Array<{ name: string; path: string; sha: string }>> {
  const res = await fetch(
    contentApiUrl(ADMIN.repo.contentDir, ADMIN.repo.branch),
    { headers: headers(token) },
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const data = (await res.json()) as Array<{ name: string; path: string; sha: string; type: string }>;
  return data.filter((f) => f.type === "file" && f.name.endsWith(".mdx"));
}

export async function readPost(
  token: string | null | undefined,
  path: string,
): Promise<{ content: string; sha: string }> {
  const res = await fetch(
    contentApiUrl(path, ADMIN.repo.branch),
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error(`Read failed: ${res.status}`);
  const data = await res.json();
  // base64 → utf-8
  const bin = atob((data.content as string).replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return { content: new TextDecoder().decode(bytes), sha: data.sha };
}
