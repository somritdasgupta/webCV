import { defineTool } from "@lovable.dev/mcp-js";
import { guarded, errorResult } from "../guard";
import { listPostFiles, readFile } from "../github";
import { parseFrontmatter } from "../mdx";

export default defineTool({
  name: "list_all_posts",
  title: "List all posts (including drafts)",
  description:
    "List every MDX post in the content repository, including drafts and future-dated (scheduled) posts that the public site hides. Requires admin sign-in.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_input, ctx) => {
    const result = await guarded(ctx, async () => {
      const files = await listPostFiles();
      const posts = await Promise.all(
        files.map(async (f) => {
          const file = await readFile(f.path);
          const { data } = parseFrontmatter(file?.content ?? "");
          const slug = f.name.replace(/\.mdx$/, "");
          const date = String(data.date ?? "");
          return {
            slug,
            path: f.path,
            sha: f.sha,
            title: String(data.title ?? slug),
            description: String(data.description ?? ""),
            date,
            tags: Array.isArray(data.tags) ? data.tags : [],
            draft: data.draft === true,
            scheduled: Boolean(date) && new Date(date).getTime() > Date.now(),
          };
        }),
      );
      posts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      return posts;
    });

    if (!result.ok) return errorResult(result.message);
    return {
      content: [{ type: "text", text: JSON.stringify(result.value, null, 2) }],
      structuredContent: { posts: result.value },
    };
  },
});
