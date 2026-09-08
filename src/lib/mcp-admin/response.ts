import { OperationError, toOperationError, type ErrorCode } from "./errors";
import { authorizedGitHub } from "./github-device-auth";

/**
 * One response envelope for every admin tool.
 *
 * Assistants parse a single shape regardless of which tool ran: `success`
 * decides the branch, `data` carries the payload, `error` carries a code plus
 * the exact recovery step, and `meta` carries operation telemetry.
 */
export interface ResponseMeta {
  operation: string;
  durationMs: number;
  timestamp: string;
  nextSteps?: string[];
}

export interface ResponseError {
  code: ErrorCode;
  message: string;
  field?: string;
  guidance?: string;
}

export interface ToolResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ResponseError;
  userMessage?: string;
  meta: ResponseMeta;
}

export interface Outcome<T> {
  data: T;
  /** Single plain sentence an assistant can show the user verbatim. */
  userMessage?: string;
  nextSteps?: string[];
}

const serialize = (payload: ToolResponse) => JSON.stringify(payload, null, 2);

/**
 * Run a tool body and wrap it in the standard envelope.
 *
 * The identical payload is emitted in both channels — `content` text and
 * `structuredContent` — because clients differ in which one they surface.
 */
export async function respond<T>(
  operation: string,
  run: () => Promise<Outcome<T>> | Outcome<T>,
) {
  const startedAt = Date.now();
  const timestamp = () => new Date().toISOString();

  try {
    const outcome = await run();
    const payload: ToolResponse<T> = {
      success: true,
      data: outcome.data,
      userMessage: outcome.userMessage,
      meta: {
        operation,
        durationMs: Date.now() - startedAt,
        timestamp: timestamp(),
        nextSteps: outcome.nextSteps,
      },
    };
    return {
      content: [{ type: "text" as const, text: serialize(payload) }],
      structuredContent: payload as unknown as Record<string, unknown>,
    };
  } catch (error) {
    const failure = toOperationError(error);
    const payload: ToolResponse<never> = {
      success: false,
      error: {
        code: failure.code,
        message: failure.message,
        field: failure.field,
        guidance: failure.guidance,
      },
      meta: {
        operation,
        durationMs: Date.now() - startedAt,
        timestamp: timestamp(),
        nextSteps: failure.nextSteps,
      },
    };
    return {
      content: [{ type: "text" as const, text: serialize(payload) }],
      structuredContent: payload as unknown as Record<string, unknown>,
      isError: true as const,
    };
  }
}

export interface OwnerIdentity {
  login: string;
  token: string;
}

/** Resolve the owner session, converting any auth failure into a coded error. */
export async function requireOwner(sessionToken: string): Promise<OwnerIdentity> {
  if (!sessionToken?.trim()) {
    throw new OperationError("AUTH_REQUIRED", "No session token was supplied.", {
      field: "session_token",
      guidance: "Call blog_auth_request, poll blog_auth_verify until approved, then retry with the returned session_token.",
      nextSteps: ["blog_auth_request", "blog_auth_verify"],
    });
  }
  try {
    return await authorizedGitHub(sessionToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new OperationError("AUTH_EXPIRED", message, {
      field: "session_token",
      guidance: "The session is no longer valid. Call blog_auth_request to create a new one, then retry this operation.",
      nextSteps: ["blog_auth_request", "blog_auth_verify"],
    });
  }
}

/** Owner-only tool body: authorize, run, and wrap in the standard envelope. */
export function ownerOperation<T>(
  operation: string,
  sessionToken: string,
  run: (owner: OwnerIdentity) => Promise<Outcome<T>> | Outcome<T>,
) {
  return respond(operation, async () => run(await requireOwner(sessionToken)));
}
