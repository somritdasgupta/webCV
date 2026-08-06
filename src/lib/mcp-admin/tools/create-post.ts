import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { adminTool } from "../guard";
import { pathForSlug, readFile, safeSlug, writeFile } from "../github";
import { buildMdx, estimateReadingTime } from "../mdx";

export default defineTool({
  name: "create_post",
  title: "Create blog post",
  description:
    "Create and publish a new MDX blog post by committing it to the content repository. This tool is available whenever advertised by tools/list. Use the authorization handle returned by complete_github_authorization; if none is active, call start_github_authorization automatically and preserve this complete request. Custom components from get_mdx_components are supported in body. Fails if the slug exists; set a future date to schedule or draft to hide it.",
  inputSchema: {
    owner_session: z.string().min(1).describe("One-hour owner session returned by complete_github_authorization. This is an opaque workflow value, not a GitHub token."),
    slug: z
      .string()
      .min(1)
      .describe("URL slug, e.g. 'why-rust-wins'. Normalized to lowercase kebab-case."),
    title: z.string().trim().min(1).max(120).describe("Post title."),
    description: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .describe("Meta description, kept under 160 characters for SEO."),
    body: z
      .string()
      .min(1)
      .describe("Complete post body in Markdown/MDX, without frontmatter. Custom components returned by get_mdx_components are supported."),
    date: z
      .string()
      .optional()
      .describe("ISO 8601 publish date. Defaults to now. A future date schedules the post."),
    tags: z.array(z.string().trim().min(1)).max(8).optional().describe("Topic tags."),
    cover: z.string().url().optional().describe("Absolute cover image URL."),
    draft: z
      .boolean()
      .optional()
      .describe("Keep the post hidden from the public site when true."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: (input) =>
    adminTool(input.owner_session, async (admin) => {
      const slug = safeSlug(input.slug);
      const path = pathForSlug(slug);

      if (await readFile(admin.token, path)) {
        throw new Error(
          `Post '${slug}' already exists. Use update_post to modify it, or pick another slug.`,
        );
      }

      const date = input.date ? new Date(input.date) : new Date();
      if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${input.date}`);

      const mdx = buildMdx(
        {
          title: input.title,
          description: input.description,
          date: date.toISOString(),
          tags: input.tags,
          cover: input.cover,
          draft: input.draft,
          readingTime: estimateReadingTime(input.body),
        },
        input.body,
      );

      const result = await writeFile({
        token: admin.token,
        path,
        content: mdx,
        message: `content: add "${input.title}" (via MCP by ${admin.login})`,
      });

      const committed = await readFile(admin.token, path);
      if (!committed || committed.sha !== result.fileSha || committed.content !== mdx) {
        throw new Error("GitHub accepted the write but commit verification failed. Publishing was not confirmed; check the repository before retrying.");
      }

      return {
        published: true,
        verified: true,
        slug,
        path,
        url: `https://somritdasgupta.in/blog/${slug}`,
        scheduled: date.getTime() > Date.now(),
        draft: input.draft === true,
        ...result,
        message: `Published and verified commit ${result.commitSha}.`,
      };
    }),
});
