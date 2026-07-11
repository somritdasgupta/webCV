import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_author_info",
  title: "Get author info",
  description:
    "Return public bio and contact links for Somrit Dasgupta (site owner). Use this for 'who is somrit' style questions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "Somrit Dasgupta",
      role: "Software Engineer",
      location: "Kolkata, India",
      bio: "Software Engineer building backend systems and AI tools on AWS. Works with LangGraph, AWS Bedrock, and contributes to open source.",
      site: "https://somritdasgupta.in",
      email: "thesomritdasgupta@gmail.com",
      links: {
        github: "https://github.com/somritdasgupta",
        linkedin: "https://www.linkedin.com/in/somritdasgupta",
        x: "https://x.com/kitsomrit",
      },
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
