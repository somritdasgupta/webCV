import { defineTool } from "@lovable.dev/mcp-js";
import { readRaw } from "../github";
import { respond } from "../response";

export const SETTINGS_PATH = "content/site.json";
export const DEFAULT_RESUME_URL = "https://rxresu.me/somritdasgupta/somrits-resume";

export async function currentResumeUrl(): Promise<string> {
  const raw = await readRaw(SETTINGS_PATH);
  if (!raw) return DEFAULT_RESUME_URL;
  try {
    const parsed = JSON.parse(raw) as { resumeUrl?: unknown };
    return typeof parsed.resumeUrl === "string" ? parsed.resumeUrl : DEFAULT_RESUME_URL;
  } catch {
    return DEFAULT_RESUME_URL;
  }
}

export default defineTool({
  name: "site_resume_get",
  title: "Get CV link",
  description: "Return the CV download link opened by the site's /cv address. Requires no authorization.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async () =>
    respond("site_resume_get", async () => {
      const resume_url = await currentResumeUrl();
      return { data: { resume_url, path: SETTINGS_PATH }, userMessage: `The /cv address opens ${resume_url}.` };
    }),
});
