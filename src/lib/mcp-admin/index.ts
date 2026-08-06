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
  version: "0.3.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting requires no login. For a protected action without an owner_session, immediately call start_github_authorization, retain the complete requested operation, show the device code, then call complete_github_authorization after approval and pass its owner_session directly to the preserved tool call. The owner_session is an opaque workflow value, not a GitHub token. A completed authorization is not a completed publish. Never say a post was published, updated, or deleted unless the mutation tool returns published/updated/deleted: true, verified: true, and a commitSha. If a tool returns isError, an empty result, or no commitSha, report that publishing was not confirmed. Use get_mdx_components before composing rich MDX. Read a post before updating or deleting it and pass expected_sha.",
  tools: [startGitHubAuthorization, completeGitHubAuthorization, getMdxComponents, listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
