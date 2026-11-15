import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { respond } from "../response";
import { normalizeSlug, slugCandidates } from "../validation";

export default defineTool({
  name: "blog_posts_suggest_slug",
  title: "Suggest a slug",
  description:
    "Turn a title into valid kebab-case slug candidates. Requires no authorization. Use the first candidate unless it is already taken.",
  inputSchema: { title: z.string().min(1).describe("The post title to derive slugs from.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ title }) =>
    respond("blog_posts_suggest_slug", () => ({
      data: { preferred: normalizeSlug(title), candidates: slugCandidates(title) },
      nextSteps: ["blog_posts_validate", "blog_posts_create"],
    })),
});
