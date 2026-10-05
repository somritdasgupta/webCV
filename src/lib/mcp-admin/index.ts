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
import blogPostsPreview from "./tools/blog-posts-preview";
import blogPostsSearch from "./tools/blog-posts-search";
import blogPostsByTag from "./tools/blog-posts-by-tag";
import blogPostsStats from "./tools/blog-posts-stats";
import blogPostsWordCount from "./tools/blog-posts-word-count";
import blogPostsRelated from "./tools/blog-posts-related";
import blogPostsExport from "./tools/blog-posts-export";
import blogPostsGetDraftCount from "./tools/blog-posts-get-draft-count";
import blogPostsBulkUpdate from "./tools/blog-posts-bulk-update";
import blogPostsTagRename from "./tools/blog-posts-tag-rename";
import blogPostsValidateBulk from "./tools/blog-posts-validate-bulk";
import blogPostsDuplicate from "./tools/blog-posts-duplicate";
import blogPostsSchedule from "./tools/blog-posts-schedule";
import blogPostsImport from "./tools/blog-posts-import";
import siteResumeGet from "./tools/site-resume-get";
import siteResumeUpdate from "./tools/site-resume-update";

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
  version: "1.2.1",
  instructions:
    "Owner-only authoring tools for somritdasgupta.in. Connecting requires no login. Every tool returns one envelope: success, data, error {code, message, field, guidance}, meta {operation, nextSteps}. Follow error.guidance and meta.nextSteps literally. Call mcp_schema_get when unsure which tool to use. Posts are stored with `export const frontmatter = {...}` metadata and YYYY-MM-DD dates; the server writes this format automatically. Before publishing, call blog_posts_preview, show the user the returned source, and publish only after they approve. Read tools (list, search, by_tag, stats, word_count, related, export) work without a session for published posts. For any write: call blog_auth_request once, show the user only user_code and verification_uri, then poll blog_auth_verify with the same auth_token until approved, denied, or expired. While pending, show the user data.status_line (a live timer and check count) after every poll so they can see progress. Pending is expected; keep polling, never ask the user to confirm, and never start a second authorization while seconds_remaining is positive. On approved, immediately retry the original tool with session_token, which is valid for one hour. Authorization alone never means content changed: report success only when the mutation returns published/updated/deleted true, verified true, and a commit_sha. The site CV link is read with site_resume_get and changed with site_resume_update. Call blog_components_list before writing rich MDX. Call blog_posts_read before updating or deleting and pass expected_sha.",
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
    blogPostsPreview,
    blogPostsSearch,
    blogPostsByTag,
    blogPostsStats,
    blogPostsWordCount,
    blogPostsRelated,
    blogPostsExport,
    blogPostsGetDraftCount,
    blogPostsBulkUpdate,
    blogPostsTagRename,
    blogPostsValidateBulk,
    blogPostsDuplicate,
    blogPostsSchedule,
    blogPostsImport,
    siteResumeGet,
    siteResumeUpdate,
  ],
});
