import { defineTool } from "@lovable.dev/mcp-js";
import { OperationError } from "../errors";
import { sessionTokenField, slugField } from "../fields";
import { pathForSlug, readFile } from "../github";
import { parseFrontmatter } from "../mdx";
import { ownerOperation } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_read",
  title: "Read a post",
  description:
    "Read one post's frontmatter, body, and blob sha. Always read before updating or deleting, and pass the returned sha as expected_sha.",
  inputSchema: { session_token: sessionTokenField, slug: slugField },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, slug }) =>
    ownerOperation("blog_posts_read", session_token, async (owner) => {
      const safe = normalizeSlug(slug);
      const file = await readFile(owner.token, pathForSlug(safe));
      if (!file) {
        throw new OperationError("POST_NOT_FOUND", `No post exists with slug "${safe}".`, {
          field: "slug",
          guidance: "Call blog_posts_list to see the available slugs.",
          nextSteps: ["blog_posts_list"],
        });
      }
      const { data, body } = parseFrontmatter(file.content);
      return {
        data: {
          slug: safe,
          sha: file.sha,
          frontmatter: data,
          body,
          source: file.content,
          url: `https://somritdasgupta.in/blog/${safe}`,
        },
        nextSteps: ["blog_posts_update", "blog_posts_delete"],
      };
    }),
});
