import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MDX_COMPONENTS } from "../mdx-components";

export default defineTool({
  name: "get_mdx_components",
  title: "Get MDX components",
  description: "List the custom MDX components supported by blog posts, with valid examples ready to use in create_post or update_post bodies.",
  inputSchema: {
    name: z.string().trim().optional().describe("Optional component name to return, such as Chart or Embed."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ name }) => {
    const components = name
      ? MDX_COMPONENTS.filter((component) => component.name.toLowerCase() === name.toLowerCase())
      : MDX_COMPONENTS;
    if (name && components.length === 0) {
      return {
        content: [{ type: "text", text: `Unknown MDX component: ${name}. Call get_mdx_components without a name to list all supported components.` }],
        structuredContent: { components: [], supported: MDX_COMPONENTS.map((component) => component.name) },
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: components.map((component) => `${component.name}: ${component.purpose}\n${component.example}`).join("\n\n") }],
      structuredContent: { components },
    };
  },
});