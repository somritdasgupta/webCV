import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { adminTool } from "../guard";
import { pathForSlug, readFile, safeSlug, writeFile } from "../github";
import { buildMdx, estimateReadingTime, parseFrontmatter } from "../mdx";

export default defineTool({
  name: "update_post",
  title: "Update blog post",
  description:
    "Update an existing MDX post. Only the fields you pass are changed; everything else is preserved. Pass expected_sha from read_post_source to guard against overwriting concurrent edits.",
  inputSchema: {
    authorization: z.string().min(1).describe("Short-lived handle returned by complete_github_authorization."),
    slug: z.string().min(1).describe("Slug of the post to update."),
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().min(1).max(160).optional(),
    body: z
      .string()
      .min(1)
      .optional()
      .describe("Replacement MDX body (without frontmatter)."),
    date: z.string().optional().describe("New ISO 8601 publish date."),
    tags: z.array(z.string().trim().min(1)).max(8).optional(),
    cover: z.string().url().optional(),
    draft: z.boolean().optional().describe("Toggle draft visibility."),
    expected_sha: z
      .string()
      .optional()
      .describe("Blob SHA from read_post_source. Rejects the write if the file changed since."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: (input) =>
    adminTool(input.authorization, async (admin) => {
      const slug = safeSlug(input.slug);
      const path = pathForSlug(slug);

      const file = await readFile(admin.token, path);
      if (!file) throw new Error(`Post not found: ${slug}. Use create_post instead.`);
      if (input.expected_sha && input.expected_sha !== file.sha) {
        throw new Error(
          `Stale write rejected: the post changed since you read it (expected ${input.expected_sha}, found ${file.sha}). Re-read it and retry.`,
        );
      }

      const { data, body: currentBody } = parseFrontmatter(file.content);
      const body = input.body ?? currentBody;

      const rawDate = input.date ?? String(data.date ?? new Date().toISOString());
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${rawDate}`);

      const draft = input.draft ?? data.draft === true;
      const mdx = buildMdx(
        {
          title: input.title ?? String(data.title ?? slug),
          description: input.description ?? String(data.description ?? ""),
          date: date.toISOString(),
          tags: input.tags ?? (Array.isArray(data.tags) ? (data.tags as string[]) : undefined),
          cover: input.cover ?? (data.cover ? String(data.cover) : undefined),
          draft,
          readingTime: estimateReadingTime(body),
        },
        body,
      );

      if (mdx === file.content) {
        return { slug, path, changed: false, message: "No changes to commit." };
      }

      const result = await writeFile({
        token: admin.token,
        path,
        content: mdx,
        sha: file.sha,
        message: `content: update "${slug}" (via MCP by ${admin.login})`,
      });

      return {
        slug,
        path,
        changed: true,
        url: `https://somritdasgupta.in/blog/${slug}`,
        scheduled: date.getTime() > Date.now(),
        draft,
        ...result,
      };
    }),
});
