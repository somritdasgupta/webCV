import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { respond } from "../response";
import { collectIssues, normalizeSlug, slugCandidates } from "../validation";

/**
 * Pre-publish check. Runs without a session so a draft can be corrected before
 * the user is ever asked to authorize anything.
 */
export default defineTool({
  name: "blog_posts_validate",
  title: "Validate a draft",
  description:
    "Check a draft against every publishing rule and return all problems at once. Requires no authorization. Run this before blog_posts_create to avoid a failed commit.",
  inputSchema: {
    title: z.string().optional().describe("Proposed title."),
    slug: z.string().optional().describe("Proposed slug."),
    description: z.string().optional().describe("Proposed meta description."),
    body: z.string().optional().describe("Proposed MDX body without frontmatter."),
    date: z.string().optional().describe("Proposed ISO 8601 publish date."),
    tags: z.array(z.string()).optional().describe("Proposed tags."),
    cover: z.string().optional().describe("Proposed cover image URL."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) =>
    respond("blog_posts_validate", () => {
      const issues = collectIssues(input, { requireAll: true });
      let normalized: string | null = null;
      try {
        normalized = input.slug ? normalizeSlug(input.slug) : input.title ? normalizeSlug(input.title) : null;
      } catch {
        normalized = null;
      }
      return {
        data: {
          valid: issues.length === 0,
          issues,
          normalized_slug: normalized,
          slug_suggestions: input.title ? slugCandidates(input.title) : [],
        },
        userMessage:
          issues.length === 0
            ? "The draft satisfies every publishing rule."
            : `The draft has ${issues.length} problem${issues.length === 1 ? "" : "s"} to fix before publishing.`,
        nextSteps: issues.length === 0 ? ["blog_auth_request", "blog_posts_create"] : ["fix the listed fields", "blog_posts_validate"],
      };
    }),
});
