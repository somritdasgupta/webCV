import { defineTool } from "@lovable.dev/mcp-js";
import { ERROR_CODES } from "../errors";
import { respond } from "../response";

/**
 * Self-description endpoint.
 *
 * One call gives an assistant the full map of domains, tools, response shape,
 * error codes, and the two canonical workflows, so it does not have to infer
 * the contract from individual tool descriptions.
 */
export default defineTool({
  name: "mcp_schema_get",
  title: "Describe this server",
  description:
    "Return the complete contract of this server: tool catalogue, response envelope, error codes, and the authoring and editing workflows. Call this first when unsure which tool to use.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () =>
    respond("mcp_schema_get", () => ({
      data: {
        server: {
          name: "somrit-webcv-admin",
          title: "Somrit Dasgupta — Site Admin",
          owner: "somritdasgupta",
          purpose: "Author and maintain blog posts on somritdasgupta.in, stored as MDX in GitHub.",
        },
        naming: {
          pattern: "{domain}_{resource}_{action}",
          domains: ["blog", "mcp"],
        },
        response_envelope: {
          success: "boolean",
          data: "operation payload when success is true",
          error: "{ code, message, field?, guidance? } when success is false",
          userMessage: "single sentence safe to show the user verbatim",
          meta: "{ operation, durationMs, timestamp, nextSteps? }",
          note: "The identical payload is returned in both the text content and structuredContent channels.",
        },
        tools: [
          { name: "mcp_schema_get", auth: false, purpose: "Describe this server." },
          { name: "blog_auth_request", auth: false, purpose: "Start owner authorization." },
          { name: "blog_auth_verify", auth: false, purpose: "Poll authorization until approved." },
          { name: "blog_components_list", auth: false, purpose: "List supported MDX components." },
          { name: "blog_posts_suggest_slug", auth: false, purpose: "Derive slug candidates from a title." },
          { name: "blog_posts_validate", auth: false, purpose: "Check a draft against every rule." },
          { name: "blog_posts_list", auth: true, purpose: "List posts including drafts." },
          { name: "blog_posts_read", auth: true, purpose: "Read source, frontmatter, and sha." },
          { name: "blog_posts_create", auth: true, purpose: "Publish a new post." },
          { name: "blog_posts_update", auth: true, purpose: "Edit an existing post." },
          { name: "blog_posts_delete", auth: true, purpose: "Remove a post." },
        ],
        workflows: {
          publish: [
            "blog_components_list (optional, before rich MDX)",
            "blog_posts_validate",
            "blog_auth_request — show device_code and verification_url only",
            "blog_auth_verify — repeat with the same auth_token while status is pending",
            "blog_posts_create with session_token",
            "Report success only when published and verified are true and commit_sha is present",
          ],
          edit: [
            "blog_auth_request",
            "blog_auth_verify",
            "blog_posts_read — keep the returned sha",
            "blog_posts_update with expected_sha",
          ],
        },
        rules: [
          "Never show auth_token, session_token, or any GitHub token to the user.",
          "Pending authorization is normal — keep polling, never restart while time remains.",
          "Authorization succeeding is not the same as content changing.",
          "Read before updating or deleting, and pass expected_sha.",
        ],
        error_codes: ERROR_CODES,
      },
    })),
});
