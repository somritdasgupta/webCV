import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { OperationError } from "../errors";
import {
  bodyField,
  coverField,
  dateField,
  descriptionField,
  draftField,
  expectedShaField,
  sessionTokenField,
  slugField,
  tagsField,
  titleField,
} from "../fields";
import { pathForSlug, readFile, writeFile } from "../github";
import { buildMdx, estimateReadingTime, parseFrontmatter } from "../mdx";
import { ownerOperation } from "../response";
import { assertValid, normalizeSlug } from "../validation";

const optional = <T extends z.ZodTypeAny>(schema: T) => schema.optional();

export default defineTool({
  name: "blog_posts_update",
  title: "Update a post",
  description:
    "Update an existing post. Only the supplied fields change. Read the post first and pass expected_sha so a concurrent edit is never overwritten.",
  inputSchema: {
    session_token: sessionTokenField,
    slug: slugField,
    title: optional(titleField),
    description: optional(descriptionField),
    body: optional(bodyField),
    date: dateField,
    tags: tagsField,
    cover: coverField,
    draft: draftField,
    expected_sha: expectedShaField,
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async (input) =>
    ownerOperation("blog_posts_update", input.session_token, async (owner) => {
      assertValid(input, { requireAll: false });
      const slug = normalizeSlug(input.slug);
      const path = pathForSlug(slug);

      const current = await readFile(owner.token, path);
      if (!current) {
        throw new OperationError("POST_NOT_FOUND", `No post exists with slug "${slug}".`, {
          field: "slug",
          guidance: "Call blog_posts_list to see the available slugs, or blog_posts_create to add a new post.",
          nextSteps: ["blog_posts_list", "blog_posts_create"],
        });
      }
      if (input.expected_sha && input.expected_sha !== current.sha) {
        throw new OperationError("CONFLICT", "The post changed since it was read.", {
          field: "expected_sha",
          guidance: "Call blog_posts_read again, reapply the edit to the fresh content, then retry with the new sha.",
          nextSteps: ["blog_posts_read"],
        });
      }

      const { data, body } = parseFrontmatter(current.content);
      const nextBody = input.body ?? body;
      const source = buildMdx(
        {
          title: input.title ?? String(data.title ?? slug),
          description: input.description ?? String(data.description ?? ""),
          date: input.date ? new Date(input.date).toISOString() : String(data.date ?? new Date().toISOString()),
          tags: input.tags ?? (Array.isArray(data.tags) ? (data.tags as string[]) : undefined),
          cover: input.cover ?? (data.cover ? String(data.cover) : undefined),
          draft: input.draft ?? data.draft === true,
          readingTime: estimateReadingTime(nextBody),
        },
        nextBody,
      );

      const commit = await writeFile({
        token: owner.token,
        path,
        content: source,
        message: `content: update ${slug}`,
        sha: current.sha,
      });

      return {
        data: {
          updated: true,
          verified: Boolean(await readFile(owner.token, path)),
          slug,
          commit_sha: commit.commitSha,
          sha: commit.fileSha,
          url: `https://somritdasgupta.in/blog/${slug}`,
          commit_url: commit.htmlUrl,
        },
        userMessage: `Updated the post "${input.title ?? data.title ?? slug}".`,
        nextSteps: ["blog_posts_read"],
      };
    }),
});
