import { OperationError } from "./errors";
import { listPostFiles, pathForSlug, readFile, readRaw } from "./github";
import { countWords, estimateReadingTime, parseFrontmatter, stripMdx, todayDateOnly } from "./mdx";
import { requireOwner } from "./response";

/**
 * Loaded view of every post in the repository.
 *
 * Analytics, search, and bulk tools all read through here so that metadata is
 * parsed and dates normalized in exactly one place.
 */
export interface PostRecord {
  slug: string;
  path: string;
  sha: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  draft: boolean;
  scheduled: boolean;
  readingTime: number;
  wordCount: number;
  body: string;
  source: string;
  url: string;
}

export const SITE = "https://somritdasgupta.in";

export function toRecord(slug: string, path: string, sha: string, source: string): PostRecord {
  const { data, body } = parseFrontmatter(source);
  const date = typeof data.date === "string" ? data.date : "";
  return {
    slug,
    path,
    sha,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    draft: data.draft === true,
    scheduled: data.draft !== true && date > todayDateOnly(),
    readingTime: typeof data.readingTime === "number" ? data.readingTime : estimateReadingTime(body),
    wordCount: countWords(body),
    body,
    source,
    url: `${SITE}/blog/${slug}`,
  };
}

/** Load every post. With a token the API is used (fresh, includes sha); without, the public CDN. */
export async function loadCorpus(token?: string): Promise<PostRecord[]> {
  const files = await listPostFiles(token);
  const records = await Promise.all(
    files.map(async (file) => {
      const slug = file.name.replace(/\.mdx$/, "");
      const source = token ? (await readFile(token, file.path))?.content : await readRaw(file.path);
      return source === null || source === undefined ? null : toRecord(slug, file.path, file.sha, source);
    }),
  );
  return records.filter((r): r is PostRecord => r !== null);
}

export async function loadPost(token: string | undefined, slug: string): Promise<PostRecord> {
  const path = pathForSlug(slug);
  const file = token ? await readFile(token, path) : null;
  const source = token ? file?.content : await readRaw(path);
  if (!source) {
    throw new OperationError("POST_NOT_FOUND", `No post exists with slug "${slug}".`, {
      field: "slug",
      guidance: "Call blog_posts_list or blog_posts_search to find the correct slug.",
      nextSteps: ["blog_posts_list"],
    });
  }
  return toRecord(slug, path, file?.sha ?? "", source);
}

/**
 * Read tools are public for published content. A session is required only
 * when the caller asks for drafts; a supplied session is always verified.
 */
export async function readerToken(sessionToken: string | undefined, wantsDrafts: boolean): Promise<string | undefined> {
  if (sessionToken?.trim()) return (await requireOwner(sessionToken)).token;
  if (wantsDrafts) await requireOwner("");
  return undefined;
}

export const isPublic = (p: PostRecord) => !p.draft && !p.scheduled;

/** Metadata without body or source, the default shape for list-style results. */
export const summarize = (p: PostRecord) => ({
  slug: p.slug,
  title: p.title,
  description: p.description,
  date: p.date,
  tags: p.tags,
  readingTime: p.readingTime,
  draft: p.draft,
  scheduled: p.scheduled,
  sha: p.sha,
  url: p.url,
});

export type MatchType = "title" | "description" | "tag" | "body";

/** Relevance 0-100: exact > prefix > substring, weighted by field. */
export function scorePost(p: PostRecord, query: string): { score: number; matchType: MatchType } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const grade = (text: string) => {
    const t = text.toLowerCase();
    if (t === q) return 1;
    if (t.startsWith(q) || t.split(/\s+/).some((w) => w.startsWith(q))) return 0.75;
    return t.includes(q) ? 0.5 : 0;
  };
  const candidates: Array<[MatchType, number]> = [
    ["title", grade(p.title) * 100],
    ["tag", Math.max(0, ...p.tags.map(grade)) * 90],
    ["description", grade(p.description) * 70],
    ["body", grade(stripMdx(p.body)) * 50],
  ];
  const [matchType, score] = candidates.sort((a, b) => b[1] - a[1])[0];
  return score > 0 ? { matchType, score: Math.round(score) } : null;
}

export type SortKey = "date-desc" | "date-asc" | "title" | "reading-time";

export function sortPosts<T extends { date: string; title: string; readingTime: number }>(posts: T[], sort: SortKey = "date-desc"): T[] {
  const copy = [...posts];
  const compare: Record<SortKey, (a: T, b: T) => number> = {
    "date-desc": (a, b) => b.date.localeCompare(a.date),
    "date-asc": (a, b) => a.date.localeCompare(b.date),
    title: (a, b) => a.title.localeCompare(b.title),
    "reading-time": (a, b) => b.readingTime - a.readingTime,
  };
  return copy.sort(compare[sort]);
}

export const inDateRange = (date: string, range?: { from?: string; to?: string }) =>
  (!range?.from || date >= range.from) && (!range?.to || date <= range.to);

export const hasTag = (p: PostRecord, tag: string) => p.tags.some((t) => t.toLowerCase() === tag.toLowerCase());

export function tagFrequency(posts: PostRecord[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const p of posts) for (const t of p.tags) freq[t] = (freq[t] ?? 0) + 1;
  return freq;
}

export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
