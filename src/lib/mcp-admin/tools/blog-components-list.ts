import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MDX_BEST_PRACTICES, MDX_COMPONENTS } from "../mdx-components";
import { respond } from "../response";

export default defineTool({
  name: "blog_components_list",
  title: "List MDX components",
  description:
    "Return every custom MDX component the blog renderer supports, with category, props, and a working example. Call this before writing rich MDX.",
  inputSchema: {
    category: z
      .enum(["emphasis", "data", "layout", "media", "code", "inline"])
      .optional()
      .describe("Restrict the result to a single category."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category }) =>
    respond("blog_components_list", () => {
      const components = category ? MDX_COMPONENTS.filter((c) => c.category === category) : MDX_COMPONENTS;
      return {
        data: {
          count: components.length,
          components,
          best_practices: MDX_BEST_PRACTICES,
          notes: [
            "Standard Markdown works everywhere; these components are additions.",
            "Do not include frontmatter in the body — the tools generate it.",
          ],
        },
        nextSteps: ["blog_posts_validate", "blog_posts_create"],
      };
    }),
});
