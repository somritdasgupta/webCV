import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { completeAuthorization } from "../github-device-auth";

export default defineTool({
  name: "complete_github_authorization",
  title: "Complete GitHub authorization",
  description: "Check a GitHub Device Flow approval and return the short-lived authorization handle required by authoring tools.",
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
        content: [{ type: "text", text: "GitHub owner verified. Use the returned authorization handle for authoring tools during this session." }],
        structuredContent: { state: "ready", authorization: handle, expires_in: 3600 },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: message }], structuredContent: { state: "failed", error: message }, isError: true };
    }
  },
});