import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { hasTag, isPublic, loadCorpus, readerToken, sortPosts, tagFrequency } from "../corpus";
import { optionalSessionField } from "../fields";
import { respond } from "../response";

export default defineTool({
  name: "blog_posts_by_tag",
  title: "Posts by tag",
  description: "Return every post carrying a tag (case-insensitive) plus the five most common co-occurring tags.",
  inputSchema: {
    tag: z.string().min(1).describe("Tag to look up. Example: \"ai\"."),
    options: z
      .object({
        include_drafts: z.boolean().optional().describe("Include drafts. Requires session_token. Defaults to false."),
        sort: z.enum(["date-desc", "date-asc", "title"]).optional().describe("Defaults to date-desc."),
        limit: z.number().int().min(1).max(200).optional().describe("Defaults to 100."),
      })
      .optional(),
    session_token: optionalSessionField,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ tag, options, session_token }) =>
    respond("blog_posts_by_tag", async () => {
      const token = await readerToken(session_token, options?.include_drafts === true);
      const matches = (await loadCorpus(token))
        .filter((p) => options?.include_drafts === true || isPublic(p))
        .filter((p) => hasTag(p, tag));
      const freq = tagFrequency(matches);
      const related = Object.entries(freq)
        .filter(([t]) => t.toLowerCase() !== tag.toLowerCase())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([t]) => t);
      const posts = sortPosts(matches, options?.sort)
        .slice(0, options?.limit ?? 100)
        .map((p) => ({ slug: p.slug, title: p.title, description: p.description, date: p.date, readingTime: p.readingTime, tags: p.tags, draft: p.draft }));
      return {
        data: { tag, posts, count: matches.length, related_tags: related },
        userMessage: `${matches.length} post${matches.length === 1 ? "" : "s"} tagged "${tag}".`,
        nextSteps: related.length ? ["blog_posts_by_tag with a related tag"] : [],
      };
    }),
});
