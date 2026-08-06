import { defineTool } from "@lovable.dev/mcp-js";
import { createAuthorization } from "../github-device-auth";

export default defineTool({
  name: "start_github_authorization",
  title: "Start GitHub authorization",
  description: "Start owner verification through GitHub Device Flow. Call this automatically whenever an authoring request has no active owner session; preserve the complete pending operation while approval is in progress.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: true },
  handler: async () => {
    const authorization = await createAuthorization();
    return {
      content: [{
        type: "text",
        text: `Owner verification required. Open ${authorization.verificationUri} and enter code ${authorization.userCode}. Preserve the complete pending authoring request. After approval, call complete_github_authorization with the private device_code and immediately resume that request using its owner_session.`,
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