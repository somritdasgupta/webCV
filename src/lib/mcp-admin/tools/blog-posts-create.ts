import { defineTool } from "@lovable.dev/mcp-js";
import { OperationError } from "../errors";
import { postContentShape, sessionTokenField } from "../fields";
import { pathForSlug, readFile, writeFile } from "../github";
import { buildMdx, estimateReadingTime } from "../mdx";
import { ownerOperation } from "../response";
import { assertValid, normalizeSlug, slugCandidates } from "../validation";

export default defineTool({
  name: "blog_posts_create",
  title: "Create a post",
  description:
    "Validate and publish a new post as an MDX commit. Fails if the slug already exists. Report success only when published is true and a commit_sha is returned.",
  inputSchema: { session_token: sessionTokenField, ...postContentShape },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async (input) =>
    ownerOperation("blog_posts_create", input.session_token, async (owner) => {
      assertValid(input, { requireAll: true });
      const slug = normalizeSlug(input.slug);
      const path = pathForSlug(slug);

      if (await readFile(owner.token, path)) {
        throw new OperationError("SLUG_EXISTS", `A post already exists at "${slug}".`, {
          field: "slug",
          guidance: `Choose a different slug, for example ${slugCandidates(input.title).slice(1, 3).join(" or ")}, or call blog_posts_update to edit the existing post.`,
          nextSteps: ["blog_posts_update"],
        });
      }

      const date = input.date ? new Date(input.date).toISOString() : new Date().toISOString();
      const source = buildMdx(
        {
          title: input.title,
          description: input.description,
          date,
          tags: input.tags,
          cover: input.cover,
          draft: input.draft,
          readingTime: estimateReadingTime(input.body),
        },
        input.body,
      );

      const commit = await writeFile({
        token: owner.token,
        path,
        content: source,
        message: `content: add ${slug}`,
      });

      const verified = Boolean(await readFile(owner.token, path));
      if (!verified) {
        throw new OperationError("COMMIT_FAILED", "The commit was accepted but the file could not be read back.", {
          guidance: "Call blog_posts_read with the same slug to confirm the current state before retrying.",
          nextSteps: ["blog_posts_read"],
        });
      }

      const scheduled = new Date(date).getTime() > Date.now();
      return {
        data: {
          published: true,
          verified: true,
          slug,
          path,
          draft: input.draft === true,
          scheduled,
          date,
          commit_sha: commit.commitSha,
          sha: commit.fileSha,
          url: `https://somritdasgupta.in/blog/${slug}`,
          commit_url: commit.htmlUrl,
        },
        userMessage: input.draft
          ? `Saved "${input.title}" as a draft. It stays hidden until the draft flag is removed.`
          : scheduled
            ? `Scheduled "${input.title}" for ${date}.`
            : `Published "${input.title}" at https://somritdasgupta.in/blog/${slug}.`,
        nextSteps: ["blog_posts_read"],
      };
    }),
});
