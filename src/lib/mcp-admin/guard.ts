/**
 * Authorization guard for the admin MCP server.
 *
 * Two independent gates, both required:
 *   1. mcp-js has already verified the OAuth bearer token against the Supabase
 *      issuer before the handler runs (`ctx.isAuthenticated()`).
 *   2. The verified identity must appear in the MCP_ADMIN_EMAILS allow-list.
 *
 * Identity is always derived from the token — never from tool input.
 */
import type { ToolContext } from "@lovable.dev/mcp-js";
import { adminEmails } from "./env";

export interface AdminIdentity {
  userId: string;
  email: string;
}

export class NotAuthorized extends Error {}

export function requireAdmin(ctx: ToolContext): AdminIdentity {
  if (!ctx.isAuthenticated()) {
    throw new NotAuthorized("Not signed in. Connect this server with OAuth first.");
  }
  const email = (ctx.getUserEmail() ?? "").toLowerCase();
  const userId = ctx.getUserId() ?? "";
  if (!email || !userId) {
    throw new NotAuthorized("Token carries no verified identity.");
  }
  const allowed = adminEmails();
  if (allowed.length === 0) {
    throw new NotAuthorized(
      "No admin allow-list configured on the server. Writes are disabled.",
    );
  }
  if (!allowed.includes(email)) {
    throw new NotAuthorized(
      `${email} is not authorized to modify content on this site.`,
    );
  }
  return { userId, email };
}

/** Wrap a handler so guard failures return a clean MCP error instead of a throw. */
export async function guarded<T>(
  ctx: ToolContext,
  run: (admin: AdminIdentity) => Promise<T> | T,
): Promise<{ ok: true; value: T } | { ok: false; message: string }> {
  try {
    return { ok: true, value: await run(requireAdmin(ctx)) };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export const errorResult = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true as const,
});
