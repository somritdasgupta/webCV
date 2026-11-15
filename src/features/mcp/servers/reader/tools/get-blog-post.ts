import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const REPO = "somritdasgupta/webCV";
const DIR = "content/blog";

export default defineTool({
  name: "get_blog_post",
  title: "Get blog post",
  description:
    "Fetch the full MDX content and frontmatter of a single blog post by its slug (e.g. 'hello-world').",
  inputSchema: {
    slug: z
      .string()
      .min(1)
      .describe("Post slug without the .mdx extension, e.g. 'ai-hype'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ slug }) => {
    const safe = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();
    const url = `https://raw.githubusercontent.com/${REPO}/main/${DIR}/${safe}.mdx`;
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Post not found: ${safe}` }],
        isError: true,
      };
    }
    const text = await res.text();
    return {
      content: [{ type: "text", text }],
      structuredContent: {
        slug: safe,
        url: `https://somritdasgupta.in/blog/${safe}`,
        markdown: text,
      },
    };
  },
});
