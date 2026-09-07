import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createAuthorization } from "../github-device-auth";

export default defineTool({
  name: "authenticate_for_blog_posting",
  title: "Authenticate for blog posting",
  description:
    "Start owner verification for any authoring action. Call this automatically when no owner_session is active, keep the pending authoring request in memory, show the user_code with a live countdown of expires_in, then poll check_auth_status with the returned authorization_request until it reports approved. Never ask the user to confirm manually and never start a second authentication while the first is valid.",
  inputSchema: {},
  outputSchema: {
    user_code: z.string(),
    verification_uri: z.string().url(),
    authorization_request: z.string().min(20),
    expires_in: z.number().int().positive(),
    poll_until: z.string(),
    interval: z.number().positive(),
    owner_session: z.null(),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async () => {
    const authorization = await createAuthorization();
    const payload = {
      user_code: authorization.userCode,
      verification_uri: authorization.verificationUri,
      authorization_request: authorization.authorizationRequest,
      expires_in: authorization.expiresIn,
      poll_until: authorization.pollUntil,
      interval: authorization.interval,
      owner_session: null,
    };
    return {
      content: [{
        type: "text",
        text: `Owner approval required. Open ${authorization.verificationUri} and enter code ${authorization.userCode}. Immediately call check_auth_status with authorization_request from the JSON below. Reuse that exact value while pending; do not restart authentication or ask for confirmation.\n\n${JSON.stringify(payload, null, 2)}`,
      }],
      structuredContent: payload,
    };
  },
});
