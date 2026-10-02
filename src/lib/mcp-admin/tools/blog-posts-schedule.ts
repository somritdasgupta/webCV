import { defineTool } from "@lovable.dev/mcp-js";
import { rebuild } from "../bulk";
import { daysBetween, loadPost } from "../corpus";
import { OperationError } from "../errors";
import { dateOnlyField, sessionTokenField, slugField } from "../fields";
import { writeFile } from "../github";
import { toDateOnly, todayDateOnly } from "../mdx";
import { ownerOperation } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_schedule",
  title: "Schedule a post",
  description: "Set a future publish date (YYYY-MM-DD) and clear the draft flag. The site shows the post automatically from that date.",
  inputSchema: { session_token: sessionTokenField, slug: slugField, publish_at: dateOnlyField },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, slug, publish_at }) =>
    ownerOperation("blog_posts_schedule", session_token, async (owner) => {
      const date = toDateOnly(publish_at);
      const today = todayDateOnly();
      if (!date || date <= today) {
        throw new OperationError("INVALID_DATE", `publish_at must be a valid date after ${today}.`, {
          field: "publish_at",
          guidance: "Supply a future date in YYYY-MM-DD format, or use blog_posts_update to publish now.",
        });
      }
      const post = await loadPost(owner.token, normalizeSlug(slug));
      const commit = await writeFile({
        token: owner.token,
        path: post.path,
        content: rebuild(post, { date, draft: false }),
        message: `content: schedule ${post.slug} for ${date}`,
        sha: post.sha,
      });
      return {
        data: { slug: post.slug, scheduled: true, publishes_at: date, days_until_publish: daysBetween(today, date), current_draft_status: false, commit_sha: commit.commitSha, message: `Post scheduled for publication on ${date}` },
        userMessage: `"${post.title}" will publish on ${date}.`,
      };
    }),
});
