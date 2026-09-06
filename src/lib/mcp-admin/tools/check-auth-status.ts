import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { pollAuthorization } from "../github-device-auth";

export default defineTool({
  name: "check_auth_status",
  title: "Check authorization status",
  description:
    "Poll the pending GitHub approval. Blocks briefly while waiting, so call it repeatedly with the same authorization_request until status is approved, denied, or expired. Pending is not an error. On approved, pass owner_session straight into the preserved authoring tool.",
  inputSchema: {
    authorization_request: z
      .string()
      .min(20)
      .describe("Opaque authorization_request from authenticate_for_blog_posting. Never the user-facing code."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ authorization_request }) => {
    try {
      const status = await pollAuthorization(authorization_request);
      return {
        content: [{ type: "text", text: status.detail }],
        structuredContent: {
          status: status.status,
          owner_session: status.ownerSession,
          time_remaining: status.timeRemaining,
          authorization_request: status.status === "pending" ? authorization_request : undefined,
          detail: status.detail,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: message }], structuredContent: { status: "expired", owner_session: null, time_remaining: 0, detail: message }, isError: true };
    }
  },
});
