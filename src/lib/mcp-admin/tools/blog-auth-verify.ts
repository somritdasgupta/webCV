import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { OperationError } from "../errors";
import { pollAuthorization } from "../github-device-auth";
import { respond } from "../response";

type AuthVerifyData =
  | { status: "approved"; session_token: string; expires_in_seconds: number; guidance: string }
  | { status: "pending"; seconds_remaining: number; auth_token: string; guidance: string };

/**
 * Step 2 of authorization.
 *
 * The call long-polls GitHub, so `pending` normally means the user has simply
 * not approved yet: repeat the call with the same `auth_token`.
 */
export default defineTool({
  name: "blog_auth_verify",
  title: "Verify publishing authorization",
  description:
    "Poll the authorization started by blog_auth_request. Repeat with the same auth_token while status is pending. On approved, use the returned session_token for every blog write.",
  inputSchema: {
    auth_token: z
      .string()
      .min(1)
      .describe("The exact opaque auth_token returned by blog_auth_request. Never shown to the user."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async ({ auth_token }) =>
    respond<AuthVerifyData>("blog_auth_verify", async () => {
      const status = await pollAuthorization(auth_token);

      if (status.status === "approved" && status.ownerSession) {
        return {
          data: {
            status: "approved" as const,
            session_token: status.ownerSession,
            expires_in_seconds: 3600,
            guidance: "Use session_token for every blog operation. It is valid for one hour.",
          },
          userMessage: "Authorization confirmed. Continuing with the requested change.",
          nextSteps: ["retry the original authoring tool with session_token"],
        };
      }

      if (status.status === "pending") {
        return {
          data: {
            status: "pending" as const,
            seconds_remaining: status.timeRemaining,
            auth_token,
            guidance: "The approval is not confirmed yet. Call blog_auth_verify again with the same auth_token. Do not ask the user to confirm and do not start a new authorization.",
          },
          nextSteps: ["blog_auth_verify"],
        };
      }

      throw new OperationError(
        status.status === "denied" ? "AUTH_DENIED" : "AUTH_EXPIRED",
        status.detail,
        {
          field: "auth_token",
          guidance: "Call blog_auth_request to start a new authorization, then poll blog_auth_verify again.",
          nextSteps: ["blog_auth_request", "blog_auth_verify"],
        },
      );
    }),
});
