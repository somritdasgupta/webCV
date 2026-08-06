import { authorizedGitHub } from "./github-device-auth";

export interface AdminIdentity {
  login: string;
  token: string;
}

const errorResult = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true as const,
  structuredContent: { error: message },
});

/**
 * Run an admin-only tool body.
 *
 * Authorization, error shaping, and JSON serialization live here so every write
 * tool has identical semantics: a guard failure or a GitHub error becomes an
 * `isError` MCP result carrying the reason, never an unhandled throw.
 */
export async function adminTool<T>(
  ownerSession: string,
  run: (admin: AdminIdentity) => Promise<T> | T,
) {
  try {
    const value = await run(await authorizedGitHub(ownerSession));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
      structuredContent: value as Record<string, unknown>,
    };
  } catch (e) {
    return errorResult(e instanceof Error ? e.message : String(e));
  }
}
