import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { hasTag, inDateRange, isPublic, loadCorpus, readerToken, scorePost, sortPosts, summarize } from "../corpus";
import { dateRangeField, optionalSessionField, sortField } from "../fields";
import { respond } from "../response";

export default defineTool({
  name: "blog_posts_list",
  title: "List posts",
  description:
    "List posts with optional full-text query, tag filter (post must carry ALL tags), date range, sorting, and limit/offset pagination. Published posts need no session; drafts and scheduled posts require session_token.",
  inputSchema: {
    session_token: optionalSessionField,
    include_drafts: z.boolean().optional().describe("Include drafts and scheduled posts. Defaults to true with a session, false without."),
    query: z.string().optional().describe("Case-insensitive search across title, description, tags, and body."),
    tags: z.array(z.string()).optional().describe("Return only posts carrying every listed tag."),
    dateRange: dateRangeField,
    sort: sortField,
    limit: z.number().int().min(1).max(200).optional().describe("Page size, 1-200. Defaults to 100."),
    offset: z.number().int().min(0).optional().describe("Number of results to skip. Defaults to 0."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (input) =>
    respond("blog_posts_list", async () => {
      const token = await readerToken(input.session_token, input.include_drafts === true);
      const includeDrafts = input.include_drafts ?? Boolean(token);
      const all = await loadCorpus(token);
      const filtered = all
        .filter((p) => includeDrafts || isPublic(p))
        .filter((p) => (input.tags ?? []).every((t) => hasTag(p, t)))
        .filter((p) => inDateRange(p.date, input.dateRange))
        .filter((p) => !input.query || scorePost(p, input.query) !== null);
      const sorted = sortPosts(filtered, input.sort);
      const offset = input.offset ?? 0;
      const page = sorted.slice(offset, offset + (input.limit ?? 100)).map(summarize);
      return {
        data: {
          posts: page,
          total: sorted.length,
          returned: page.length,
          hasMore: offset + page.length < sorted.length,
          filters_applied: {
            include_drafts: includeDrafts,
            query: input.query ?? null,
            tags: input.tags ?? [],
            dateRange: input.dateRange ?? null,
            sort: input.sort ?? "date-desc",
            limit: input.limit ?? 100,
            offset,
          },
        },
        userMessage: `Found ${sorted.length} post${sorted.length === 1 ? "" : "s"}.`,
        nextSteps: ["blog_posts_read"],
      };
    }),
});
