import { auth, defineMcp } from "@lovable.dev/mcp-js";
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
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "somrit-webcv-admin",
  title: "Somrit Dasgupta — Site Admin",
  version: "0.1.0",
  instructions:
    "Authoring tools for somritdasgupta.in. Create, update, and delete MDX blog posts in the site's content repository. Every call requires an OAuth sign-in and the signed-in account must be on the site owner's admin allow-list. Read a post with read_post_source before updating or deleting it, and pass the returned expected_sha so concurrent edits are never silently overwritten.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listAllPosts, readPostSource, createPost, updatePost, deletePost],
});
