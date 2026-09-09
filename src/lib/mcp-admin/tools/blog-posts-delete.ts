import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { OperationError } from "../errors";
import { expectedShaField, sessionTokenField, slugField } from "../fields";
import { deleteFile, pathForSlug, readFile } from "../github";
import { ownerOperation } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_delete",
  title: "Delete a post",
  description:
    "Permanently remove a post from the repository. Requires explicit confirmation and, when supplied, a matching expected_sha.",
  inputSchema: {
    session_token: sessionTokenField,
    slug: slugField,
    confirm: z
      .literal(true)
      .describe("Must be true. Set it only after the user has explicitly asked for the deletion."),
    expected_sha: expectedShaField,
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ session_token, slug, expected_sha }) =>
    ownerOperation("blog_posts_delete", session_token, async (owner) => {
      const safe = normalizeSlug(slug);
      const path = pathForSlug(safe);
      const current = await readFile(owner.token, path);
      if (!current) {
        throw new OperationError("POST_NOT_FOUND", `No post exists with slug "${safe}".`, {
          field: "slug",
          guidance: "Call blog_posts_list to see the available slugs.",
          nextSteps: ["blog_posts_list"],
        });
      }
      if (expected_sha && expected_sha !== current.sha) {
        throw new OperationError("CONFLICT", "The post changed since it was read.", {
          field: "expected_sha",
          guidance: "Call blog_posts_read again and retry the deletion with the fresh sha.",
          nextSteps: ["blog_posts_read"],
        });
      }

      const commit = await deleteFile({
        token: owner.token,
        path,
        sha: current.sha,
        message: `content: remove ${safe}`,
      });

      return {
        data: {
          deleted: true,
          verified: (await readFile(owner.token, path)) === null,
          slug: safe,
          commit_sha: commit.commitSha,
        },
        userMessage: `Deleted the post "${safe}".`,
        nextSteps: ["blog_posts_list"],
      };
    }),
});
