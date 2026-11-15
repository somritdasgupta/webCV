import { defineTool } from "@lovable.dev/mcp-js";
import { daysBetween, loadCorpus } from "../corpus";
import { sessionTokenField } from "../fields";
import { todayDateOnly } from "../mdx";
import { ownerOperation } from "../response";

export default defineTool({
  name: "blog_posts_get_draft_count",
  title: "Unpublished posts",
  description:
    "Count drafts and scheduled posts (not drafted, dated in the future) and list them. created_at is the post date; the repository does not track a separate creation time. Requires session_token.",
  inputSchema: { session_token: sessionTokenField },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token }) =>
    ownerOperation("blog_posts_get_draft_count", session_token, async (owner) => {
      const posts = await loadCorpus(owner.token);
      const today = todayDateOnly();
      const unpublished = posts.filter((p) => p.draft || p.scheduled);
      const drafts = posts.filter((p) => p.draft);
      const oldest = drafts.map((p) => p.date).filter(Boolean).sort()[0];
      return {
        data: {
          draft_count: drafts.length,
          scheduled_count: posts.filter((p) => p.scheduled).length,
          total_unpublished: unpublished.length,
          drafts: unpublished.map((p) => ({ slug: p.slug, title: p.title, status: p.draft ? "draft" : "scheduled", created_at: p.date })),
          oldest_draft_age_days: oldest ? Math.max(0, daysBetween(oldest, today)) : 0,
        },
        userMessage: `${drafts.length} draft${drafts.length === 1 ? "" : "s"} and ${unpublished.length - drafts.length} scheduled.`,
      };
    }),
});
