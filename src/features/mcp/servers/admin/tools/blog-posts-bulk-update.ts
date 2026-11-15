import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertBatchSize, rebuild } from "../bulk";
import { loadCorpus } from "../corpus";
import { OperationError } from "../errors";
import { coverField, descriptionField, draftField, sessionTokenField, tagsField } from "../fields";
import { commitFiles } from "../github";
import { ownerOperation } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_bulk_update",
  title: "Bulk update posts",
  description:
    "Apply the same metadata change (tags replace, description, draft, cover) to 1-100 posts in ONE commit. All slugs are checked first; if any is missing nothing is written.",
  inputSchema: {
    session_token: sessionTokenField,
    slugs: z.array(z.string().min(1)).min(1).max(100).describe("Slugs to update, 1-100."),
    updates: z
      .object({ tags: tagsField, description: descriptionField.optional(), draft: draftField, cover: coverField })
      .describe("Fields to set on every listed post. At least one is required."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, slugs, updates }) =>
    ownerOperation("blog_posts_bulk_update", session_token, async (owner) => {
      assertBatchSize(slugs.length, "slugs");
      const fields = Object.entries(updates).filter(([, v]) => v !== undefined);
      if (!fields.length) {
        throw new OperationError("VALIDATION_ERROR", "No update fields were supplied.", {
          field: "updates",
          guidance: "Provide at least one of tags, description, draft, or cover.",
        });
      }
      const wanted = [...new Set(slugs.map(normalizeSlug))];
      const bySlug = new Map((await loadCorpus(owner.token)).map((p) => [p.slug, p]));
      const failed = wanted.filter((s) => !bySlug.has(s)).map((slug) => ({ slug, error: "Post not found.", code: "POST_NOT_FOUND" }));
      if (failed.length) {
        throw new OperationError("POST_NOT_FOUND", `${failed.length} slug(s) do not exist: ${failed.map((f) => f.slug).join(", ")}. Nothing was changed.`, {
          field: "slugs",
          guidance: "Remove or correct the missing slugs and retry. Use blog_posts_list to see valid slugs.",
        });
      }
      const changes = wanted.map((slug) => ({ path: bySlug.get(slug)!.path, content: rebuild(bySlug.get(slug)!, Object.fromEntries(fields)) }));
      const { commitSha } = await commitFiles(owner.token, changes, `content: bulk_update ${wanted.length} posts`);
      return {
        data: { updated: wanted.length, failed: [], commit_sha: commitSha, summary: `Updated ${fields.map(([k]) => k).join(", ")} on ${wanted.length} posts.` },
        userMessage: `Updated ${wanted.length} posts in one commit.`,
      };
    }),
});
