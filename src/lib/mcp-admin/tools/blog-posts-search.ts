import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { hasTag, inDateRange, isPublic, loadCorpus, readerToken, scorePost } from "../corpus";
import { dateRangeField, optionalSessionField } from "../fields";
import { respond } from "../response";

export default defineTool({
  name: "blog_posts_search",
  title: "Search posts",
  description:
    "Full-text search across title, description, tags, and body (MDX markup stripped). Results are ranked 0-100: exact over prefix over substring, title over tag over description over body. Drafts require session_token.",
  inputSchema: {
    query: z.string().min(1).describe("Search term. Case-insensitive."),
    filters: z
      .object({
        tags: z.array(z.string()).optional().describe("Keep posts carrying ANY of these tags."),
        draft: z.boolean().optional().describe("Include drafts and scheduled posts. Requires session_token."),
        dateRange: dateRangeField,
      })
      .optional(),
    limit: z.number().int().min(1).max(200).optional().describe("Maximum results, up to 200. Defaults to 50."),
    session_token: optionalSessionField,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, filters, limit, session_token }) =>
    respond("blog_posts_search", async () => {
      const token = await readerToken(session_token, filters?.draft === true);
      const posts = await loadCorpus(token);
      const results = posts
        .filter((p) => filters?.draft === true || isPublic(p))
        .filter((p) => !filters?.tags?.length || filters.tags.some((t) => hasTag(p, t)))
        .filter((p) => inDateRange(p.date, filters?.dateRange))
        .map((p) => ({ p, hit: scorePost(p, query) }))
        .filter((r) => r.hit !== null)
        .sort((a, b) => b.hit!.score - a.hit!.score || b.p.date.localeCompare(a.p.date));
      const page = results.slice(0, limit ?? 50).map(({ p, hit }) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        tags: p.tags,
        matchType: hit!.matchType,
        score: hit!.score,
        url: p.url,
      }));
      return {
        data: { results: page, total: results.length, query, filters_applied: filters ?? {} },
        userMessage: `${results.length} post${results.length === 1 ? "" : "s"} matched "${query}".`,
        nextSteps: ["blog_posts_read"],
      };
    }),
});
