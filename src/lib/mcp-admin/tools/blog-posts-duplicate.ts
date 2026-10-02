import { defineTool } from "@lovable.dev/mcp-js";
import { rebuild } from "../bulk";
import { loadPost } from "../corpus";
import { OperationError } from "../errors";
import { sessionTokenField, slugField } from "../fields";
import { pathForSlug, readFile, writeFile } from "../github";
import { todayDateOnly } from "../mdx";
import { ownerOperation } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_duplicate",
  title: "Duplicate a post",
  description: "Copy a post to a new slug as a draft dated today, keeping title, description, tags, cover, and body.",
  inputSchema: { session_token: sessionTokenField, slug: slugField, new_slug: slugField },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ session_token, slug, new_slug }) =>
    ownerOperation("blog_posts_duplicate", session_token, async (owner) => {
      const source = await loadPost(owner.token, normalizeSlug(slug));
      const target = normalizeSlug(new_slug);
      if (await readFile(owner.token, pathForSlug(target))) {
        throw new OperationError("SLUG_EXISTS", `A post already exists at "${target}".`, {
          field: "new_slug",
          guidance: "Choose another new_slug or call blog_posts_suggest_slug.",
        });
      }
      const today = todayDateOnly();
      const commit = await writeFile({
        token: owner.token,
        path: pathForSlug(target),
        content: rebuild(source, { draft: true, date: today }),
        message: `content: duplicate ${source.slug} as ${target}`,
      });
      return {
        data: { original_slug: source.slug, new_slug: target, draft: true, created_at: today, commit_sha: commit.commitSha, message: "Post duplicated as draft. Edit and publish when ready." },
        userMessage: `Duplicated "${source.title}" as a draft at ${target}.`,
        nextSteps: ["blog_posts_update"],
      };
    }),
});
