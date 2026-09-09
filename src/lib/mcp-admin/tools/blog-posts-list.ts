import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listPostFiles, readFile } from "../github";
import { parseFrontmatter } from "../mdx";
import { ownerOperation } from "../response";
import { sessionTokenField } from "../fields";

export default defineTool({
  name: "blog_posts_list",
  title: "List posts",
  description:
    "List every post in the repository, including drafts and scheduled posts, with slug, title, date, tags, draft flag, and blob sha.",
  inputSchema: {
    session_token: sessionTokenField,
    include_drafts: z
      .boolean()
      .optional()
      .describe("Include draft posts in the result. Defaults to true."),
    query: z
      .string()
      .optional()
      .describe("Case-insensitive filter applied to slug, title, description, and tags."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, include_drafts, query }) =>
    ownerOperation("blog_posts_list", session_token, async (owner) => {
      const files = await listPostFiles(owner.token);
      const posts = await Promise.all(
        files.map(async (file) => {
          const slug = file.name.replace(/\.mdx$/, "");
          const source = await readFile(owner.token, file.path);
          const { data } = parseFrontmatter(source?.content ?? "");
          return {
            slug,
            title: String(data.title ?? slug),
            description: String(data.description ?? ""),
            date: String(data.date ?? ""),
            tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
            draft: data.draft === true,
            sha: source?.sha ?? file.sha,
            url: `https://somritdasgupta.in/blog/${slug}`,
          };
        }),
      );

      const needle = query?.trim().toLowerCase();
      const filtered = posts
        .filter((post) => (include_drafts === false ? !post.draft : true))
        .filter((post) =>
          needle
            ? [post.slug, post.title, post.description, post.tags.join(" ")]
                .join(" ")
                .toLowerCase()
                .includes(needle)
            : true,
        )
        .sort((a, b) => (a.date < b.date ? 1 : -1));

      return {
        data: { count: filtered.length, posts: filtered },
        userMessage: `Found ${filtered.length} post${filtered.length === 1 ? "" : "s"}.`,
        nextSteps: ["blog_posts_read"],
      };
    }),
});
