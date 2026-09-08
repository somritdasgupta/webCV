import { OperationError } from "./errors";
import { SLUG_PATTERN } from "./fields";

export interface FieldIssue {
  field: string;
  code: string;
  message: string;
  guidance: string;
}

export interface PostDraftInput {
  slug?: string;
  title?: string;
  description?: string;
  body?: string;
  date?: string;
  tags?: string[];
  cover?: string;
}

/** Normalize an arbitrary string into a valid slug, or explain why it cannot be. */
export function normalizeSlug(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/\.mdx$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new OperationError("INVALID_SLUG", `"${input}" cannot be turned into a valid slug.`, {
      field: "slug",
      guidance: "Supply a slug containing at least one letter or digit, for example \"hello-world\".",
    });
  }
  return slug;
}

/**
 * Collect every field problem at once.
 *
 * Reporting all issues in a single pass lets an assistant repair a draft in one
 * turn instead of discovering failures one commit at a time.
 */
export function collectIssues(input: PostDraftInput, options: { requireAll: boolean }): FieldIssue[] {
  const issues: FieldIssue[] = [];
  const required = options.requireAll;

  const missing = (field: string, guidance: string) =>
    issues.push({ field, code: "VALIDATION_ERROR", message: `${field} is required.`, guidance });

  if (input.title === undefined) {
    if (required) missing("title", "Provide a title of 1-120 characters.");
  } else if (input.title.trim().length === 0) {
    issues.push({ field: "title", code: "VALIDATION_ERROR", message: "Title is empty.", guidance: "Provide a title of 1-120 characters." });
  } else if (input.title.length > 120) {
    issues.push({
      field: "title",
      code: "TITLE_TOO_LONG",
      message: `Title exceeds 120 characters (current: ${input.title.length}).`,
      guidance: `Shorten the title by ${input.title.length - 120} characters.`,
    });
  }

  if (input.description === undefined) {
    if (required) missing("description", "Provide a meta description of 20-160 characters.");
  } else if (input.description.length < 20 || input.description.length > 160) {
    issues.push({
      field: "description",
      code: "VALIDATION_ERROR",
      message: `Description must be 20-160 characters (current: ${input.description.length}).`,
      guidance: "Rewrite the description to fit the 20-160 character range used for search previews.",
    });
  }

  if (input.body === undefined) {
    if (required) missing("body", "Provide the MDX body without frontmatter.");
  } else if (input.body.trim().length === 0) {
    issues.push({ field: "body", code: "VALIDATION_ERROR", message: "Body is empty.", guidance: "Provide the MDX body without frontmatter." });
  }

  if (input.slug === undefined) {
    if (required) missing("slug", "Provide a kebab-case slug, or call blog_posts_suggest_slug with the title.");
  } else {
    try {
      normalizeSlug(input.slug);
    } catch {
      issues.push({
        field: "slug",
        code: "INVALID_SLUG",
        message: `"${input.slug}" is not a usable slug.`,
        guidance: "Call blog_posts_suggest_slug with the title to obtain valid alternatives.",
      });
    }
  }

  if (input.date !== undefined && Number.isNaN(new Date(input.date).getTime())) {
    issues.push({
      field: "date",
      code: "VALIDATION_ERROR",
      message: `"${input.date}" is not a valid ISO 8601 date.`,
      guidance: "Use a value such as \"2026-09-07\" or \"2026-09-07T14:30:00Z\".",
    });
  }

  if (input.tags && input.tags.length > 8) {
    issues.push({
      field: "tags",
      code: "VALIDATION_ERROR",
      message: `Too many tags (${input.tags.length}). Maximum is 8.`,
      guidance: "Keep the eight most relevant tags and remove the rest.",
    });
  }

  if (input.cover !== undefined && !/^https?:\/\/\S+$/.test(input.cover)) {
    issues.push({
      field: "cover",
      code: "VALIDATION_ERROR",
      message: "Cover must be an absolute http(s) URL.",
      guidance: "Supply a full URL such as \"https://example.com/images/cover.png\".",
    });
  }

  return issues;
}

/** Throw the first issue as a coded error, for tools that mutate content. */
export function assertValid(input: PostDraftInput, options: { requireAll: boolean }): void {
  const [issue] = collectIssues(input, options);
  if (!issue) return;
  throw new OperationError(issue.code as never, issue.message, {
    field: issue.field,
    guidance: issue.guidance,
    nextSteps: ["blog_posts_validate", "retry the original operation"],
  });
}

/** Deterministic slug candidates derived from a title. */
export function slugCandidates(title: string): string[] {
  const base = normalizeSlug(title);
  const words = base.split("-").filter(Boolean);
  const shortened = words.slice(0, 4).join("-");
  const candidates = [base, `${base}-2`, `${base}-3`, shortened, `${base}-${new Date().getFullYear()}`];
  return [...new Set(candidates)].filter((value) => SLUG_PATTERN.test(value));
}
