import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const USER = "somritdasgupta";

export default defineTool({
  name: "get_repos",
  title: "List public repos",
  description:
    "Return public GitHub repositories owned by somritdasgupta with name, description, stars, language, and URL.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("Max repos (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ limit }) => {
    const res = await fetch(
      `https://api.github.com/users/${USER}/repos?per_page=${limit ?? 30}&sort=updated`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `GitHub API error: ${res.status}` }],
        isError: true,
      };
    }
    const repos = (await res.json()) as Array<{
      full_name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      language: string | null;
      updated_at: string;
      fork: boolean;
    }>;
    const trimmed = repos
      .filter((r) => !r.fork)
      .map((r) => ({
        name: r.full_name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updated: r.updated_at,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(trimmed, null, 2) }],
      structuredContent: { repos: trimmed },
    };
  },
});
