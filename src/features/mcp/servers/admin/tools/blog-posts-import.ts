import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertBatchSize } from "../bulk";
import { OperationError } from "../errors";
import { sessionTokenField } from "../fields";
import { commitFiles, listPostFiles, pathForSlug } from "../github";
import { buildMdx, estimateReadingTime, parseFrontmatter, toDateOnly, todayDateOnly } from "../../../shared/mdx";
import { ownerOperation } from "../response";
import { collectIssues, normalizeSlug } from "../validation";

interface Candidate {
  title: string;
  slug?: string;
  description: string;
  body: string;
  date?: string;
  tags?: string[];
  draft?: boolean;
}

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): JsonRecord => (isRecord(value) ? value : {});

const asRecords = (value: unknown): JsonRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

/** Markdown: one document, or several separated by a line containing only `+++`. */
function fromMarkdown(content: string): Candidate[] {
  return content.split(/^\+\+\+\s*$/m).filter((d) => d.trim()).map((doc) => {
    const { data, body } = parseFrontmatter(doc.trim());
    const heading = body.match(/^#\s+(.+)$/m)?.[1];
    return {
      title: str(data.title) || heading || "",
      slug: data.slug ? str(data.slug) : undefined,
      description: str(data.description),
      body,
      date: data.date ? str(data.date) : undefined,
      tags: Array.isArray(data.tags) ? data.tags.map(str) : undefined,
      draft: data.draft === true,
    };
  });
}

function fromGhost(content: string): Candidate[] {
  const root = asRecord(JSON.parse(content));
  const database = asRecords(root.db);
  const firstDatabase = asRecord(database[0]);
  const data = asRecord(firstDatabase.data ?? root.data ?? root);
  const tagNames = new Map(asRecords(data.tags).map((tag) => [String(tag.id), str(tag.name)]));
  return asRecords(data.posts).map((post) => ({
    title: str(post.title),
    slug: typeof post.slug === "string" ? post.slug : undefined,
    description: str(post.custom_excerpt || post.meta_description || str(post.plaintext).slice(0, 157)),
    body: str(post.markdown || post.plaintext || post.html),
    date: str(post.published_at || post.created_at),
    tags: asRecords(data.posts_tags)
      .filter((relation) => String(relation.post_id) === String(post.id))
      .map((relation) => tagNames.get(String(relation.tag_id)) ?? "")
      .filter(Boolean),
    draft: post.status !== "published",
  }));
}

function fromNotion(content: string): Candidate[] {
  const parsed: unknown = JSON.parse(content);
  const root = asRecord(parsed);
  const list = Array.isArray(parsed) ? asRecords(parsed) : asRecords(root.results).length ? asRecords(root.results) : [root];
  return list.map((r) => {
    const tags = r.tags ?? r.Tags;
    return {
      title: str(r.title ?? r.Title ?? r.Name ?? r.name),
      slug: typeof (r.slug ?? r.Slug) === "string" ? String(r.slug ?? r.Slug) : undefined,
      description: str(r.description ?? r.Description ?? r.summary),
      body: str(r.body ?? r.content ?? r.Content ?? r.markdown),
      date: str(r.date ?? r.Date ?? r.created_time),
      tags: Array.isArray(tags) ? tags.map(str) : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      draft: r.draft === true || r.Status === "Draft",
    };
  });
}

const PARSERS = { markdown: fromMarkdown, ghost: fromGhost, notion: fromNotion };

export default defineTool({
  name: "blog_posts_import",
  title: "Import posts",
  description:
    "Import posts from Markdown (frontmatter + body; separate multiple documents with a line containing only +++), a Ghost JSON export, or a Notion JSON export. Valid posts are committed together in ONE commit; invalid or duplicate ones are reported and skipped.",
  inputSchema: {
    session_token: sessionTokenField,
    format: z.enum(["markdown", "ghost", "notion"]).describe("Source format."),
    content: z.string().min(1).describe("File content: Markdown text or JSON."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async ({ session_token, format, content }) =>
    ownerOperation("blog_posts_import", session_token, async (owner) => {
      let candidates: Candidate[];
      try {
        candidates = PARSERS[format](content);
      } catch (error) {
        throw new OperationError("IMPORT_FAILED", `Could not parse the ${format} content: ${error instanceof Error ? error.message : error}`, {
          field: "content",
          guidance: "Check that the content is a complete export in the selected format.",
        });
      }
      assertBatchSize(candidates.length, "content");
      const taken = new Set((await listPostFiles(owner.token)).map((f) => f.name.replace(/\.mdx$/, "")));
      const results: Array<{ status: "success" | "failed"; title: string; slug: string; reason?: string }> = [];
      const changes: Array<{ path: string; content: string }> = [];
      for (const c of candidates) {
        let slug = "";
        try {
          slug = normalizeSlug(c.slug || c.title);
        } catch {
          results.push({ status: "failed", title: c.title, slug, reason: "No usable slug or title." });
          continue;
        }
        const date = c.date ? toDateOnly(c.date) : todayDateOnly();
        const issue = collectIssues({ ...c, slug, date: date ?? c.date }, { requireAll: true })[0];
        if (issue) { results.push({ status: "failed", title: c.title, slug, reason: `${issue.field}: ${issue.message}` }); continue; }
        if (!date) { results.push({ status: "failed", title: c.title, slug, reason: "Date is invalid." }); continue; }
        if (taken.has(slug)) { results.push({ status: "failed", title: c.title, slug, reason: "Slug already exists." }); continue; }
        taken.add(slug);
        changes.push({ path: pathForSlug(slug), content: buildMdx({ title: c.title, description: c.description, date, tags: c.tags?.slice(0, 8), draft: c.draft, readingTime: estimateReadingTime(c.body) }, c.body) });
        results.push({ status: "success", title: c.title, slug });
      }
      const commit = changes.length ? await commitFiles(owner.token, changes, `content: import ${changes.length} posts from ${format}`) : null;
      const failed = results.length - changes.length;
      return {
        data: { imported: changes.length, failed, results, commit_sha: commit?.commitSha ?? null, summary: `Imported ${changes.length} of ${results.length} posts.` },
        userMessage: `Imported ${changes.length} post${changes.length === 1 ? "" : "s"}${failed ? `; ${failed} skipped` : ""}.`,
      };
    }),
});
