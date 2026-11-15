import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { rebuild } from "../bulk";
import { hasTag, loadCorpus } from "../corpus";
import { OperationError } from "../errors";
import { sessionTokenField } from "../fields";
import { commitFiles } from "../github";
import { ownerOperation } from "../response";

export default defineTool({
  name: "blog_posts_tag_rename",
  title: "Rename a tag",
  description: "Rename a tag on every post that carries it (case-insensitive), in ONE commit. Other tags are kept; duplicates are merged.",
  inputSchema: {
    session_token: sessionTokenField,
    old_tag: z.string().trim().min(1).describe("Tag to replace."),
    new_tag: z.string().trim().min(1).describe("Replacement tag."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, old_tag, new_tag }) =>
    ownerOperation("blog_posts_tag_rename", session_token, async (owner) => {
      const affected = (await loadCorpus(owner.token)).filter((p) => hasTag(p, old_tag));
      if (!affected.length) {
        throw new OperationError("TAG_NOT_FOUND", `No post carries the tag "${old_tag}".`, {
          field: "old_tag",
          guidance: "Call blog_posts_stats to see existing tags.",
        });
      }
      const changes = affected.map((p) => {
        const tags = [...new Set(p.tags.map((t) => (t.toLowerCase() === old_tag.toLowerCase() ? new_tag : t)))];
        return { path: p.path, content: rebuild(p, { tags }) };
      });
      const { commitSha } = await commitFiles(owner.token, changes, `content: rename tag ${old_tag} -> ${new_tag}`);
      return {
        data: { old_tag, new_tag, updated_count: affected.length, affected_posts: affected.map((p) => p.slug), commit_sha: commitSha },
        userMessage: `Renamed "${old_tag}" to "${new_tag}" on ${affected.length} posts.`,
      };
    }),
});
