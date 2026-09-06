import { defineTool } from "@lovable.dev/mcp-js";
import { createAuthorization } from "../github-device-auth";

export default defineTool({
  name: "authenticate_for_blog_posting",
  title: "Authenticate for blog posting",
  description:
    "Start owner verification for any authoring action. Call this automatically when no owner_session is active, keep the pending authoring request in memory, show the user_code with a live countdown of expires_in, then poll check_auth_status with the returned authorization_request until it reports approved. Never ask the user to confirm manually and never start a second authentication while the first is valid.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async () => {
    const authorization = await createAuthorization();
    return {
      content: [{
        type: "text",
        text: `Owner approval required. Show the user: open ${authorization.verificationUri} and enter code ${authorization.userCode}. Display a countdown from ${authorization.expiresIn} seconds. Immediately begin polling check_auth_status with the authorization_request from structuredContent until it returns approved, then resume the preserved authoring request. Do not ask the user to confirm approval.`,
      }],
      structuredContent: {
        user_code: authorization.userCode,
        verification_uri: authorization.verificationUri,
        authorization_request: authorization.authorizationRequest,
        expires_in: authorization.expiresIn,
        poll_until: authorization.pollUntil,
        interval: authorization.interval,
        owner_session: null,
      },
    };
  },
});
