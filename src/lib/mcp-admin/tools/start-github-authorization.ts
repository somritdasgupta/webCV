import { defineTool } from "@lovable.dev/mcp-js";
import { createAuthorization } from "../github-device-auth";

export default defineTool({
  name: "start_github_authorization",
  title: "Start GitHub authorization",
  description: "Start the owner-only GitHub Device Flow required before calling blog authoring tools.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async () => {
    const authorization = await createAuthorization();
    return {
      content: [{
        type: "text",
        text: `Open ${authorization.verificationUri} and enter code ${authorization.userCode}. After approving with the somritdasgupta GitHub account, call complete_github_authorization with the device_code below.`,
      }],
      structuredContent: {
        device_code: authorization.deviceCode,
        user_code: authorization.userCode,
        verification_uri: authorization.verificationUri,
        expires_in: authorization.expiresIn,
        interval: authorization.interval,
      },
    };
  },
});