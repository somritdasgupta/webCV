import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { parseFrontmatter } from "../../mcp-admin/mdx";

const REPO = "somritdasgupta/webCV";
const DIR = "content/blog";

type GhFile = { name: string; download_url: string | null; type: string };

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
        const fm = parseFrontmatter(raw).data as Record<string, unknown>;
        if (fm.draft === true) return null;
        const date = typeof fm.date === "string" ? fm.date : "";
        if (date && date > new Date().toISOString().slice(0, 10)) return null;
        return {
          slug: f.name.replace(/\.mdx$/, "").toLowerCase(),
          title: String(fm.title ?? f.name),
          date,
          description: String(fm.description ?? ""),
          tags: Array.isArray(fm.tags) ? fm.tags : [],
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
