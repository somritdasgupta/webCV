import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertBatchSize } from "../bulk";
import { respond } from "../response";
import { collectIssues, type PostDraftInput } from "../validation";

const draftShape = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  body: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cover: z.string().optional(),
  date: z.string().optional(),
  draft: z.boolean().optional(),
});

function warningsFor(post: PostDraftInput): string[] {
  const out: string[] = [];
  if (!post.tags?.length) out.push("No tags; the post will not appear in tag filters.");
  if (post.description && post.description.length < 50) out.push("Description is short; 120-160 characters preview best.");
  if (post.body && post.body.trim().split(/\s+/).length < 150) out.push("Body is under 150 words.");
  return out;
}

export default defineTool({
  name: "blog_posts_validate_bulk",
  title: "Validate drafts in bulk",
  description: "Validate up to 100 drafts against the publishing rules. Every draft is checked; all errors and warnings are returned. No authorization required.",
  inputSchema: { posts: z.array(draftShape).min(1).max(100).describe("Drafts to validate.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ posts }) =>
    respond("blog_posts_validate_bulk", () => {
      assertBatchSize(posts.length, "posts");
      const seen = new Map<string, number>();
      const invalid: Array<{ index: number; slug: string; errors: Array<{ field: string; message: string; code: string }> }> = [];
      const warnings: Array<{ index: number; slug: string; warning: string }> = [];
      posts.forEach((post, index) => {
        const slug = post.slug ?? "";
        const errors = collectIssues(post, { requireAll: true }).map(({ field, message, code }) => ({ field, message, code }));
        if (slug && seen.has(slug)) errors.push({ field: "slug", code: "SLUG_EXISTS", message: `Duplicates the slug of item ${seen.get(slug)}.` });
        seen.set(slug, index);
        if (errors.length) invalid.push({ index, slug, errors });
        for (const warning of warningsFor(post)) warnings.push({ index, slug, warning });
      });
      return {
        data: { total: posts.length, valid: posts.length - invalid.length, invalid, warnings },
        userMessage: `${posts.length - invalid.length} of ${posts.length} drafts are valid.`,
      };
    }),
});
