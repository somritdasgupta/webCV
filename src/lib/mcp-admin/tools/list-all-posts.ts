import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { adminTool } from "../guard";
import { listPostFiles, readFile } from "../github";
import { parseFrontmatter } from "../mdx";

export default defineTool({
  name: "list_all_posts",
  title: "List all posts (including drafts)",
  description:
    "List every MDX post in the content repository, including drafts and future-dated (scheduled) posts that the public site hides. Requires admin sign-in.",
  inputSchema: {
    authorization: z.string().min(1).describe("Short-lived handle returned by complete_github_authorization."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: (input) =>
    adminTool(input.authorization, async (admin) => {
      const files = await listPostFiles(admin.token);
      const posts = await Promise.all(
        files.map(async (f) => {
          const file = await readFile(admin.token, f.path);
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
      return { count: posts.length, posts };
    }),
});
