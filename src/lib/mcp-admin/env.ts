/**
 * Runtime env access for the admin MCP edge function.
 *
 * Import-safe by construction: nothing here reads the environment at module
 * evaluation time. The MCP entry is evaluated twice in places where secrets do
 * not exist (build-time manifest extraction and Deno cold start), so every
 * lookup has to happen inside a tool handler.
 */

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

export function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  const value = runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
  return value?.trim() || undefined;
}

/** GitHub PAT with `contents:write` on the content repo. Server-side only. */
export function githubToken(): string {
  const token = runtimeEnv("GITHUB_ADMIN_TOKEN");
  if (!token) {
    throw new Error(
      "GITHUB_ADMIN_TOKEN is not configured on the server. The site owner must add it before write tools can run.",
    );
  }
  return token;
}

/** Comma-separated allow-list of emails permitted to mutate content. */
export function adminEmails(): string[] {
  return (runtimeEnv("MCP_ADMIN_EMAILS") ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
