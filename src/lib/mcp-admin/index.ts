import { defineMcp } from "@lovable.dev/mcp-js";
import mcpSchemaGet from "./tools/mcp-schema-get";
import blogAuthRequest from "./tools/blog-auth-request";
import blogAuthVerify from "./tools/blog-auth-verify";
import blogComponentsList from "./tools/blog-components-list";
import blogPostsSuggestSlug from "./tools/blog-posts-suggest-slug";
import blogPostsValidate from "./tools/blog-posts-validate";
import blogPostsList from "./tools/blog-posts-list";
import blogPostsRead from "./tools/blog-posts-read";
import blogPostsCreate from "./tools/blog-posts-create";
import blogPostsUpdate from "./tools/blog-posts-update";
import blogPostsDelete from "./tools/blog-posts-delete";

/**
 * Admin (write) MCP server.
 *
 * Deliberately a SECOND server, separate from the public read-only `mcp`
 * function: mcp-js applies auth per server, so folding write tools into the
 * public one would force every anonymous reader through OAuth. Splitting them
 * keeps the public surface open and the mutating surface locked.
 *
 * Naming follows a {domain}_{resource}_{action} pattern. Dots are avoided
 * because several MCP clients reject tool names containing `.`.
 */
export default defineMcp({
  name: "somrit-webcv-admin",
  title: "Somrit Dasgupta — Site Admin",
  version: "1.0.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting requires no login. Every tool returns one envelope: success, data, error {code, message, field, guidance}, meta {operation, nextSteps}. Follow error.guidance and meta.nextSteps literally. Call mcp_schema_get when unsure which tool to use. Before publishing, call blog_posts_validate and fix every reported issue. For any write: call blog_auth_request once, show the user only user_code and verification_uri, then poll blog_auth_verify with the same auth_token until approved, denied, or expired. Pending is expected; keep polling, never ask the user to confirm, and never start a second authorization while seconds_remaining is positive. On approved, immediately retry the original tool with session_token, which is valid for one hour. Authorization alone never means content changed: report success only when the mutation returns published/updated/deleted true, verified true, and a commit_sha. Call blog_components_list before writing rich MDX. Call blog_posts_read before updating or deleting and pass expected_sha.",
  tools: [
    mcpSchemaGet,
    blogAuthRequest,
    blogAuthVerify,
    blogComponentsList,
    blogPostsSuggestSlug,
    blogPostsValidate,
    blogPostsList,
    blogPostsRead,
    blogPostsCreate,
    blogPostsUpdate,
    blogPostsDelete,
  ],
});
