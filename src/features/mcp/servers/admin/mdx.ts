/**
 * Post metadata serialization for MDX files.
 *
 * Posts carry metadata as a JavaScript export, matching the hand-written posts
 * in `content/blog` and the `frontmatter` export read by `src/lib/posts.ts`:
 *
 *   export const frontmatter = {
 *     title: "...",
 *     date: "YYYY-MM-DD",
 *   };
 *
 * Legacy YAML fences are still parsed so older files remain readable, but
 * every write emits the export form.
 */

export interface Frontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  cover?: string;
  draft?: boolean;
  readingTime?: number;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Reduce any supported date input to `YYYY-MM-DD`, or return null when the
 * value is not a real calendar date. A leading date part is kept verbatim so
 * `2026-09-10T23:30:00-05:00` stays on the 10th instead of shifting by zone.
 */
export function toDateOnly(input: string): string | null {
  const value = String(input ?? "").trim();
  const match = value.match(DATE_ONLY);
  if (match) {
    const [, y, m, d] = match;
    const probe = new Date(Date.UTC(+y, +m - 1, +d));
    const valid = probe.getUTCFullYear() === +y && probe.getUTCMonth() === +m - 1 && probe.getUTCDate() === +d;
    return valid ? `${y}-${m}-${d}` : null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const quote = (s: string) => JSON.stringify(s);

export function buildMdx(fm: Frontmatter, body: string): string {
  const lines = [
    "export const frontmatter = {",
    `  title: ${quote(fm.title)},`,
    `  description: ${quote(fm.description)},`,
    `  date: ${quote(toDateOnly(fm.date) ?? todayDateOnly())},`,
  ];
  if (fm.tags?.length) lines.push(`  tags: [${fm.tags.map(quote).join(", ")}],`);
  if (fm.cover) lines.push(`  cover: ${quote(fm.cover)},`);
  if (fm.draft) lines.push("  draft: true,");
  if (typeof fm.readingTime === "number") lines.push(`  readingTime: ${fm.readingTime},`);
  lines.push("};", "");
  // MDX requires a blank line between the export block and the body.
  return `${lines.join("\n")}\n${body.replace(/^\n+/, "").trimEnd()}\n`;
}

const EXPORT_RE = /^\s*export\s+const\s+frontmatter\s*=\s*\{([\s\S]*?)\n\}\s*;?[ \t]*\n?/;
const YAML_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const STRING_RE = /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/;

function parseString(literal: string): string {
  if (literal.startsWith('"')) {
    try {
      return JSON.parse(literal) as string;
    } catch {
      /* fall through */
    }
  }
  return literal.slice(1, -1).replace(/\\(['"\\])/g, "$1");
}

function parseScalar(raw: string): unknown {
  const value = raw.trim().replace(/,$/, "").trim();
  const str = value.match(STRING_RE);
  if (str) return parseString(str[1]);
  if (value.startsWith("[")) {
    const items = value.slice(1, value.lastIndexOf("]")).match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,\s][^,]*/g) ?? [];
    return items.map((item) => (STRING_RE.test(item.trim()) ? parseString(item.trim()) : item.trim())).filter(Boolean);
  }
  if (value === "true" || value === "false") return value === "true";
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** Parse `key: value` pairs; values may start on the line after the key. */
function parsePairs(block: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const pattern = /^\s*["']?(\w+)["']?\s*:\s*([\s\S]*?)(?=^\s*["']?\w+["']?\s*:|(?![\s\S]))/gm;
  for (const [, key, raw] of block.matchAll(pattern)) {
    data[key] = parseScalar(raw.replace(/\s*\n\s*/g, " "));
  }
  return data;
}

export function parseFrontmatter(src: string): { data: Record<string, unknown>; body: string } {
  const text = typeof src === "string" ? src : "";
  const match = text.match(EXPORT_RE) ?? text.match(YAML_RE);
  if (!match) return { data: {}, body: text };
  const data = parsePairs(match[1]);
  if (typeof data.date === "string") data.date = toDateOnly(data.date) ?? data.date;
  return { data, body: text.slice(match[0].length).replace(/^\n+/, "") };
}

/** Prose only: code fences, JSX, imports, and markdown syntax removed. */
export function stripMdx(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*(import|export)\s.*$/gm, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#>*_`~\[\]()|-]/g, " ");
}

export const countWords = (body: string) => stripMdx(body).split(/\s+/).filter(Boolean).length;

/** Reading time at 220 words per minute, minimum one minute. */
export const estimateReadingTime = (body: string) => Math.max(1, Math.round(countWords(body) / 220));
