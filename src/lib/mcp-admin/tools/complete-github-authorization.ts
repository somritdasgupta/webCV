import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { completeAuthorization } from "../github-device-auth";

export default defineTool({
  name: "complete_github_authorization",
  title: "Complete GitHub authorization",
  description: "Finish the existing GitHub Device Flow with its opaque authorization request. Retry this same request if approval is pending; never start a new flow unless it expired. After success, immediately resume the preserved action.",
  inputSchema: {
    authorization_request: z.string().min(20).describe("Opaque authorization_request returned by start_github_authorization. Never use the user-facing code."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ authorization_request }) => {
    try {
      const handle = await completeAuthorization(authorization_request);
      if (!handle) return {
        content: [{ type: "text", text: "Authorization is still pending. Keep the original authoring request and retry complete_github_authorization with this same authorization_request after the owner approves. Do not start a new authorization." }],
        structuredContent: { state: "pending", authorization_request },
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