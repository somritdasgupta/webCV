import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const REPO = "somritdasgupta/webCV";
const DIR = "content/blog";

type GhFile = { name: string; download_url: string | null; type: string };

function parseFrontmatter(src: string): Record<string, string> {
  const m = src.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    out[kv[1]] = kv[2].replace(/^["']|["']$/g, "").trim();
  }
  return out;
}

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "Return published blog posts from somritdasgupta.in with slug, title, date, description, and tags. Drafts and future-dated posts are excluded.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Maximum number of posts to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const listRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${DIR}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!listRes.ok) {
      return {
        content: [{ type: "text", text: `GitHub API error: ${listRes.status}` }],
        isError: true,
      };
    }
    const files = (await listRes.json()) as GhFile[];
    const mdx = files.filter((f) => f.type === "file" && f.name.endsWith(".mdx"));

    const posts = await Promise.all(
      mdx.map(async (f) => {
        if (!f.download_url) return null;
        const raw = await fetch(f.download_url).then((r) => (r.ok ? r.text() : ""));
        const fm = parseFrontmatter(raw);
        if (fm.draft === "true") return null;
        const date = fm.date || "";
        if (date && new Date(date).getTime() > Date.now()) return null;
        return {
          slug: f.name.replace(/\.mdx$/, "").toLowerCase(),
          title: fm.title || f.name,
          date,
          description: fm.description || "",
          tags: fm.tags || "",
          url: `https://somritdasgupta.in/blog/${f.name.replace(/\.mdx$/, "").toLowerCase()}`,
        };
      }),
    );

    const filtered = posts
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, limit ?? 20);

    return {
      content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
      structuredContent: { posts: filtered },
    };
  },
});
