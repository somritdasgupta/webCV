import { defineMcp } from "@lovable.dev/mcp-js";
import startGitHubAuthorization from "./tools/start-github-authorization";
import completeGitHubAuthorization from "./tools/complete-github-authorization";
import listAllPosts from "./tools/list-all-posts";
import readPostSource from "./tools/read-post-source";
import createPost from "./tools/create-post";
import updatePost from "./tools/update-post";
import deletePost from "./tools/delete-post";

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
  version: "0.1.0",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. First call start_github_authorization, ask the owner to approve the displayed GitHub device code, then call complete_github_authorization. Pass its short-lived authorization handle to all post tools. Read a post before updating or deleting it and pass expected_sha to prevent stale writes.",
  tools: [startGitHubAuthorization, completeGitHubAuthorization, listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
