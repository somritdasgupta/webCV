import { defineMcp } from "@lovable.dev/mcp-js";
import authenticateForBlogPosting from "./tools/authenticate-for-blog-posting";
import checkAuthStatus from "./tools/check-auth-status";
import listAllPosts from "./tools/list-all-posts";
import readPostSource from "./tools/read-post-source";
import createPost from "./tools/create-post";
import updatePost from "./tools/update-post";
import deletePost from "./tools/delete-post";
import getMdxComponents from "./tools/get-mdx-components";

/**
 * Admin (write) MCP server.
 *
 * Deliberately a SECOND server, separate from the public read-only `mcp`
 * function: mcp-js applies auth per server, so folding write tools into the
 * public one would force every anonymous reader through OAuth. Splitting them
 * keeps the public surface open and the mutating surface locked.
 */
export default defineMcp({
  name: "somrit-webcv-admin",
  title: "Somrit Dasgupta — Site Admin",
  version: "0.6.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting requires no login. When an authoring request has no owner_session, preserve every argument, call authenticate_for_blog_posting exactly once, and read authorization_request from structuredContent or the identical JSON in text. Show only user_code and verification_uri to the user. Poll check_auth_status with the exact same authorization_request until approved, denied, or expired. Pending is expected: retry it, never ask the user to confirm, and never start another authorization while time_remaining is positive. When approved, immediately call the originally requested authoring tool with owner_session. Authorization alone never means content changed: report success only when the mutation returns published/updated/deleted: true, verified: true, and commitSha. Use get_mdx_components before rich MDX. Read before updating or deleting and pass expected_sha.",
  tools: [authenticateForBlogPosting, checkAuthStatus, getMdxComponents, listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
