import { z } from "zod";

/**
 * Canonical input fields.
 *
 * Every tool composes its schema from these so that a field carries the same
 * name, bounds, description, and examples wherever it appears.
 */
export const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export const sessionTokenField = z
  .string()
  .min(1)
  .describe(
    "Opaque owner session returned by blog_auth_verify. Valid for one hour. Never a GitHub token and never shown to the user. Example: \"owner_session_...\".",
  );

export const slugField = z
  .string()
  .min(1)
  .describe(
    "URL-safe slug in kebab-case, normalized to lowercase. Pattern ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$. Examples: \"hello-world\", \"mcp-integration-test\".",
  );

export const titleField = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .describe(
    "Post title, 1-120 characters. Used in the page heading and meta tags. Examples: \"MCP Integration Test\", \"Getting Started with Claude\".",
  );

export const descriptionField = z
  .string()
  .trim()
  .min(20)
  .max(160)
  .describe(
    "SEO meta description, 20-160 characters. Example: \"A short introduction to MCP servers and how they work\".",
  );

export const bodyField = z
  .string()
  .min(1)
  .describe(
    "Complete post body in Markdown/MDX without frontmatter. Custom components listed by blog_components_list are supported.",
  );

export const dateField = z
  .string()
  .optional()
  .describe(
    "ISO 8601 publish date. Defaults to the current UTC time. A future value schedules the post. Examples: \"2026-09-07\", \"2026-09-07T14:30:00Z\".",
  );

export const tagsField = z
  .array(z.string().trim().min(1))
  .max(8)
  .optional()
  .describe("Topic tags for filtering, maximum 8. Example: [\"mcp\", \"api\", \"integration\"].");

export const coverField = z
  .string()
  .url()
  .optional()
  .describe(
    "Absolute URL of the cover image. 1200x630 is recommended for social previews. Example: \"https://example.com/images/cover.png\".",
  );

export const draftField = z
  .boolean()
  .optional()
  .describe("Hide the post from the public site when true. Defaults to false.");

export const expectedShaField = z
  .string()
  .optional()
  .describe(
    "Blob SHA returned by blog_posts_read. The write is rejected when the file changed since that read.",
  );

/** Shared shape for create and batch-create input. */
export const postContentShape = {
  slug: slugField,
  title: titleField,
  description: descriptionField,
  body: bodyField,
  date: dateField,
  tags: tagsField,
  cover: coverField,
  draft: draftField,
};

export const postContentObject = z.object(postContentShape);
export type PostContent = z.infer<typeof postContentObject>;
