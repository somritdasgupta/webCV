import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { adminTool } from "../guard";
import { pathForSlug, readFile, safeSlug } from "../github";
import { parseFrontmatter } from "../mdx";

export default defineTool({
  name: "read_post_source",
  title: "Read post source",
  description:
    "Read the raw MDX source, parsed frontmatter, and current blob SHA of a post — including drafts. The SHA is required to update or delete the post safely.",
  inputSchema: {
    authorization: z.string().min(1).describe("Short-lived handle returned by complete_github_authorization."),
    slug: z.string().min(1).describe("Post slug, e.g. 'hello-world'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: ({ slug, authorization }) =>
    adminTool(authorization, async (admin) => {
      const clean = safeSlug(slug);
      const path = pathForSlug(clean);
      const file = await readFile(admin.token, path);
      if (!file) throw new Error(`Post not found: ${clean}`);
      const { data, body } = parseFrontmatter(file.content);
      return {
        slug: clean,
        path,
        sha: file.sha,
        frontmatter: data,
        body,
        source: file.content,
      };
    }),
});
