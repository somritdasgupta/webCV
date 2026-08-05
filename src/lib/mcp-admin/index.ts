import { defineMcp } from "@lovable.dev/mcp-js";
import startGitHubAuthorization from "./tools/start-github-authorization";
import completeGitHubAuthorization from "./tools/complete-github-authorization";
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
 *
 * The issuer is built from the project ref (inlined by Vite at build time)
 * rather than SUPABASE_URL, which on Lovable Cloud is a proxy host whose
 * discovery document advertises a different issuer (RFC 8414 §3.3).
 */
export default defineMcp({
  name: "somrit-webcv-admin",
  title: "Somrit Dasgupta — Site Admin",
  version: "0.2.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting this server requires no login. When the owner requests any protected action and no current authorization handle is available, autonomously call start_github_authorization immediately; do not ask the owner to initiate authentication. Show the returned user_code and verification_uri, retain the requested operation and its complete content, then call complete_github_authorization after approval and immediately continue the original operation with the returned one-hour handle. Never claim create_post, update_post, or delete_post is unavailable when it appears in tools/list. Use get_mdx_components before composing rich MDX. Read a post before updating or deleting it and pass expected_sha to prevent stale writes.",
  tools: [startGitHubAuthorization, completeGitHubAuthorization, getMdxComponents, listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
