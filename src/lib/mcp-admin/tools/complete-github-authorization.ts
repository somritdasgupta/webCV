import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { completeAuthorization } from "../github-device-auth";

export default defineTool({
  name: "complete_github_authorization",
  title: "Complete GitHub authorization",
  description: "Finish GitHub Device Flow and return the one-hour handle. After success, immediately resume the preserved create, update, read, list, or delete request instead of asking the owner what to do next.",
  inputSchema: {
    device_code: z.string().min(1).describe("Device code returned by start_github_authorization."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ device_code }) => {
    try {
      const handle = await completeAuthorization(device_code);
      if (!handle) return {
        content: [{ type: "text", text: "Authorization is still pending. Ask the owner to finish GitHub approval, then call this tool again." }],
        structuredContent: { state: "pending" },
      };
      return {
        content: [{ type: "text", text: "GitHub owner verified. Immediately resume the preserved authoring request and pass owner_session to the target tool. Do not claim success until that tool returns published: true (or updated/deleted: true) with a commit SHA." }],
        structuredContent: { state: "ready", owner_session: handle, expires_in: 3600 },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: message }], structuredContent: { state: "failed", error: message }, isError: true };
    }
  },
});