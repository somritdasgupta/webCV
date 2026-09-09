import { defineTool } from "@lovable.dev/mcp-js";
import { createAuthorization } from "../github-device-auth";
import { respond } from "../response";

/**
 * Step 1 of authorization.
 *
 * Returns a short user-facing device code plus an opaque `auth_token` the
 * assistant keeps to itself. Both channels (text and structuredContent) carry
 * the identical payload so no client can lose the token.
 */
export default defineTool({
  name: "blog_auth_request",
  title: "Request publishing authorization",
  description:
    "Start owner authorization for blog writes. Show device_code and verification_url to the user, keep auth_token internal, then poll blog_auth_verify with that auth_token.",
  inputSchema: {},
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: true },
  handler: async () =>
    respond("blog_auth_request", async () => {
      const authorization = await createAuthorization();
      return {
        data: {
          device_code: authorization.userCode,
          verification_url: authorization.verificationUri,
          auth_token: authorization.authorizationRequest,
          expires_in_seconds: authorization.expiresIn,
          poll_interval_seconds: authorization.interval,
          poll_until: authorization.pollUntil,
          user_action: `Open ${authorization.verificationUri} and enter the code ${authorization.userCode}.`,
        },
        userMessage: `Open ${authorization.verificationUri} and enter the code ${authorization.userCode}. I will continue as soon as GitHub confirms the approval.`,
        nextSteps: ["blog_auth_verify"],
      };
    }),
});
