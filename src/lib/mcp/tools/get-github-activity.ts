import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const USER = "somritdasgupta";

export default defineTool({
  name: "get_github_activity",
  title: "Get GitHub activity",
  description:
    "Return recent public GitHub activity for somritdasgupta: commits, pull requests, releases, and stars.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Max events to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const res = await fetch(
      `https://api.github.com/users/${USER}/events/public?per_page=${limit ?? 20}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `GitHub API error: ${res.status}` }],
        isError: true,
      };
    }
    const events = (await res.json()) as Array<{
      type: string;
      repo: { name: string };
      created_at: string;
      payload: Record<string, unknown>;
    }>;
    const summary = events.map((e) => ({
      type: e.type,
      repo: e.repo.name,
      at: e.created_at,
      ref: (e.payload as { ref?: string }).ref,
      commits: (e.payload as { commits?: Array<{ message: string; sha: string }> }).commits
        ?.map((c) => ({ sha: c.sha.slice(0, 7), message: c.message })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: { events: summary },
    };
  },
});
