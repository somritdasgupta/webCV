import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { OperationError } from "../errors";
import { sessionTokenField } from "../fields";
import { readFile, writeFile } from "../github";
import { ownerOperation } from "../response";
import { SETTINGS_PATH } from "./site-resume-get";

const isHttps = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export default defineTool({
  name: "site_resume_update",
  title: "Update CV link",
  description: "Change the CV download link opened by the site's cv button. Requires a session_token from blog_auth_verify.",
  inputSchema: {
    session_token: sessionTokenField,
    resume_url: z.string().trim().min(1).describe("Full https:// link to the CV file or page."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
  handler: async ({ session_token, resume_url }) =>
    ownerOperation("site_resume_update", session_token, async (owner) => {
      if (!isHttps(resume_url)) {
        throw new OperationError("VALIDATION_ERROR", "resume_url must be a valid https:// link.", {
          field: "resume_url",
          guidance: "Supply a full link that starts with https://.",
        });
      }
      const existing = await readFile(owner.token, SETTINGS_PATH);
      const content = `${JSON.stringify({ resumeUrl: resume_url }, null, 2)}\n`;
      const commit = await writeFile({
        token: owner.token,
        path: SETTINGS_PATH,
        content,
        message: "content: update CV link",
        sha: existing?.sha,
      });
      return {
        data: { updated: true, resume_url, commit_sha: commit.commitSha },
        userMessage: `The cv button now opens ${resume_url}.`,
      };
    }),
});
