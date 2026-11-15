import { defineTool } from "@lovable.dev/mcp-js";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { postContentShape } from "../fields";
import { buildMdx, estimateReadingTime, countWords, toDateOnly, todayDateOnly } from "../mdx";
import { respond } from "../response";
import { collectIssues, normalizeSlug } from "../validation";

/** Compile with the site's MDX pipeline so syntax errors surface before any commit. */
async function compileCheck(source: string): Promise<{ ok: boolean; error: string | null }> {
  try {
    await compile(source, { remarkPlugins: [remarkGfm] });
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export default defineTool({
  name: "blog_posts_preview",
  title: "Preview a post",
  description:
    "Show exactly what blog_posts_create would commit, without writing anything: the full .mdx file, normalized metadata, validation issues, and an MDX compile check. Requires no authorization. Show the preview to the user and get approval before publishing.",
  inputSchema: postContentShape,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) =>
    respond("blog_posts_preview", async () => {
      const issues = collectIssues(input, { requireAll: true });
      let slug: string | null = null;
      try {
        slug = normalizeSlug(input.slug);
      } catch {
        slug = null;
      }
      const date = (input.date && toDateOnly(input.date)) || todayDateOnly();
      const frontmatter = {
        title: input.title,
        description: input.description,
        date,
        tags: input.tags,
        cover: input.cover,
        draft: input.draft,
        readingTime: estimateReadingTime(input.body),
      };
      const source = buildMdx(frontmatter, input.body);
      const compiled = await compileCheck(source);
      const ready = issues.length === 0 && compiled.ok && slug !== null;
      return {
        data: {
          ready,
          slug,
          path: slug ? `content/blog/${slug}.mdx` : null,
          url: slug ? `https://somritdasgupta.in/blog/${slug}` : null,
          status: input.draft ? "draft" : date > todayDateOnly() ? "scheduled" : "published",
          frontmatter,
          word_count: countWords(input.body),
          issues,
          compile: compiled,
          source,
        },
        userMessage: ready
          ? "Preview ready. Review the file below; it publishes exactly as shown."
          : "The preview found problems that must be fixed before publishing.",
        nextSteps: ready ? ["confirm with the user", "blog_auth_request", "blog_posts_create"] : ["fix issues", "blog_posts_preview"],
      };
    }),
});
