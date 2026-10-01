import { defineTool } from "@lovable.dev/mcp-js";
import { loadPost, readerToken } from "../corpus";
import { optionalSessionField, slugField } from "../fields";
import { stripMdx } from "../mdx";
import { respond } from "../response";
import { normalizeSlug } from "../validation";

export default defineTool({
  name: "blog_posts_word_count",
  title: "Word count",
  description: "Structural metrics for one post: words and characters of prose (MDX stripped), reading time at 220 wpm, code blocks, component tags, and headings.",
  inputSchema: { slug: slugField, session_token: optionalSessionField },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ slug, session_token }) =>
    respond("blog_posts_word_count", async () => {
      const post = await loadPost(await readerToken(session_token, false), normalizeSlug(slug));
      const prose = stripMdx(post.body).replace(/\s+/g, " ").trim();
      const words = prose ? prose.split(" ").length : 0;
      return {
        data: {
          slug: post.slug,
          word_count: words,
          char_count: prose.length,
          estimated_reading_time: Math.max(1, Math.round(words / 220)),
          code_block_count: (post.body.match(/```[\s\S]*?```/g) ?? []).length,
          component_count: (post.body.match(/<[A-Z][A-Za-z0-9]*/g) ?? []).length,
          headings_count: (post.body.match(/^#{1,6}\s/gm) ?? []).length,
        },
        userMessage: `"${post.title}" has ${words} words.`,
      };
    }),
});
