import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { isPublic, loadCorpus } from "../corpus";
import { OperationError } from "../errors";
import { todayDateOnly } from "../mdx";
import { respond } from "../response";

const COOLDOWN_MS = 60_000;
let lastExportAt = 0;

/** RFC 4180 field: quote when needed, double embedded quotes. */
const csvField = (value: string | number | boolean) => {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default defineTool({
  name: "blog_posts_export",
  title: "Export metadata",
  description: "Export metadata (no bodies) of all published posts as JSON or CSV. Limited to one export per minute.",
  inputSchema: { format: z.enum(["json", "csv"]).describe("Output format.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ format }) =>
    respond("blog_posts_export", async () => {
      const wait = lastExportAt + COOLDOWN_MS - Date.now();
      if (wait > 0) {
        throw new OperationError("RATE_LIMITED", "Exports are limited to one per minute.", {
          guidance: `Retry in ${Math.ceil(wait / 1000)} seconds.`,
        });
      }
      lastExportAt = Date.now();
      const posts = (await loadCorpus())
        .filter(isPublic)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => ({ slug: p.slug, title: p.title, description: p.description, date: p.date, tags: p.tags, readingTime: p.readingTime, draft: p.draft, url: p.url }));
      const base = { format, total: posts.length, exported_at: todayDateOnly() };
      if (format === "json") return { data: { ...base, posts } };
      const header = "slug,title,description,date,tags,readingTime,draft,url";
      const rows = posts.map((p) =>
        [p.slug, p.title, p.description, p.date, p.tags.join(","), p.readingTime, p.draft, p.url].map(csvField).join(","),
      );
      return { data: { ...base, csv: [header, ...rows].join("\n") } };
    }),
});
