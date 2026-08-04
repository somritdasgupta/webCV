import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { adminTool } from "../guard";
import { deleteFile, pathForSlug, readFile, safeSlug } from "../github";
import { parseFrontmatter } from "../mdx";

export default defineTool({
  name: "delete_post",
  title: "Delete blog post",
  description:
    "Permanently delete a published MDX post from the content repository. Requires confirm: true, so a model cannot delete a post by accident. Prefer update_post with draft: true to unpublish without losing content.",
  inputSchema: {
    authorization: z.string().min(1).describe("Short-lived handle returned by complete_github_authorization."),
    slug: z.string().min(1).describe("Slug of the post to delete."),
    confirm: z
      .literal(true)
      .describe("Must be true. Explicit acknowledgement that the file will be removed."),
    expected_sha: z
      .string()
      .optional()
      .describe("Blob SHA from read_post_source. Rejects the delete if the file changed since."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  handler: (input) =>
    adminTool(input.authorization, async (admin) => {
      const slug = safeSlug(input.slug);
      const path = pathForSlug(slug);

      const file = await readFile(admin.token, path);
      if (!file) throw new Error(`Post not found: ${slug}. Nothing was deleted.`);
      if (input.expected_sha && input.expected_sha !== file.sha) {
        throw new Error(
          `Stale delete rejected: the post changed since you read it (expected ${input.expected_sha}, found ${file.sha}).`,
        );
      }

      const { data } = parseFrontmatter(file.content);
      const { commitSha } = await deleteFile({
        token: admin.token,
        path,
        sha: file.sha,
        message: `content: delete "${slug}" (via MCP by ${admin.login})`,
      });

      return {
        slug,
        path,
        deleted: true,
        title: String(data.title ?? slug),
        commitSha,
      };
    }),
});
