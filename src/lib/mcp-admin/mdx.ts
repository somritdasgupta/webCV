/**
 * Frontmatter serialization for MDX posts.
 *
 * Mirrors the shape the site's MDX loader (`src/lib/posts.ts`) expects and the
 * rules the browser editor enforces, notably the blank line after the closing
 * `---` that MDX requires before any export or JSX.
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

const quote = (s: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

export function buildMdx(fm: Frontmatter, body: string): string {
  const lines = [
    "---",
    `title: ${quote(fm.title)}`,
    `description: ${quote(fm.description)}`,
    `date: ${quote(fm.date)}`,
  ];
  if (fm.tags?.length) lines.push(`tags: [${fm.tags.map(quote).join(", ")}]`);
  if (fm.cover) lines.push(`cover: ${quote(fm.cover)}`);
  if (typeof fm.readingTime === "number") lines.push(`readingTime: ${fm.readingTime}`);
  if (fm.draft) lines.push("draft: true");
  lines.push("---", "");
  return `${lines.join("\n")}\n${body.replace(/^\n+/, "").trimEnd()}\n`;
}

/** Minimal YAML-ish reader — matches the subset `buildMdx` emits. */
export function parseFrontmatter(src: string): {
  data: Record<string, unknown>;
  body: string;
} {
  const match = src.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: src };
  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    const value = rawValue.trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: src.slice(match[0].length) };
}

/** Estimate reading time from the MDX body (prose words, JSX stripped). */
export function estimateReadingTime(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
