import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isPublic, loadCorpus, readerToken } from "../corpus";
import { OperationError } from "../errors";
import { optionalSessionField, slugField } from "../fields";
import { respond } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_related",
  title: "Related posts",
  description: "Published posts sharing tags with the given post, ranked by number of shared tags, then recency.",
  inputSchema: {
    slug: slugField,
    limit: z.number().int().min(1).max(10).optional().describe("1-10. Defaults to 5."),
    session_token: optionalSessionField,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ slug, limit, session_token }) =>
    respond("blog_posts_related", async () => {
      const safe = normalizeSlug(slug);
      const posts = await loadCorpus(await readerToken(session_token, false));
      const source = posts.find((p) => p.slug === safe);
      if (!source) {
        throw new OperationError("POST_NOT_FOUND", `No post exists with slug "${safe}".`, {
          field: "slug",
          guidance: "Call blog_posts_search to find the correct slug.",
        });
      }
      const own = new Set(source.tags.map((t) => t.toLowerCase()));
      const related = posts
        .filter((p) => p.slug !== safe && isPublic(p))
        .map((p) => ({ p, common: p.tags.filter((t) => own.has(t.toLowerCase())) }))
        .filter((r) => r.common.length > 0)
        .sort((a, b) => b.common.length - a.common.length || b.p.date.localeCompare(a.p.date));
      return {
        data: {
          slug: safe,
          related: related.slice(0, limit ?? 5).map(({ p, common }) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            tags: p.tags,
            commonTags: common,
            commonTagCount: common.length,
          })),
          total: related.length,
        },
      };
    }),
});
