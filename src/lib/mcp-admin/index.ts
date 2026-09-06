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
  version: "0.5.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting requires no login. When an authoring request arrives without an owner_session: retain the full pending request, call authenticate_for_blog_posting exactly once, show the user_code and verification link with a countdown from expires_in, and then poll check_auth_status with the same authorization_request until it returns approved. Pending is normal, not an error; never ask the user to confirm approval and never start a second authentication while the first has time remaining. On approved, immediately resume the preserved action with owner_session. A completed authorization is not a completed publish: never claim a post was published, updated, or deleted unless the mutation tool returns published/updated/deleted: true, verified: true, and a commitSha. Use get_mdx_components before composing rich MDX. Read a post before updating or deleting it and pass expected_sha.",
  tools: [authenticateForBlogPosting, checkAuthStatus, getMdxComponents, listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
