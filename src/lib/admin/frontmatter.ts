/** Tiny MDX metadata parser/builder. Supports both old `export const frontmatter` posts and YAML fences. */
export interface Frontmatter {
  title: string;
  description: string;
  date: string; // ISO
  tags?: string[];
  cover?: string;
  draft?: boolean;
  readingTime?: number;
}

export interface Parsed {
  data: Partial<Frontmatter>;
  body: string;
}

const FM_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const EXPORT_FM_RE = /^export\s+const\s+frontmatter\s*=\s*(\{[\s\S]*?\n\})\s*;?\s*\n?/;

const parseValue = (raw: string): unknown => {
  let val = raw.trim().replace(/,$/, "").trim();
  if (val.startsWith("[") && val.endsWith("]")) {
    return val
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }
  if (val === "true" || val === "false") return val === "true";
  if (/^-?\d+(\.\d+)?$/.test(val)) return Number(val);
  return val.replace(/^['"]|['"]$/g, "");
};

const parseObjectLiteral = (src: string): Partial<Frontmatter> => {
  try {
    const data = Function(`"use strict"; return (${src});`)();
    if (data && typeof data === "object") return data as Partial<Frontmatter>;
  } catch {
    // Fall back to the tiny parser below for simple one-line metadata.
  }
  const data: Record<string, unknown> = {};
  for (const line of src.replace(/^\{|\}$/g, "").split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().replace(/^['"]|['"]$/g, "");
    if (!key) continue;
    data[key] = parseValue(line.slice(idx + 1));
  }
  return data as Partial<Frontmatter>;
};

export function parseFrontmatter(raw: string): Parsed {
  // Defensive: callers sometimes pass undefined / non-string GitHub payloads.
  const text = typeof raw === "string" ? raw : "";
  const exported = text.match(EXPORT_FM_RE);
  if (exported) return { data: parseObjectLiteral(exported[1]), body: text.slice(exported[0].length) };
  const m = text.match(FM_RE);
  if (!m) return { data: {}, body: text };
  const data: Record<string, unknown> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: string = line.slice(idx + 1).trim();
    if (!key) continue;
    data[key] = parseValue(val);
  }
  return { data: data as Partial<Frontmatter>, body: text.slice(m[0].length) };
}

export function buildMdx(fm: Frontmatter, body: string): string {
  const lines = ["export const frontmatter = {"];
  lines.push(`  title: "${escape(fm.title)}",`);
  lines.push(`  description: "${escape(fm.description)}",`);
  lines.push(`  date: "${fm.date}",`);
  if (fm.tags && fm.tags.length)
    lines.push(`  tags: [${fm.tags.map((t) => `"${escape(t)}"`).join(", ")}],`);
  if (fm.cover) lines.push(`  cover: "${escape(fm.cover)}",`);
  if (fm.draft) lines.push(`  draft: true,`);
  if (fm.readingTime) lines.push(`  readingTime: ${fm.readingTime},`);
  lines.push("};", "");
  return lines.join("\n") + body.trimStart() + (body.endsWith("\n") ? "" : "\n");
}

const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
